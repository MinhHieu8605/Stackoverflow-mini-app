using AutoMapper;
using Demo.Features.Comments.DTOs;
using Demo.Features.Comments.Repositories;
using Demo.Features.Posts.Repositories;
using Demo.Shared.Domain;
using Demo.Shared.Exceptions;

namespace Demo.Features.Comments.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _repository;
        private readonly IPostRepository _postRepository;
        private readonly IMapper _mapper;

        public CommentService(ICommentRepository repository, IPostRepository postRepository, IMapper mapper)
        {
            _repository = repository;
            _postRepository = postRepository;
            _mapper = mapper;
          }

          public async Task<List<CommentResponse>> GetCommentsAsync(long postId)
          {
              var comments = await _repository.GetCommentsByPostIdAsync(postId);
              return comments.Select(c => _mapper.Map<CommentResponse>(c)).ToList();
          }

          public async Task<CommentResponse> CreateCommentAsync(long currentUserId, long postId, CommentCreateRequest request)
          {
              var content = (request.Content ?? string.Empty).Trim();
              if (string.IsNullOrWhiteSpace(content))
              {
                  throw new BadRequestException("Comment content is required.");
              }

              var post = await _postRepository.GetByIdAsync(postId);
              if (post is null)
              {
                  throw new NotFoundException($"Post with id {postId} not found.");
              }

              var comment = new Comment
              {
                  postId = postId,
                  userId = currentUserId,
                  content = content,
                  score = 0,
                  createdAt = DateTime.Now
              };

              await _repository.AddCommentAsync(comment);
              post.commentCount += 1;
              await _repository.SaveChangesAsync();

              var created = await _repository.GetCommentByIdAsync(comment.id)
                  ?? throw new NotFoundException("Created comment not found.");

            return _mapper.Map<CommentResponse>(created);
          }

          public async Task<CommentResponse> UpdateCommentAsync(long currentUserId, long postId, long commentId, CommentUpdateRequest request)
          {
              var content = (request.Content ?? string.Empty).Trim();
              if (string.IsNullOrWhiteSpace(content))
              {
                  throw new BadRequestException("Comment content is required.");
              }

              var comment = await _repository.GetCommentByIdAsync(commentId);
              if (comment is null || comment.postId != postId)
              {
                  throw new NotFoundException($"Comment with id {commentId} not found.");
              }

              if (comment.userId != currentUserId)
              {
                  throw new BadRequestException("You can only edit your own comment.");
              }

              comment.content = content;
              await _repository.SaveChangesAsync();

            return _mapper.Map<CommentResponse>(comment);
          }

          public async Task DeleteCommentAsync(long currentUserId, long postId, long commentId)
          {
              var comment = await _repository.GetCommentByIdAsync(commentId);
              if (comment is null || comment.postId != postId)
              {
                  throw new NotFoundException($"Comment with id {commentId} not found.");
              }

              if (comment.userId != currentUserId)
              {
                  throw new BadRequestException("You can only delete your own comment.");
              }

              var post = await _postRepository.GetByIdAsync(postId);
              if (post is null)
              {
                  throw new NotFoundException($"Post with id {postId} not found.");
              }

              _repository.RemoveComment(comment);
              post.commentCount = Math.Max(0, post.commentCount - 1);
              await _repository.SaveChangesAsync();
          }
      }
  }