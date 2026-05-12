using System.ComponentModel;
using Demo.Features.Auth.DTOs;
using Demo.Features.Roles.Repositories;
using Demo.Features.Users.Repositories;
using Demo.Shared.Constants;
using Demo.Shared.Data;
using Demo.Shared.Domain;
using Demo.Shared.Exceptions;
using Demo.Shared.Utils;
using Microsoft.EntityFrameworkCore;

namespace Demo.Features.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IJwtHelper _jwtHelper;

        public AuthService(IUserRepository userRepository, IRoleRepository roleRepository, IJwtHelper jwtHelper)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponse> RegisterAsync(Register register)
        {
            register.Email = register.Email.Trim().ToLowerInvariant();
            register.UserName = register.UserName.Trim();
            register.DisplayName = register.DisplayName.Trim();

            // Validate username and displayName are not empty
            if (string.IsNullOrWhiteSpace(register.UserName))
                throw new BadRequestException("Username cannot be empty or contain only spaces.");
            if (string.IsNullOrWhiteSpace(register.DisplayName))
                throw new BadRequestException("Display name cannot be empty or contain only spaces.");
            if (string.IsNullOrWhiteSpace(register.Password))
                throw new BadRequestException("Password cannot be empty or contain only spaces.");
            if (register.Password != register.Password.Trim())
                throw new BadRequestException("Password cannot start or end with spaces.");

            var emailExists = await _userRepository.GetByEmailAsync(register.Email);
            if (emailExists != null)
                throw new BadRequestException("Email is already registered.");

            var userNameExists = await _userRepository.GetByUserNameAsync(register.UserName);
            if (userNameExists != null)
                throw new BadRequestException("Username is already registered.");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(register.Password);

            var role = await _roleRepository.GetByCodeAsync(SystemConstant.UserRole);
            if (role == null)
                throw new NotFoundException("Role not found");

            var user = new User
            {
                userName = register.UserName,
                displayName = register.DisplayName,
                email = register.Email,
                passwordHash = passwordHash,
                Roles = new List<Role> { role },
                deleted = false,
                createdAt = DateTime.Now
            };

            var createdUser = await _userRepository.CreateAsync(user);

            return BuildResponse(user);
        }

        public async Task<AuthResponse> LoginAsync(Login login)
        {
            var email = login.Email.Trim().ToLowerInvariant();

            var user = await _userRepository.GetByEmailAsync(email);

            if (user is null || !BCrypt.Net.BCrypt.Verify(login.Password, user.passwordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            return BuildResponse(user);
        }

        private AuthResponse BuildResponse(User user) => new()
        {
            Token = _jwtHelper.GenerateToken(user),
            UserName = user.userName,
            DisplayName = user.displayName,
            Email = user.email,
            ExpiresAt = _jwtHelper.GetExpiry()
        };
    }
}
