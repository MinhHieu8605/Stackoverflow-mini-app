using Demo.Shared.Data;
using Demo.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Tags.Repositories
{
    public class TagRepository : ITagRepository
    {
          private readonly AppDbContext _context;
          public TagRepository(AppDbContext context)
          {
              _context = context;
          }

          public async Task<Tag?> GetByNameAsync(string name)
          {
              return await _context.Tags.FirstOrDefaultAsync(t => t.name.ToLower() == name.ToLower());
          }

          public async Task<List<Tag>> SearchAsync(string? keyword)
          {
              var query = _context.Tags.AsQueryable();

              if (!string.IsNullOrEmpty(keyword))
              {
                  query = query.Where(t => t.name.ToLower().Contains(keyword.ToLower()));
              }

              return await query
                  .OrderByDescending(t => t.usageCount)
                  .ToListAsync();
          }
      }
}