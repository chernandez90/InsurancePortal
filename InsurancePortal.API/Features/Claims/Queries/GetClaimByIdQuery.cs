using InsurancePortal.API.Models;
using MediatR;

namespace InsurancePortal.API.Features.Claims.Queries
{
    public class GetClaimByIdQuery : IRequest<InsuranceClaim?>
    {
        public int Id { get; set; }
    }
}
