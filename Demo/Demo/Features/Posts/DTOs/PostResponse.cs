using Demo.Shared.Enums;

namespace Demo.Features.Posts.DTOs
{
    public class PostResponse
    {
        public int Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Title { get; set; }
        public string Body { get; set; } = string.Empty;
        public string Slug { get; set; }
        public long? ParentId { get; set; }
        public int VoteCount { get; set; }
        public int AnswerCount { get; set; }
        public int ViewCount { get; set; }
        public PostType PostType { get; set; }
        public QuestionType? QuestionType { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    public class PostApprovalResponse
    {
        public long Id { get; set; }
        public long PostId { get; set; }
        public string ApprovedByUserName { get; set; } = string.Empty;
        public PostApprovalStatus Status { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }

    public class QuestionDetailResponse
    {
        public PostResponse Question { get; set; } = new();
        public long? AcceptedAnswerId { get; set; }
        public List<AnswerResponse> Answers { get; set; } = new();
    }

    public class AnswerResponse
    {
        public long Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Body { get; set; } = string.Empty;
        public int VoteCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsAccepted { get; set; }
    }
}
