using System.Data.SqlTypes;

namespace Demo.Shared.Domain
{
    public class Badge
    {
        public long id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string type { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}