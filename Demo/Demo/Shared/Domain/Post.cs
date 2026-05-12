using Demo.Shared.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Demo.Shared.Domain
{
  [Table("posts")]
  public class Post
  {
    [Key]
    public long id { get; set; }

    [Required]
    [Column("user_id")]
    public long userId  { get; set; }

    [Column("parent_id")]
    public long? parentId { get; set; }

    [Column("accepted_answer_id")]
    public long? acceptedAnswerId { get; set; }

    [Column("title")]
    public string? title { get; set; }

    [Column("slug")]
    public string slug { get; set; }

    [Column("body")]
    public string body { get; set; }

    [Column("post_type")]
    public PostType postType { get; set; }

    [Column("question_type")]
    public QuestionType? questionType { get; set; }

    [Column("view_count")]
    public int viewCount { get; set; }

    [Column("vote_count")]
    public int voteCount { get; set; }

    [Column("comment_count")]
    public int commentCount { get; set; }

    public bool deleted { get; set; } = false;

    [Column("created_at")]
    public DateTime createdAt { get; set; }

    public virtual Post? ParentPost { get; set; }
    public virtual ICollection<Post> ChildAnswers { get; set; }
    public virtual Post? AcceptedAnswer { get; set; }

    public virtual User User { get; set; }

    public virtual ICollection<PostApproval> Approvals { get; set; }
    public virtual ICollection<Tag> Tags { get; set; }
    public virtual ICollection<Comment> Comments { get; set; }
    public virtual ICollection<Vote> Votes { get; set; }
  }
}