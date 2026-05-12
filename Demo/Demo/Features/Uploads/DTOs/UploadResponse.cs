namespace Demo.Features.Uploads.DTOs
{
    public class UploadResponse
    {
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; }
    }
}
