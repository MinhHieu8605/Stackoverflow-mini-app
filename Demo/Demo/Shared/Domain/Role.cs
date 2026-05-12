using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Demo.Shared.Domain
{
    [Table("roles")]
    public class Role
    {
        [Key]
        public int id { get; set; }

        [Required]
        [MaxLength(50)]
        public string name { get; set; }

        [MaxLength(50)]
        public string code { get; set; }

        public virtual ICollection<User> Users { get; set; }
    }
}
