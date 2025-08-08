using InsurancePortal.API.Features.Claims.Commands;
using InsurancePortal.API.Models;
using InsurancePortal.API.Repositories;
using MediatR;

namespace InsurancePortal.API.Features.Claims.Handlers
{
    public class CreateClaimHandler : IRequestHandler<CreateClaimCommand, InsuranceClaim>
    {
        private readonly IClaimRepository _repository;

        public CreateClaimHandler(IClaimRepository repository)
        {
            _repository = repository;
        }

        public async Task<InsuranceClaim> Handle(CreateClaimCommand request, CancellationToken cancellationToken)
        {
            var claim = new InsuranceClaim
            {
                PolicyNumber = request.ClaimDto.PolicyNumber,
                Description = request.ClaimDto.Description,
                DateFiled = request.ClaimDto.DateFiled
            };

            return await _repository.CreateAsync(claim);
        }
    }
}
