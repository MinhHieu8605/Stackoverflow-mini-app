using Demo.Features.Comments.DTOs;
using Demo.Features.Comments.Services;
using Demo.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Demo.Features.Comments.Controllers
{
    [ApiController]
    [Route("api/posts/{postId:long}/comments")]
    public class CommentController : Controller
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetComments(long postId)
        {
            var result = await _commentService.GetCommentsAsync(postId);
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateComment(long postId, [FromBody] CommentCreateRequest request)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _commentService.CreateCommentAsync(userId, postId, request);
            return Ok(result);
        }

        [HttpPut("{commentId:long}")]
        public async Task<IActionResult> UpdateComment(long postId, long commentId, [FromBody] CommentUpdateRequest request)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _commentService.UpdateCommentAsync(userId, postId, commentId, request);
            return Ok(result);
        }

        [HttpDelete("{commentId:long}")]
        public async Task<IActionResult> DeleteComment(long postId, long commentId)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _commentService.DeleteCommentAsync(userId, postId, commentId);
            return Ok(new { message = "Delete comment successfully" });
        }
    }
}