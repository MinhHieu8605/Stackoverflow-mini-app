using AutoMapper;
using Demo.Features.Users.DTOs;
using Demo.Shared.Domain;

namespace Demo.Features.Users.Mapper
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // Create
            CreateMap<UserCreate, User>();

            // Update
            CreateMap<UserUpdate, User>()
                .ForMember(dest => dest.passwordHash, opt => opt.Ignore())
                .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => srcMember != null));
            /*
             * opts : Cấu hình cho từng property
             * src: Object nguồn (UserUpdate DTO)
             * dest: Object đích (User entity trong DB)
             * srcMember: Giá trị của từng field bên src
             */

            // Entity to Response
            CreateMap<User, UserResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.userName.Trim()))
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.displayName.Trim()))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.email.Trim()))
                .ForMember(dest => dest.AboutMe, opt => opt.MapFrom(src => src.aboutMe.Trim()))
                .ForMember(dest => dest.WebsiteUrl, opt => opt.MapFrom(src => src.websiteUrl.Trim()))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.location.Trim()))
                .ForMember(dest => dest.Reputation, opt => opt.MapFrom(src => src.reputation))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.createdAt))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.avatarUrl));

        }

    }

}
