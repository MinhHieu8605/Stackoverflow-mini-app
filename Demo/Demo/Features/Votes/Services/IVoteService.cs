using Demo.Features.Votes.DTOs;

namespace Demo.Features.Votes.Services
{
    public interface IVoteService
    {
        Task<VoteResponse> VoteAsync(long currentUserId, long postId, VoteRequest request);
        Task<VoteResponse> GetMyVoteStateAsync(long currentUserId, long postId);
    }
}
