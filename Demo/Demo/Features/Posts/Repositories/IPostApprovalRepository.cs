using Demo.Shared.Domain;
using Demo.Shared.Enums;

namespace Demo.Features.Posts.Repositories
{
    public interface IPostApprovalRepository
    {
        Task<PostApproval?> GetLatestByPostIdAsync(long postId);
        Task<PostApproval> CreateAsync(PostApproval approval);
        Task<PostApproval> UpdateAsync(PostApproval approval);
    }
}
