using Demo.Features.Auth.DTOs;

namespace Demo.Features.Auth.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(Register register);
        Task<AuthResponse> LoginAsync(Login login);
    }
}
