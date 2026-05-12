namespace Demo.Features.Users.Builder
{
    public class UserSearchBuilder
    {
        public string? UserName { get; private set; }
        public string? Email { get; private set; }
        public string? DisplayName { get; private set; }
        public string? Location { get; private set; }   
        public int? MinReputation { get; private set; }
        public int? MaxReputation { get; private set; }
        public bool? Deleted { get; private set; }

        private UserSearchBuilder() { }

        public class Builder
        {
            private readonly UserSearchBuilder _instance = new();

            public Builder SetUserName(string? userName)
            {
                _instance.UserName = userName?.Trim();
                return this;
            }
            public Builder SetEmail(string? email)
            {
                _instance.Email = email?.Trim();
                return this;
            }
            public Builder SetDisplayName(string? displayName)
            {
                _instance.DisplayName = displayName?.Trim();
                return this;
            }
            public Builder SetLocation(string? location)
            {
                _instance.Location = location?.Trim();
                return this;
            }
            public Builder SetMinReputation(int? minReputation)
            {
                _instance.MinReputation = minReputation;
                return this;
            }
            public Builder SetMaxReputation(int? maxReputation)
            {
                _instance.MaxReputation = maxReputation;
                return this;
            }
            public Builder SetDeleted(bool? deleted)
            {
                _instance.Deleted = deleted;
                return this;
            }

            public UserSearchBuilder Build() => _instance;

        }

    }
}
