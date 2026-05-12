using System.ComponentModel.DataAnnotations.Schema;
using Demo.Shared.Enums;

namespace Demo.Shared.Domain
{   
    [Table("votes")]
    public class Vote
    {
        public long id { get; set; }

        [Column("post_id")]
        public long postId { get; set; }
        
        [Column("user_id")]
        public long userId { get; set; }
        
        [Column("vote_type")]
        public VoteType voteType { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column("created_at")]
        public DateTime createdAt { get; set; } = DateTime.Now;

        public virtual User User { get; set; }
        public virtual Post Post { get; set; }
    }
}