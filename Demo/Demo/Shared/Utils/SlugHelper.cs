namespace Demo.Shared.Utils
{
    public static class SlugHelper
    {
        public static string GenerateSlug(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return string.Empty;

            var slug = title.Trim().ToLowerInvariant();

            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
            slug = slug.Trim('-');

            var suffix = Guid.NewGuid().ToString("N")[..6];
            return $"{slug}-{suffix}";
        }
    }
}
