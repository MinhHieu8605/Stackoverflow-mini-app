using Demo.Shared.Domain;

namespace Demo.Features.Tags.Repositories
{
    public interface ITagRepository
    {
        Task<Tag?> GetByNameAsync(string name);
        Task<List<Tag>> SearchAsync(string? keyword);
    }
}