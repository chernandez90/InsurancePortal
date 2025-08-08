using Amazon.S3;
using Amazon.S3.Model;

namespace InsurancePortal.API.Services
{
    public class S3DocumentService : IDocumentService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;

        public S3DocumentService(IAmazonS3 s3Client, IConfiguration configuration)
        {
            _s3Client = s3Client;
            _bucketName = configuration["AWS:S3:BucketName"] ?? "insurance-portal-documents";
        }

        public async Task<string> UploadDocumentAsync(IFormFile file, int claimId)
        {
            var key = $"claims/{claimId}/{Guid.NewGuid()}-{file.FileName}";
            
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = file.OpenReadStream(),
                ContentType = file.ContentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            await _s3Client.PutObjectAsync(request);
            return key;
        }

        public async Task<byte[]> DownloadDocumentAsync(string key)
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            using var response = await _s3Client.GetObjectAsync(request);
            using var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }

        public async Task<bool> DeleteDocumentAsync(string key)
        {
            try
            {
                await _s3Client.DeleteObjectAsync(_bucketName, key);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<string>> GetClaimDocumentsAsync(int claimId)
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = $"claims/{claimId}/"
            };

            var response = await _s3Client.ListObjectsV2Async(request);
            return response.S3Objects.Select(obj => obj.Key).ToList();
        }
    }
}
