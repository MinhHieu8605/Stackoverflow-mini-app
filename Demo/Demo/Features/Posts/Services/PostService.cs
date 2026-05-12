using AutoMapper;
using Demo.Features.Posts.Converter;
using Demo.Features.Posts.DTOs;
using Demo.Features.Posts.Repositories;
using Demo.Shared.Domain;
using Demo.Shared.Enums;
using Demo.Shared.Exceptions;
using Demo.Shared.PageResponse;
using Demo.Shared.Utils;
using System;

namespace Demo.Features.Posts.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _repository;
        private readonly IPostApprovalRepository _approvalRepository;
        private readonly PostConverter _converter;
        private readonly IMapper _mapper;
        public PostService(IPostRepository repository, IPostApprovalRepository approvalRepository, PostConverter converter, IMapper mapper)
        {
            _repository = repository;
            _approvalRepository = approvalRepository;
            _converter = converter;
            _mapper = mapper;
        }

        public async Task<PagedResponse<PostResponse>> SearchAsync(PostSearch search)
        {
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);

            var builder = _converter.ToSearchBuilder(search);

            var (posts, totalCount) = await _repository.SearchAsync(builder, page, pageSize);

            return new PagedResponse<PostResponse>
            {
                Items = _mapper.Map<List<PostResponse>>(posts),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<QuestionDetailResponse> GetQuestionDetailAsync(long id)
        {
            var approval = await _approvalRepository.GetLatestByPostIdAsync(id);
            if (approval?.status != PostApprovalStatus.Approved)
            {
                throw new NotFoundException("Question not found or not approved.");
            }

            var question = await _repository.GetQuestionDetailByIdAsync(id);
            
            if (question == null)
                throw new NotFoundException($"Question with id {id} not found.");
            
            question.viewCount++;
            await _repository.SaveChangesAsync();

            var answers = question.ChildAnswers
                .OrderByDescending(a => a.id == question.acceptedAnswerId)
                .ThenByDescending(a => a.voteCount)
                .ThenBy(a => a.createdAt)
                .Select(a => new AnswerResponse
                {
                    Id = a.id,
                    UserName = a.User.userName,
                    AvatarUrl = a.User.avatarUrl,
                    Body = a.body,
                    VoteCount = a.voteCount,
                    CreatedAt = a.createdAt,
                    IsAccepted = question.acceptedAnswerId.HasValue && a.id == question.acceptedAnswerId.Value
                })
                .ToList();

            return new QuestionDetailResponse
            {
                Question = _mapper.Map<PostResponse>(question),
                AcceptedAnswerId = question.acceptedAnswerId,
                Answers = answers
            };
        }

        public async Task<PostResponse> CreatePostAsync(long userId, PostCreate post_create)
        {
            var postType = post_create.ParentId.HasValue ? PostType.Answer : PostType.Question;
            if (postType == PostType.Question)
            {
                if (post_create.Tags == null || post_create.Tags.Count == 0)
                    throw new ArgumentException("At least 1 tag is required for questions.");
            }
            // Resolve tags
            var resolvedTags = postType == PostType.Question
                ? await ResolveTags(post_create.Tags)
                : new List<Tag>();

            // Map to domain model
            var post = _mapper.Map<Post>(post_create);
            post.userId = userId;
            post.voteCount = 0;
            post.viewCount = 0;
            post.deleted = false;
            post.postType = postType;
            
            // xử lý Question vs Answer
            if (post.postType == PostType.Question)
            {
                post.title = post_create.Title;
                post.questionType = post_create.QuestionType;
                post.slug = SlugHelper.GenerateSlug(post_create.Title!);
                post.Tags = resolvedTags;

                foreach (var tag in resolvedTags) tag.usageCount++;
            }
            else
            {
                post.title = null;
                post.questionType = null;
                post.slug = $"answer-{Guid.NewGuid():N}";
            }

            var created = await _repository.CreateAsync(post);
            
            // Create pending approval record
            if (post.postType == PostType.Question)
            {
                await _approvalRepository.CreateAsync(new PostApproval
                {
                    postId = created.id,
                    status = PostApprovalStatus.Pending,
                    createdAt = DateTime.Now
                });
            }
            
            return _mapper.Map<PostResponse>(created);

        }

        // Private helpers
        private async Task<List<Tag>> ResolveTags(List<string> rawTags)
        {
            var normalized = rawTags
                .Select(t => t.Trim().ToLowerInvariant())
                .Where(t => !string.IsNullOrEmpty(t))
                .Distinct()
                .ToList();

            var result = new List<Tag>();

            foreach (var name in normalized)
            {
                var tag = await _repository.GetTagByNameAsync(name);

                if (tag is null)
                {
                    tag = await _repository.CreateTagAsync(new Tag
                    {
                        name = name,
                        slug = SlugHelper.GenerateSlug(name),
                        usageCount = 0
                    });
                }

                result.Add(tag);
            }

            return result;
        }

        public async Task<bool> DeletePostAsync(long id, long currentUserId)
        {
            var post = await _repository.GetByIdAsync(id);
            if (post == null) throw new NotFoundException($"Post with id {id} not found.");
            if (post.userId != currentUserId)
                throw new BadRequestException("You can only delete your own posts.");
            return await _repository.DeleteAsync(id);
        }

        public async Task<PostResponse> ApprovePostAsync(long id, long adminId)
        {
            var post = await _repository.GetByIdAsync(id);
            if (post == null) 
                throw new NotFoundException($"Post with id {id} not found.");

            var approval = await _approvalRepository.GetLatestByPostIdAsync(id);
            if (approval == null)
                throw new NotFoundException($"Approval record for post {id} not found.");

            // Update approval record
            if (approval.status != PostApprovalStatus.Pending)
            {
                throw new BadRequestException("Post already processed.");
            }
            approval.status = PostApprovalStatus.Approved;
            approval.adminId = adminId;
            approval.processedAt = DateTime.Now;
            
            await _approvalRepository.UpdateAsync(approval);
            return _mapper.Map<PostResponse>(post);
        }

        public async Task<PostResponse> RejectPostAsync(long id, string? rejectionReason, long adminId)
        {
            var post = await _repository.GetByIdAsync(id);
            if (post == null) 
                throw new NotFoundException($"Post with id {id} not found.");

            var approval = await _approvalRepository.GetLatestByPostIdAsync(id);
            if (approval == null)
                throw new NotFoundException($"Approval record for post {id} not found.");

            // Update approval record
            if (approval.status != PostApprovalStatus.Pending)
            {
                throw new BadRequestException("Post already processed.");
            }
            approval.status = PostApprovalStatus.Rejected;
            approval.adminId = adminId;
            approval.rejectionReason = rejectionReason;
            approval.processedAt = DateTime.Now;
            
            await _approvalRepository.UpdateAsync(approval);
            return _mapper.Map<PostResponse>(post);
        }

        public async Task<PostResponse> UpdatePostAsync(long id, PostUpdate post_update)
        {
            var post = await _repository.GetByIdAsync(id);
            if(post == null)
                throw new NotFoundException($"Post with id {id} not found.");

            if(post.postType == PostType.Question)
            {
                if (!string.IsNullOrWhiteSpace(post_update.Title))
                {
                    post.title = post_update.Title;
                    post.slug = SlugHelper.GenerateSlug(post.title);
                }
                if (post_update.QuestionType.HasValue)
                {
                    post.questionType = post_update.QuestionType;
                } 

                if(post_update.Tags != null)
                {
                    var newTags = await ResolveTags(post_update.Tags);
                    var oldTags = post.Tags.ToList();
                    // Giảm tag remove
                    foreach (var oldTag in oldTags)
                    {
                        // Tag cũ này KHÔNG còn nằm trong danh sách tag mới
                        if (!newTags.Any(t => t.name == oldTag.name))
                        {
                            oldTag.usageCount = Math.Max(oldTag.usageCount - 1, 0);
                        }
                    }
                    // Tăng tag 
                    foreach (var newTag in newTags)
                    {
                        // Tag mới này KHÔNG còn nằm trong danh sách tag cũ
                        if (!oldTags.Any(t => t.name == newTag.name))
                        {
                            newTag.usageCount++;
                        }
                    }
                    post.Tags = newTags;
                }
            }
            post.body = post_update.Body ?? post.body;

            var updated = await _repository.UpdateAsync(post);
            return _mapper.Map<PostResponse>(updated);
        }
    }
}
