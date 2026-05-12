using AutoMapper;
using Demo.Features.Comments.DTOs;
using Demo.Shared.Domain;

namespace Demo.Features.Comments.Mappings
{
    public class CommentProfile : Profile
    {
        public CommentProfile()
        {
            CreateMap<Comment, CommentResponse>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
                .ForMember(dest => dest.PostId, opt => opt.MapFrom(src => src.postId))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.userId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.userName))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.content))
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.score))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.createdAt));
        }
    }
}
