using Demo.Features.Votes.DTOs;
using Demo.Features.Votes.Services;
using Demo.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Demo.Features.Votes.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/posts/{postId:long}/vote")]
    public class VoteController : Controller
    {
        private readonly IVoteService _voteService;

        public VoteController(IVoteService voteService)
        {
            _voteService = voteService;
        }

        [HttpPut]
        public async Task<IActionResult> Vote(long postId, [FromBody] VoteRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _voteService.VoteAsync(userId, postId, request);
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyVoteState(long postId)
        {
            var userId = GetCurrentUserId();
            var result = await _voteService.GetMyVoteStateAsync(userId, postId);
            return Ok(result);
        }

        private long GetCurrentUserId()
        {
            var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!long.TryParse(userIdRaw, out var userId))
            {
                throw new BadRequestException("Invalid user identity.");
            }

            return userId;
        }
    }
}
