using AutoMapper;
using Demo.Features.Posts.DTOs;
using Demo.Shared.Domain;

namespace Demo.Features.Posts.Mapper
{
    public class PostProfile : Profile
    {
        public PostProfile() 
        {
            CreateMap<PostCreate, Post>()
                .ForMember(dest => dest.Tags, opt => opt.Ignore());

            CreateMap<PostUpdate, Post>()
                .ForAllMembers(opts =>
                    opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Post, PostResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.userId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.userName))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.avatarUrl))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.title))
                .ForMember(dest => dest.Body, opt => opt.MapFrom(src => src.body))
                .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => src.slug))
                .ForMember(dest => dest.PostType, opt => opt.MapFrom(src => src.postType))
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(src => src.parentId))
                .ForMember(dest => dest.AnswerCount, opt => opt.MapFrom(src =>
                    src.ChildAnswers.Count(a => a.deleted != true)))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                    src.Tags.Select(t => t.name).ToList()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.createdAt));
        }
    }
}
