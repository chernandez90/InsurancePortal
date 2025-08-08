using System.Collections.Generic;
using System.Threading.Tasks;
using InsurancePortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InsurancePortal.API.Services
{
    public class ClaimService
    {
        private readonly InsuranceDbContext _context;

        public ClaimService(InsuranceDbContext context)
        {
            _context = context;
        }

        public async Task<List<InsuranceClaim>> GetAllClaimsAsync()
        {
            return await _context.Set<InsuranceClaim>().ToListAsync();
        }
        public async Task<InsuranceClaim> SubmitClaimAsync(InsuranceClaim newClaim)
        {
            _context.Set<InsuranceClaim>().Add(newClaim);
            await _context.SaveChangesAsync();
            return newClaim;
        }

    }
}