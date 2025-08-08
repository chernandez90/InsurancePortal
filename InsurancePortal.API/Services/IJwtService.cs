using InsurancePortal.API.Models;

namespace InsurancePortal.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
