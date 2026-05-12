using Demo.Features.Users.Builder;
using Demo.Features.Users.DTOs;
using Demo.Features.Users.Services;
using Demo.Shared.PageResponse;
using Demo.Shared.Exceptions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Demo.Features.Users.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<UserResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] UserSearch search)
        {
            var users = await _userService.SearchAsync(search);
            return Ok(users);
        }

        [HttpGet("{id:long}")]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetById(long id)
        {
            var user = await _userService.GetByIdAsync(id);
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserCreate request)
        {
            var user = await _userService.CreateUserAsync(request);
            return Ok(user);
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateUser(long id, [FromBody] UserUpdate request)
        {
            var user = await _userService.UpdateUserAsync(id, request);
            return Ok(user);
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserIdClaim != null && long.TryParse(currentUserIdClaim, out var currentUserId))
            {
                if (currentUserId == id)
                {
                    throw new BadRequestException("You cannot delete your own account.");
                }
            }

            var result = await _userService.DeleteUserAsync(id);
            return Ok(new { message = "Delete user successfully" });
        }
    }
}
