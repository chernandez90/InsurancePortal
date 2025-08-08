using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using InsurancePortal.API.Models;
using InsurancePortal.API.DTOs;
using InsurancePortal.API.Services;
using InsurancePortal.API.Features.Claims.Commands;
using InsurancePortal.API.Features.Claims.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using InsurancePortal.API.Hubs;
using MediatR;

namespace InsurancePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClaimsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<ClaimHub> _hubContext;
        private readonly IDocumentService _documentService;

        public ClaimsController(
            IMediator mediator, 
            IHubContext<ClaimHub> hubContext,
            IDocumentService documentService)
        {
            _mediator = mediator;
            _hubContext = hubContext;
            _documentService = documentService;
        }

        [HttpPost]
        public async Task<ActionResult<InsuranceClaim>> SubmitClaim([FromBody] ClaimDto claimDto)
        {
            var command = new CreateClaimCommand { ClaimDto = claimDto };
            var claim = await _mediator.Send(command);

            // Notify all clients of new claim
            await _hubContext.Clients.All.SendAsync("ReceiveClaimUpdate", 
                $"New claim created: {claim.PolicyNumber}");

            return CreatedAtAction(nameof(GetClaimById), new { id = claim.Id }, claim);
        }

        [HttpGet]
        public async Task<ActionResult<List<InsuranceClaim>>> GetAllClaims()
        {
            var query = new GetAllClaimsQuery();
            var claims = await _mediator.Send(query);
            return Ok(claims);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InsuranceClaim>> GetClaimById(int id)
        {
            var query = new GetClaimByIdQuery { Id = id };
            var claim = await _mediator.Send(query);
            
            if (claim == null)
            {
                return NotFound($"Claim with ID {id} not found.");
            }
            
            return Ok(claim);
        }

        [HttpPost("{id}/documents")]
        public async Task<ActionResult<string>> UploadDocument(int id, IFormFile file)
        {
            // First check if claim exists
            var query = new GetClaimByIdQuery { Id = id };
            var claim = await _mediator.Send(query);
            
            if (claim == null)
            {
                return NotFound($"Claim with ID {id} not found.");
            }

            var key = await _documentService.UploadDocumentAsync(file, id);
            
            await _hubContext.Clients.All.SendAsync("ReceiveClaimUpdate", 
                $"Document uploaded for claim {id}");
                
            return Ok(new { DocumentKey = key });
        }

        [HttpGet("{id}/documents")]
        public async Task<ActionResult<List<string>>> GetClaimDocuments(int id)
        {
            // First check if claim exists
            var query = new GetClaimByIdQuery { Id = id };
            var claim = await _mediator.Send(query);
            
            if (claim == null)
            {
                return NotFound($"Claim with ID {id} not found.");
            }

            var documents = await _documentService.GetClaimDocumentsAsync(id);
            return Ok(documents);
        }
    }
}