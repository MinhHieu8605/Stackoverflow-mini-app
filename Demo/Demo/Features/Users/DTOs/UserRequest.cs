namespace Demo.Features.Users.DTOs
{
    public class UserCreate
    {
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? AboutMe { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Location { get; set; }
    }

    public class UserUpdate
    {
        public string? UserName { get; set; }
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? AboutMe { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Location { get; set; }
        // Avatar as URL (use Upload API to get file URL, then send it here)
        public string? AvatarUrl { get; set; }
    }

    public class UserSearch
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? Location { get; set; }
        public int? MinReputation { get; set; }
        public int? MaxReputation { get; set; }
    }
}
