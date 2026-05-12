using Demo.Features.Users.Builder;
using Demo.Features.Users.DTOs;

namespace Demo.Features.Users.Converter
{
    public class UserConverter
    {
        // DTO → Builder
        public UserSearchBuilder ToSearchBuilder(UserSearch dto)
        {
            return new UserSearchBuilder.Builder()
                .SetUserName(dto.UserName)
                .SetEmail(dto.Email)
                .SetDisplayName(dto.DisplayName)
                .SetLocation(dto.Location)
                .SetMinReputation(dto.MinReputation)
                .SetMaxReputation(dto.MaxReputation)
                .Build();
        }
    }
}
