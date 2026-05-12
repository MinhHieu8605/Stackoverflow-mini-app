using Demo.Features.Posts.DTOs;
using Demo.Shared.Domain;
using Demo.Shared.PageResponse;

namespace Demo.Features.Posts.Services
{
    public interface IPostService
    {
        Task<PagedResponse<PostResponse>> SearchAsync(PostSearch search);
        Task<QuestionDetailResponse> GetQuestionDetailAsync(long id);
        Task<PostResponse> CreatePostAsync(long userId, PostCreate create);
        Task<PostResponse> UpdatePostAsync(long id, PostUpdate update);
        Task<bool> DeletePostAsync(long id, long currentUserId);
        Task<PostResponse> ApprovePostAsync(long id, long adminId);
        Task<PostResponse> RejectPostAsync(long id, string? rejectionReason, long adminId);
    }
}
