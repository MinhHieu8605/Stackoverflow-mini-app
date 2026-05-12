using Demo.Features.Posts.Builder;
using Demo.Shared.Data;
using Demo.Shared.Domain;
using Demo.Shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Posts.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly AppDbContext _context;

        public PostRepository(AppDbContext context)
        {
            _context = context;
        }

        private static IQueryable<Post> ApplyFilters(IQueryable<Post> query, PostSearchBuilder builder)
        {
            if (builder.PostType.HasValue)
            {
                query = query.Where(p => p.postType == builder.PostType.Value);
                if (builder.PostType.Value == PostType.Question)
                {
                    query = query.Where(p => p.parentId == null && p.title != null);
                }
            }
            else
            {
                query = query.Where(p => p.postType == PostType.Question && p.parentId == null && p.title != null);
            }

            if (!string.IsNullOrEmpty(builder.Title))
            {
                query = query.Where(p => p.title.Contains(builder.Title));
            }
            if (!string.IsNullOrEmpty(builder.Body))
            {
                query = query.Where(p => p.body.Contains(builder.Body));
            }
            if (builder.UserId.HasValue)
            {
                query = query.Where(p => p.userId == builder.UserId.Value);
            }
            if (builder.Tags != null && builder.Tags.Any())
            {
                query = query.Where(p => p.Tags
                    .Any(t => builder.Tags.Contains(t.name)));
            }
            if (builder.QuestionType.HasValue)
            {
                query = query.Where(p => p.questionType == builder.QuestionType.Value);
            }
            if (builder.MinVote.HasValue)
            {
                query = query.Where(p => p.voteCount >= builder.MinVote.Value);
            }
            if (builder.MaxVote.HasValue)
            {
                query = query.Where(p => p.voteCount <= builder.MaxVote.Value);
            }
            if (builder.HasAnswer.HasValue)
            {
                query = builder.HasAnswer.Value
                    ? query.Where(p => p.ChildAnswers.Any(a => a.deleted != true))
                    : query.Where(p => !p.ChildAnswers.Any(a => a.deleted != true));
            }
            query = builder.Deleted.HasValue
                ? query.Where(p => p.deleted == builder.Deleted)
                : query.Where(p => p.deleted != true);
            
            if (builder.ApprovalStatus.HasValue)
            {
                query = query.Where(p => p.Approvals.Any(a => a.status == builder.ApprovalStatus.Value));
            }
            else
            {
                query = query.Where(p => p.Approvals
                    .OrderByDescending(a => a.createdAt)
                    .FirstOrDefault().status == PostApprovalStatus.Approved);
            }
            
            return query;
        }

        public async Task<(IEnumerable<Post> Posts, int TotalCount)> SearchAsync(PostSearchBuilder builder, int page, int pageSize)
        {
            var query = _context.Posts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.ChildAnswers)
                .Include(p => p.Approvals)
                .AsNoTracking()
                .AsQueryable();
            query = ApplyFilters(query, builder);

            var totalCount = await query.CountAsync();

            var posts = await query
                .OrderByDescending(p => p.createdAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (posts, totalCount);
        }
        public async Task<Post> CreateAsync(Post post)
        {
            post.createdAt = DateTime.Now;
            await _context.Posts.AddAsync(post);
            await _context.SaveChangesAsync();
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.ChildAnswers)
                .FirstAsync(p => p.id == post.id);
        }
        public async Task<Post> UpdateAsync(Post post)
        {
            _context.Posts.Update(post);
            await _context.SaveChangesAsync();
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.ChildAnswers)
                .FirstAsync(p => p.id == post.id);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var post = await _context.Posts.FindAsync(id);
            post.deleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Post?> GetByIdAsync(long id)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.ChildAnswers)
                .FirstOrDefaultAsync(p => p.id == id);
        }

        public async Task<Post?> GetQuestionDetailByIdAsync(long id)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Approvals)
                .Include(p => p.ChildAnswers.Where(a => a.deleted != true))
                    .ThenInclude(a => a.User)
                .AsSplitQuery()
                .FirstOrDefaultAsync(p =>
                    p.id == id
                    && p.postType == PostType.Question
                    && p.parentId == null
                    && p.deleted != true);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Tag?> GetTagByNameAsync(string name)
        {
            return await _context.Tags.FirstOrDefaultAsync(t => t.name == name);
        }

        public async Task<Tag> CreateTagAsync(Tag tag)
        {
            await _context.Tags.AddAsync(tag);
            await _context.SaveChangesAsync();
            return tag;
        }

    }
}
