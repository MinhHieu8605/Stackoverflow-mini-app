using Demo.Features.Comments.DTOs;

namespace Demo.Features.Comments.Services
{
    public interface ICommentService
    {
        Task<List<CommentResponse>> GetCommentsAsync(long postId);
        Task<CommentResponse> CreateCommentAsync(long currentUserId, long postId, CommentCreateRequest request);
        Task<CommentResponse> UpdateCommentAsync(long currentUserId, long postId, long commentId, CommentUpdateRequest request);
        Task DeleteCommentAsync(long currentUserId, long postId, long commentId);
    }
}