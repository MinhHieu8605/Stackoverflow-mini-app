using Demo.Shared.Data;
using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Comments.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;

        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<Comment?> GetCommentByIdAsync(long commentId)
        {
            return _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.id == commentId);
        }

        public Task<List<Comment>> GetCommentsByPostIdAsync(long postId)
        {
            return _context.Comments
                .Include(c => c.User)
                .Where(c => c.postId == postId)
                .OrderByDescending(c => c.createdAt)
                .ToListAsync();
        }

        public async Task AddCommentAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
        }

        public void RemoveComment(Comment comment)
        {
            _context.Comments.Remove(comment);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}