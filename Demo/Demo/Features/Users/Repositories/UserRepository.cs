using Demo.Features.Users.Builder;
using Demo.Shared.Data;
using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Users.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<User> GetByIdAsync(long id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.email == email);
        }

        public async Task<User> GetByUserNameAsync(string userName)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.userName == userName);
        }

        public async Task<User> CreateAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;
            user.deleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        private static IQueryable<User> ApplyFilters(IQueryable<User> query, UserSearchBuilder builder)
        {
            if (!string.IsNullOrEmpty(builder.UserName))
            {
                query = query.Where(u => u.userName.Contains(builder.UserName));
            }
            if (!string.IsNullOrEmpty(builder.Email))
            {
                query = query.Where(u => u.email.Contains(builder.Email));
            }
            if (!string.IsNullOrEmpty(builder.DisplayName))
            {
                query = query.Where(u => u.displayName.Contains(builder.DisplayName));
            }
            if (!string.IsNullOrEmpty(builder.Location))
            {
                query = query.Where(u => u.location.Contains(builder.Location));
            }
            if (builder.MinReputation.HasValue)
            {
                query = query.Where(u => u.reputation >= builder.MinReputation.Value);
            }
            if (builder.MaxReputation.HasValue)
            {
                query = query.Where(u => u.reputation <= builder.MaxReputation.Value);
            }
            query = builder.Deleted.HasValue
                ? query.Where(u => u.deleted == builder.Deleted)
                : query.Where(u => u.deleted != true);
            return query;
        }

        public async Task<(IEnumerable<User> Users, int TotalCount)> SearchAsync(UserSearchBuilder builder, int page, int pageSize)
        {
            var query = _context.Users.AsNoTracking().AsQueryable();
            query = ApplyFilters(query, builder);

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.createdAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
    }
}
