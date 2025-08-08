using InsurancePortal.API.Models;

namespace InsurancePortal.API.Repositories
{
    public interface IClaimRepository
    {
        Task<List<InsuranceClaim>> GetAllAsync();
        Task<InsuranceClaim?> GetByIdAsync(int id);
        Task<InsuranceClaim> CreateAsync(InsuranceClaim claim);
        Task<InsuranceClaim?> UpdateAsync(int id, InsuranceClaim claim);
        Task<bool> DeleteAsync(int id);
        Task<List<InsuranceClaim>> GetByPolicyNumberAsync(string policyNumber);
    }
}
