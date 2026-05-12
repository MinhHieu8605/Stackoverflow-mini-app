
namespace Demo.Features.Tags.DTOs
{
    public class TagResponse
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string? Description { get; set; }
        public int UsageCount { get; set; }
    }
}
