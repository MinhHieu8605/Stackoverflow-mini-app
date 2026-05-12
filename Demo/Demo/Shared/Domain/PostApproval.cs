using Demo.Shared.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Demo.Shared.Domain
{
    [Table("post_approvals")]
    public class PostApproval
    {
        [Key]
        public long id { get; set; }

        [Required]
        [Column("post_id")]
        public long postId { get; set; }

        [Column("admin_id")]
        public long? adminId { get; set; }

        [Column("status")]
        public PostApprovalStatus status { get; set; } = PostApprovalStatus.Pending;

        [Column("rejection_reason")]
        public string? rejectionReason { get; set; }

        [Column("created_at")]
        public DateTime createdAt { get; set; } = DateTime.Now;

        [Column("processed_at")]
        public DateTime? processedAt { get; set; }

        public virtual Post Post { get; set; }
        public virtual User? User { get; set; }
    }
}
