using Microsoft.Extensions.Hosting;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Linq;

namespace Demo.Shared.Domain
{
    [Table("users")]
    public class User
    {
        [Key]
        public long id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("user_name")]
        public string userName { get; set; } = null!;

        [MaxLength(50)]
        [Column("display_name")]
        public string displayName { get; set; }

        [Required]
        [MaxLength(100)]
        public string email { get; set; } = null!;

        [Required]
        [MaxLength(255)]
        [Column("password_hash")]
        public string passwordHash { get; set; } = null!;

        [MaxLength(500)]
        [Column("about_me")]
        public string? aboutMe { get; set; }

        public int? reputation { get; set; } = 0;

        [MaxLength(500)]
        [Column("website_url")]
        public string? websiteUrl { get; set; }

        [MaxLength(100)]
        public string? location { get; set; }

        [MaxLength(500)]
        [Column("avatar_url")]
        public string? avatarUrl { get; set; }

        public bool deleted { get; set; } = false;

        [Column("created_at")]
        public DateTime createdAt { get; set; } = DateTime.Now;

        // Relationships
        public virtual ICollection<Role> Roles { get; set; }
        public virtual ICollection<Post> Posts { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Vote> Votes { get; set; }
        public virtual ICollection<Badge> Badges { get; set; }
        public virtual ICollection<PostApproval> PostApprovals { get; set; }
    }
}
