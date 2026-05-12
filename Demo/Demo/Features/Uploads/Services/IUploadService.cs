using Demo.Features.Uploads.DTOs;

namespace Demo.Features.Uploads.Services
{
    public interface IUploadService
    {
        Task<UploadResponse> UploadFileAsync(IFormFile file);
    }
}
