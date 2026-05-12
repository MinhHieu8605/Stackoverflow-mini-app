using Demo.Features.Auth.DTOs;
using Demo.Features.Auth.Services;
using Microsoft.AspNetCore.Mvc;

namespace Demo.Features.Auth.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Register request)
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login request)
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        
    }
}
