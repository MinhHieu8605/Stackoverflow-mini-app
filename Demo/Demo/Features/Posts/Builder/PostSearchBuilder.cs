using Demo.Shared.Enums;

namespace Demo.Features.Posts.Builder
{
    public class PostSearchBuilder
    {
        public string? Title { get; private set; }
        public string? Body { get; private set; }
        public long? UserId { get; private set; }
        public PostType? PostType { get; private set; }
        public QuestionType? QuestionType { get; private set; }
        public List<string>? Tags { get; private set; }
        public int? MinVote { get; private set; }
        public int? MaxVote { get; private set; }
        public bool? HasAnswer { get; private set; }
        public bool? Deleted { get; private set; }
        public PostApprovalStatus? ApprovalStatus { get; private set; }

        private PostSearchBuilder() { }

        public class Builder
        {
            private readonly PostSearchBuilder _instance = new();
            public Builder SetTitle(string? title)
            {
                _instance.Title = title?.Trim();
                return this;
            }
            public Builder SetBody(string? body)
            {
                _instance.Body = body?.Trim();
                return this;
            }
            public Builder SetUserId(long? userId)
            {
                _instance.UserId = userId;
                return this;
            }
            public Builder SetPostType(PostType? postType)
            {
                _instance.PostType = postType;
                return this;
            }
            public Builder SetQuestionType(QuestionType? questionType)
            {
                _instance.QuestionType = questionType;
                return this;
            }
            public Builder SetTags(List<string>? tags)
            {
                _instance.Tags = tags?.Select(t => t.Trim()).ToList();
                return this;
            }
            public Builder SetMinVote(int? minVote)
            {
                _instance.MinVote = minVote;
                return this;
            }
            public Builder SetMaxVote(int? maxVote)
            {
                _instance.MaxVote = maxVote;
                return this;
            }
            public Builder SetHasAnswer(bool? hasAnswer)
            {
                _instance.HasAnswer = hasAnswer;
                return this;
            }
            public Builder SetDeleted(bool? deleted)
            {
                _instance.Deleted = deleted;
                return this;
            }
            public Builder SetApprovalStatus(PostApprovalStatus? approvalStatus)
            {
                _instance.ApprovalStatus = approvalStatus;
                return this;
            }
            public PostSearchBuilder Build() => _instance;
        }
    }
}
