using Demo.Features.Tags.DTOs;

namespace Demo.Features.Tags.Services
{
    public interface ITagService
  { 
        Task<List<TagResponse>> SearchTagAsync(string? keyword);
    }
}