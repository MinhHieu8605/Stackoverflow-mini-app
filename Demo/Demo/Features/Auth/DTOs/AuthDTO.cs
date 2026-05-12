namespace Demo.Features.Auth.DTOs
{
    public class Login
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class Register
    {
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class AuthResponse
    {
        public string Token { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
