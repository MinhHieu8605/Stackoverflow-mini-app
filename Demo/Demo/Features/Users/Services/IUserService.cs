using Demo.Features.Users.DTOs;
using Demo.Shared.PageResponse;

namespace Demo.Features.Users.Services
{
    public interface IUserService
    {
        Task<PagedResponse<UserResponse>> SearchAsync(UserSearch search);
        Task<UserResponse> GetByIdAsync(long id);
        Task<UserResponse> CreateUserAsync(UserCreate request);
        Task<UserResponse> UpdateUserAsync(long id, UserUpdate request);
        Task<bool> DeleteUserAsync(long id);
    }
}
