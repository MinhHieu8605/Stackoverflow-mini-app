using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Demo.Shared.Domain
{
    [Table("tags")]
    public class Tag
    {
        public long id { get; set; }
        public string name { get; set; }
        public string slug { get; set; }
        public string? description { get; set; }

        [Column("usage_count")]
        public int usageCount { get; set; } = 0;
        public virtual ICollection<Post> Posts { get; set; }
    }
}