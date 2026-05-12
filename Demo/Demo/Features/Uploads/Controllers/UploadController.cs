using Demo.Features.Uploads.DTOs;
using Demo.Features.Uploads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Demo.Features.Uploads.Controllers
{
    [ApiController]
    [Route("api/uploads")]
    // [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IUploadService _uploadService;

        public UploadController(IUploadService uploadService)
        {
            _uploadService = uploadService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Upload([FromForm] UploadRequest request)
        {
            if (request.File == null)
            {
                return BadRequest(new { message = "File is required" });
            }

            var result = await _uploadService.UploadFileAsync(request.File);
            return Ok(result);
        }
    }
}
