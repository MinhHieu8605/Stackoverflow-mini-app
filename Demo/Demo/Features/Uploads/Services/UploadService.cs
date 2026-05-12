using Demo.Features.Uploads.DTOs;
using Demo.Shared.Exceptions;

namespace Demo.Features.Uploads.Services
{
    public class UploadService : IUploadService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public UploadService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<UploadResponse> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("File is required");
            }

            if (file.Length > MaxFileSize)
            {
                throw new BadRequestException("File size must not exceed 5MB");
            }

            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(fileExtension))
            {
                throw new BadRequestException("Only jpg, jpeg, png, gif files are allowed");
            }

            var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{fileName}";

            return new UploadResponse
            {
                FileName = fileName,
                FileUrl = fileUrl,
                FileSize = file.Length,
                ContentType = file.ContentType
            };
        }
    }
}
