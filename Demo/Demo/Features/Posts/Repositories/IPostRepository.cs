using Demo.Features.Posts.Builder;
using Demo.Shared.Domain;

namespace Demo.Features.Posts.Repositories
{
    public interface IPostRepository
    {
        Task<(IEnumerable<Post> Posts, int TotalCount)> SearchAsync(PostSearchBuilder builder, int page, int pageSize);
        Task<Post> CreateAsync(Post post);
        Task<Post> UpdateAsync(Post post);
        Task<bool> DeleteAsync(long id);
        Task<Post?> GetByIdAsync(long id);
        Task<Post?> GetQuestionDetailByIdAsync(long id);
        Task SaveChangesAsync();
        Task<Tag?> GetTagByNameAsync(string name);
        Task<Tag> CreateTagAsync(Tag tag);

    }
}
