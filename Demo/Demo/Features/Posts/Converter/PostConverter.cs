using Demo.Features.Posts.Builder;
using Demo.Features.Posts.DTOs;

namespace Demo.Features.Posts.Converter
{
    public class PostConverter
    {
        public PostSearchBuilder ToSearchBuilder(PostSearch dto)
        {
            return new PostSearchBuilder.Builder()
                .SetTitle(dto.Title)
                .SetBody(dto.Body)
                .SetUserId(dto.UserId)
                .SetPostType(dto.PostType)
                .SetQuestionType(dto.QuestionType)
                .SetTags(dto.Tags)
                .SetMinVote(dto.MinVote)
                .SetMaxVote(dto.MaxVote)
                .SetHasAnswer(dto.HasAnswer)
                .SetDeleted(dto.Deleted)
                .SetApprovalStatus(dto.ApprovalStatus)
                .Build();
        }
    }
}
