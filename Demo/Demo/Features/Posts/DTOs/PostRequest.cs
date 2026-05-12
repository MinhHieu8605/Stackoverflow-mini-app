using Demo.Shared.Enums;

namespace Demo.Features.Posts.DTOs
{
    public class PostCreate
    {
        public string? Title { get; set; }
        public string Body { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public QuestionType? QuestionType { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    public class PostUpdate
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public QuestionType? QuestionType { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class PostApprovalRequest
    {
        public string? RejectionReason { get; set; }
    }

    public class PostSearch
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Title { get; set; }
        public string? Body { get; set; }
        public long? UserId { get; set; }
        public PostType? PostType { get; set; }
        public QuestionType? QuestionType { get; set; }
        public List<string>? Tags { get; set; }
        public int? MinVote { get; set; }
        public int? MaxVote { get; set; }
        public bool? HasAnswer { get; set; }
        public bool? Deleted { get; set; }
        public PostApprovalStatus? ApprovalStatus { get; set; }
    }
}

