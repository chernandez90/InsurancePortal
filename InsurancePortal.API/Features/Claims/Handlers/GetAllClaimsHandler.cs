using InsurancePortal.API.Features.Claims.Queries;
using InsurancePortal.API.Models;
using InsurancePortal.API.Repositories;
using MediatR;

namespace InsurancePortal.API.Features.Claims.Handlers
{
    public class GetAllClaimsHandler : IRequestHandler<GetAllClaimsQuery, List<InsuranceClaim>>
    {
        private readonly IClaimRepository _repository;

        public GetAllClaimsHandler(IClaimRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<InsuranceClaim>> Handle(GetAllClaimsQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync();
        }
    }
}
