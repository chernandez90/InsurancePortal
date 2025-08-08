using InsurancePortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InsurancePortal.API.Repositories
{
    public class ClaimRepository : IClaimRepository
    {
        private readonly InsuranceDbContext _context;

        public ClaimRepository(InsuranceDbContext context)
        {
            _context = context;
        }

        public async Task<List<InsuranceClaim>> GetAllAsync()
        {
            return await _context.Claims.ToListAsync();
        }

        public async Task<InsuranceClaim?> GetByIdAsync(int id)
        {
            return await _context.Claims.FindAsync(id);
        }

        public async Task<InsuranceClaim> CreateAsync(InsuranceClaim claim)
        {
            _context.Claims.Add(claim);
            await _context.SaveChangesAsync();
            return claim;
        }

        public async Task<InsuranceClaim?> UpdateAsync(int id, InsuranceClaim claim)
        {
            var existingClaim = await _context.Claims.FindAsync(id);
            if (existingClaim == null) return null;

            existingClaim.PolicyNumber = claim.PolicyNumber;
            existingClaim.Description = claim.Description;
            existingClaim.DateFiled = claim.DateFiled;

            await _context.SaveChangesAsync();
            return existingClaim;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var claim = await _context.Claims.FindAsync(id);
            if (claim == null) return false;

            _context.Claims.Remove(claim);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<InsuranceClaim>> GetByPolicyNumberAsync(string policyNumber)
        {
            return await _context.Claims
                .Where(c => c.PolicyNumber == policyNumber)
                .ToListAsync();
        }
    }
}
