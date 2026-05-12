using Demo.Shared.Domain;

namespace Demo.Features.Comments.Repositories
{
    public interface ICommentRepository
    {
        Task<Comment?> GetCommentByIdAsync(long commentId);
        Task<List<Comment>> GetCommentsByPostIdAsync(long postId);
        Task AddCommentAsync(Comment comment);
        void RemoveComment(Comment comment);
        Task SaveChangesAsync();
    }
}