using Demo.Shared.Domain;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;

namespace Demo.Shared.Utils
{
    public interface IJwtHelper
    {
        string GenerateToken(User user);
        DateTime GetExpiry();
    }

    public class JwtHelper : IJwtHelper
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryMinutes;

        public JwtHelper(IConfiguration config)
        {
            _secretKey = config["Jwt:SecretKey"]
                ?? throw new InvalidOperationException("Jwt:SecretKey is missing.");

            _issuer = config["Jwt:Issuer"] ?? "MyApp";
            _audience = config["Jwt:Audience"] ?? "MyApp";
            _expiryMinutes = int.Parse(config["Jwt:ExpiryMinutes"] ?? "60");
        }

        public string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var claims = BuildClaims(user);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: GetExpiry(),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private IEnumerable<Claim> BuildClaims(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Name, user.userName),
                new Claim(ClaimTypes.Email, user.email),

                new Claim("userId", user.id.ToString())
            };


            if (user.Roles != null)
            {
                foreach (var role in user.Roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role.name));
                }
            }

            return claims;
        }

        public DateTime GetExpiry()
        {
            return DateTime.Now.AddMinutes(_expiryMinutes);
        }
    }
}