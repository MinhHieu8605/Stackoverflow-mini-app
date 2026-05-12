using Demo.Shared.Data;
using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Demo.Features.Votes.Repositories
{
    public class VoteRepository : IVoteRepository
    {
        private readonly AppDbContext _context;

        public VoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<Post?> GetPostWithAuthorAsync(long postId)
        {
            return _context.Posts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.id == postId && !p.deleted);
        }

        public Task<User?> GetUserByIdAsync(long userId)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.id == userId && u.deleted != true);
        }

        public Task<Vote?> GetByUserAndPostAsync(long userId, long postId)
        {
            return _context.Votes.FirstOrDefaultAsync(v => v.userId == userId && v.postId == postId);
        }

        public async Task AddAsync(Vote vote)
        {
            await _context.Votes.AddAsync(vote);
        }

        public void Remove(Vote vote)
        {
            _context.Votes.Remove(vote);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return _context.Database.BeginTransactionAsync();
        }
    }
}
