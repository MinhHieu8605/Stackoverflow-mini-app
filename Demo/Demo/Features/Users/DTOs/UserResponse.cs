namespace Demo.Features.Users.DTOs
{
    public class UserResponse
    {
        public long Id { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string? AboutMe { get; set; }
        public int Reputation { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Location { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
