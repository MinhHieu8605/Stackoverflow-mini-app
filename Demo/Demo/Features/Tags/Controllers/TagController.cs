using Demo.Features.Tags.Services;
using Microsoft.AspNetCore.Mvc;

namespace Demo.Features.Tags.Controllers
{
  [ApiController]
  [Route("api/tags")]
  public class TagController : Controller
  {
    private readonly ITagService _service;
    public TagController(ITagService service)
    {
      _service = service;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchTagsAsync([FromQuery] string? keyword)
    {
      var tags = await _service.SearchTagAsync(keyword);
      return Ok(tags);
    }
  }
}