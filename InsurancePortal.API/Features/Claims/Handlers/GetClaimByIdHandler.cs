using InsurancePortal.API.Features.Claims.Queries;
using InsurancePortal.API.Models;
using InsurancePortal.API.Repositories;
using MediatR;

namespace InsurancePortal.API.Features.Claims.Handlers
{
    public class GetClaimByIdHandler : IRequestHandler<GetClaimByIdQuery, InsuranceClaim?>
    {
        private readonly IClaimRepository _repository;

        public GetClaimByIdHandler(IClaimRepository repository)
        {
            _repository = repository;
        }

        public async Task<InsuranceClaim?> Handle(GetClaimByIdQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByIdAsync(request.Id);
        }
    }
}
