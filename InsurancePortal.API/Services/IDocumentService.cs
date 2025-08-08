namespace InsurancePortal.API.Services
{
    public interface IDocumentService
    {
        Task<string> UploadDocumentAsync(IFormFile file, int claimId);
        Task<byte[]> DownloadDocumentAsync(string key);
        Task<bool> DeleteDocumentAsync(string key);
        Task<List<string>> GetClaimDocumentsAsync(int claimId);
    }
}
