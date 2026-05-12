using Demo.Shared.Data;
using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Roles.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;
        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<Role>> GetByCodeInAsync(List<string> code)
        {
            return await _context.Roles.Where(r => code.Contains(r.code)).ToListAsync();
        }

        public async Task<Role> GetByCodeAsync(string code)
        {
            return await _context.Roles.FirstOrDefaultAsync(r => r.code == code);
        }
    }
}
