using Demo.Shared.Enums;

namespace Demo.Features.Votes.DTOs
{
    public class VoteResponse
    {
        public long PostId { get; set; }
        public int VoteCount { get; set; }
        public VoteType? CurrentUserVote { get; set; }
        public int CurrentUserReputation { get; set; }
        public int PostAuthorReputation { get; set; }
    }
}
