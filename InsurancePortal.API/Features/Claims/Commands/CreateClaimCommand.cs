using InsurancePortal.API.DTOs;
using InsurancePortal.API.Models;
using MediatR;

namespace InsurancePortal.API.Features.Claims.Commands
{
    public class CreateClaimCommand : IRequest<InsuranceClaim>
    {
        public ClaimDto ClaimDto { get; set; } = null!;
    }
}
