using Demo.Features.Tags.DTOs;
using Demo.Features.Tags.Repositories;

namespace Demo.Features.Tags.Services
{
    public class TagService : ITagService
    { 
          
        private readonly ITagRepository _repository;
        public TagService(ITagRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<TagResponse>> SearchTagAsync(string? keyword)
        {
            var tags = await _repository.SearchAsync(keyword);

            return tags.Select(t => new TagResponse
            {
                Id = t.id,
                Name = t.name,
                Slug = t.slug,
                UsageCount = t.usageCount,
                Description = t.description
            }).ToList();
        }
    }
}