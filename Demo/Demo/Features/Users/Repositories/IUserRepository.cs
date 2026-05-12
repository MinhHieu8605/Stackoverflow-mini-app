using Demo.Features.Users.Builder;
using Demo.Shared.Domain;

namespace Demo.Features.Users.Repositories
{
    public interface IUserRepository
    {
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(long id);
        Task<User> GetByIdAsync(long id);
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByUserNameAsync(string userName);

        Task<(IEnumerable<User> Users, int TotalCount)> SearchAsync(UserSearchBuilder builder, int page, int pageSize);
    }
}
