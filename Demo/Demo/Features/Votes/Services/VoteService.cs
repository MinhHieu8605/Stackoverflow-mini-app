using Demo.Features.Votes.DTOs;
using Demo.Features.Votes.Repositories;
using Demo.Shared.Constants;
using Demo.Shared.Domain;
using Demo.Shared.Enums;
using Demo.Shared.Exceptions;

namespace Demo.Features.Votes.Services
{
    public class VoteService : IVoteService
    {
        private readonly IVoteRepository _repository;

        public VoteService(IVoteRepository repository)
        {
            _repository = repository;
        }

        public async Task<VoteResponse> VoteAsync(long currentUserId, long postId, VoteRequest request)
        {
            // Mở transaction trước khi đọc dữ liệu để tránh race condition
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                if (request is null)
                    throw new BadRequestException("Vote request is required.");

                var post = await _repository.GetPostWithAuthorAsync(postId);
                if (post is null) 
                    throw new NotFoundException($"Post with id {postId} not found.");

                if (post.userId == currentUserId)
                    throw new BadRequestException("You cannot vote your own post.");

                var currentUser = await _repository.GetUserByIdAsync(currentUserId);
                if (currentUser is null)
                    throw new NotFoundException($"User with id {currentUserId} not found.");

                var existingVote = await _repository.GetByUserAndPostAsync(currentUserId, postId);
                var oldVoteType = existingVote?.voteType;
                
                if (!oldVoteType.HasValue && request.VoteType == VoteType.Downvote && post.voteCount > 0)
                {
                    throw new BadRequestException("Downvote is not allowed in this state.");
                }

                var newVoteType = ResolveNewVoteType(oldVoteType, request.VoteType);

                var (authorDelta, voterDelta) = CalculateReputationDelta(post.postType, oldVoteType, newVoteType);

                var postVoteDelta = (int)(newVoteType ?? 0) - (int)(oldVoteType ?? 0);

                if (existingVote is null && newVoteType.HasValue)
                {
                    await _repository.AddAsync(new Vote
                    {
                        postId = postId,
                        userId = currentUserId,
                        voteType = newVoteType.Value
                    });
                }
                else if (existingVote is not null && !newVoteType.HasValue)
                {
                    _repository.Remove(existingVote);
                }
                else if (existingVote is not null && newVoteType.HasValue)
                {
                    existingVote.voteType = newVoteType.Value;
                }

                post.voteCount += postVoteDelta;
                post.User.reputation = (post.User.reputation ?? 0) + authorDelta;
                currentUser.reputation = (currentUser.reputation ?? 0) + voterDelta;

                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                return new VoteResponse
                {
                    PostId = post.id,
                    VoteCount = post.voteCount,
                    CurrentUserVote = newVoteType,
                    CurrentUserReputation = currentUser.reputation ?? 0,
                    PostAuthorReputation = post.User.reputation ?? 0
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<VoteResponse> GetMyVoteStateAsync(long currentUserId, long postId)
        {
            var post = await _repository.GetPostWithAuthorAsync(postId);
            if (post is null)
            {
                throw new NotFoundException($"Post with id {postId} not found.");
            }

            var currentUser = await _repository.GetUserByIdAsync(currentUserId);
            if (currentUser is null)
            {
                throw new NotFoundException($"User with id {currentUserId} not found.");
            }

            var existingVote = await _repository.GetByUserAndPostAsync(currentUserId, postId);

            return new VoteResponse
            {
                PostId = post.id,
                VoteCount = post.voteCount,
                CurrentUserVote = existingVote?.voteType,
                CurrentUserReputation = currentUser.reputation ?? 0,
                PostAuthorReputation = post.User.reputation ?? 0
            };
        }

        private static VoteType? ResolveNewVoteType(VoteType? oldVoteType, VoteType? requestedVoteType)
        {
            if (!oldVoteType.HasValue)
            {
                // Allow both upvoting and downvoting on first vote
                return requestedVoteType;
            }

            // If requesting the same vote type, remove the vote (toggle off)
            if (oldVoteType == requestedVoteType)
            {
                return null;
            }

            return null;
        }

        private static (int authorDelta, int voterDelta) CalculateReputationDelta(PostType postType, VoteType? oldVoteType, VoteType? newVoteType)
        {
            var authorDelta = GetAuthorScore(postType, newVoteType) - GetAuthorScore(postType, oldVoteType);
            var voterDelta = GetVoterScore(newVoteType) - GetVoterScore(oldVoteType);
            return (authorDelta, voterDelta);
        }

        private static int GetAuthorScore(PostType postType, VoteType? voteType)
        {
            return voteType switch
            {
                VoteType.Upvote when postType == PostType.Answer => SystemConstant.AnswerUpvoteAuthorGain,
                VoteType.Upvote => SystemConstant.QuestionUpvoteAuthorGain,
                VoteType.Downvote => SystemConstant.DownvoteAuthorLoss,
                _ => 0
            };
        }

        private static int GetVoterScore(VoteType? voteType)
        {
            return voteType == VoteType.Downvote ? SystemConstant.DownvoteVoterCost : 0;
        }
    }
}