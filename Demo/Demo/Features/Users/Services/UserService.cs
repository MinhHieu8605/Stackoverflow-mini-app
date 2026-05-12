using AutoMapper;
using BCrypt.Net;
using Demo.Features.Roles.Repositories;
using Demo.Features.Users.Converter;
using Demo.Features.Users.DTOs;
using Demo.Features.Users.Repositories;
using Demo.Features.Uploads.Services;
using Demo.Shared.Constants;
using Demo.Shared.Domain;
using Demo.Shared.Exceptions;
using Demo.Shared.PageResponse;

namespace Demo.Features.Users.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly UserConverter _converter;
        private readonly IUploadService _uploadService;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IRoleRepository roleRepository, UserConverter converter, IUploadService uploadService, IMapper mapper)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _converter = converter;
            _uploadService = uploadService;
            _mapper = mapper;
        }

        public async Task<PagedResponse<UserResponse>> SearchAsync(UserSearch search)
        {
            var page = Math.Max(1, search.Page);
            var pageSize = Math.Clamp(search.PageSize, 1, 100);

            var builder = _converter.ToSearchBuilder(search);

            var (users, totalCount) = await _userRepository.SearchAsync(builder, page, pageSize);

            return new PagedResponse<UserResponse>
            {
                Items = _mapper.Map<List<UserResponse>>(users),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<UserResponse> GetByIdAsync(long id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            return _mapper.Map<UserResponse>(user);
        }

        public async Task<UserResponse> CreateUserAsync(UserCreate userCreate)
        {
            var existingEmail = await _userRepository.GetByEmailAsync(userCreate.Email);
            if (existingEmail != null)
            {
                throw new BadRequestException("Email already exists");
            }
            var existingUserName = await _userRepository.GetByUserNameAsync(userCreate.UserName);
            if (existingUserName != null)
            {
                throw new BadRequestException("Username already exists");
            }
            var user = _mapper.Map<User>(userCreate);
            user.passwordHash = BCrypt.Net.BCrypt.HashPassword(userCreate.Password);

            Role role = await _roleRepository.GetByCodeAsync(SystemConstant.UserRole);
            if (role == null)
            {
                throw new NotFoundException("Role not found");
            }
            user.Roles = new List<Role> { role };

            user.reputation = 0;
            user.deleted = false;

            var createdUser = await _userRepository.CreateAsync(user);
            return _mapper.Map<UserResponse>(createdUser);
        }

        public async Task<UserResponse> UpdateUserAsync(long id, UserUpdate userUpdate)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            if (!string.IsNullOrEmpty(userUpdate.Email) && userUpdate.Email != user.email)
            {
                var existingEmail = await _userRepository.GetByEmailAsync(userUpdate.Email);
                if (existingEmail != null) throw new BadRequestException("Email already exists");
            }
            if (!string.IsNullOrEmpty(userUpdate.UserName) && userUpdate.UserName != user.userName)
            {
                var existingUserName = await _userRepository.GetByUserNameAsync(userUpdate.UserName);
                if (existingUserName != null) throw new BadRequestException("Username already exists");
            }
            if (!string.IsNullOrEmpty(userUpdate.Password))
            {
                user.passwordHash = BCrypt.Net.BCrypt.HashPassword(userUpdate.Password);
            }

            if (!string.IsNullOrEmpty(userUpdate.AvatarUrl))
            {
                user.avatarUrl = userUpdate.AvatarUrl;
            }
            
            _mapper.Map(userUpdate, user);
            var updatedUser = await _userRepository.UpdateAsync(user);
            return _mapper.Map<UserResponse>(updatedUser);
        }

        public async Task<bool> DeleteUserAsync(long id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            return await _userRepository.DeleteAsync(id);
        }
    }
}
