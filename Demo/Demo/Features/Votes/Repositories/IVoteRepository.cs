using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore.Storage;

namespace Demo.Features.Votes.Repositories
{
    public interface IVoteRepository
    {
        Task<Post?> GetPostWithAuthorAsync(long postId);
        Task<User?> GetUserByIdAsync(long userId);
        Task<Vote?> GetByUserAndPostAsync(long userId, long postId);
        Task AddAsync(Vote vote);
        void Remove(Vote vote);
        Task SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}
