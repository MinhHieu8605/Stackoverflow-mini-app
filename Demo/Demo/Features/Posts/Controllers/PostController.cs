using Demo.Features.Posts.DTOs;
using Demo.Features.Posts.Services;
using Demo.Shared.PageResponse;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Demo.Features.Posts.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class PostController : Controller
    {
        private readonly IPostService _postService;
        public PostController(IPostService postService)
        {
            _postService = postService;
        }
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<PostResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchPosts([FromQuery] PostSearch search)
        {
            var result = await _postService.SearchAsync(search);
            return Ok(result);
        }

        [HttpGet("questions/{id:long}")]
        [ProducesResponseType(typeof(QuestionDetailResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetQuestionDetail(long id)
        {
            var result = await _postService.GetQuestionDetailAsync(id);
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] PostCreate post_create)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var post = await _postService.CreatePostAsync(userId, post_create);
            return Ok(post);
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdatePost(long id, [FromBody] PostUpdate post_update)
        {
            var post = await _postService.UpdatePostAsync(id, post_update);
            return Ok(post);
        }

        [Authorize]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeletePost(long id)
        {
            var currentUserId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _postService.DeletePostAsync(id, currentUserId);
            if (!success) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id:long}/approve")]
        public async Task<IActionResult> ApprovePost(long id)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _postService.ApprovePostAsync(id, userId);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id:long}/reject")]
        public async Task<IActionResult> RejectPost(long id, [FromBody] PostApprovalRequest request)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _postService.RejectPostAsync(id, request.RejectionReason, userId);
            return Ok(result);
        }
    }
}
