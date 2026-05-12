using Demo.Shared.Domain;

namespace Demo.Features.Roles.Repositories
{
    public interface IRoleRepository
    {
        Task<Role> GetByCodeAsync(string code);
        Task<List<Role>> GetByCodeInAsync(List<string> code);
    }
}
