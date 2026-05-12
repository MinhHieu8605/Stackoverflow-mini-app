using Demo.Shared.Data;
using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Posts.Repositories
{
    public class PostApprovalRepository : IPostApprovalRepository
    {
        private readonly AppDbContext _context;

        public PostApprovalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PostApproval?> GetLatestByPostIdAsync(long postId)
        {
            return await _context.PostApprovals
                .AsNoTracking()
                .Where(pa => pa.postId == postId)
                .OrderByDescending(pa => pa.createdAt)
                .FirstOrDefaultAsync();
        }

        public async Task<PostApproval> CreateAsync(PostApproval approval)
        {
            await _context.PostApprovals.AddAsync(approval);
            await _context.SaveChangesAsync();
            return approval;
        }

        public async Task<PostApproval> UpdateAsync(PostApproval approval)
        {
            _context.PostApprovals.Update(approval);
            await _context.SaveChangesAsync();
            return approval;
        }
    }
}
