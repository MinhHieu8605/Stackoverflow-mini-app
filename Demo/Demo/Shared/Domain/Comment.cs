using System.ComponentModel.DataAnnotations.Schema;

namespace Demo.Shared.Domain
{
    [Table("comments")]
    public class Comment
    {
        public long id { get; set; }

        [Column("post_id")]
        public long postId { get; set; }
        
        [Column("user_id")]
        public long userId { get; set; }
        public string content { get; set; }

        public int score { get; set; } = 0;
        public DateTime createdAt { get; set; } = DateTime.Now;

        public virtual User User { get; set; }
        public virtual Post Post { get; set; }
    }
}