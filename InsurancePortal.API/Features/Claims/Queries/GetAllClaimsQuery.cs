using InsurancePortal.API.Models;
using MediatR;

namespace InsurancePortal.API.Features.Claims.Queries
{
    public class GetAllClaimsQuery : IRequest<List<InsuranceClaim>>
    {
    }
}
