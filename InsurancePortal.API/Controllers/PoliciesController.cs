using Microsoft.AspNetCore.Mvc;
using InsurancePortal.API.Models;
using System.Security.Claims;

namespace InsurancePortal.API.Controllers
{
    using Microsoft.AspNetCore.Authorization;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PoliciesController : ControllerBase
    {
        private readonly InsuranceDbContext _db;

        // Simple in-memory catalog for demo purposes
        private static readonly List<InsurancePolicy> _catalog = new()
        {
            new InsurancePolicy { Id = Guid.NewGuid(), Code = "AUTO-001", Name = "Auto Insurance", Description = "Coverage for vehicles.", MonthlyPremium = 79.99M, SupportedAssetType = SupportedAssetType.Auto },
            new InsurancePolicy { Id = Guid.NewGuid(), Code = "HOME-001", Name = "Homeowners Insurance", Description = "Protect your home.", MonthlyPremium = 129.99M, SupportedAssetType = SupportedAssetType.Home },
            new InsurancePolicy { Id = Guid.NewGuid(), Code = "LIFE-001", Name = "Term Life Insurance", Description = "Protect your loved ones.", MonthlyPremium = 49.99M, SupportedAssetType = SupportedAssetType.Life }
        };

        public PoliciesController(InsuranceDbContext db)
        {
            _db = db;

            // Ensure catalog policies exist in DB
            if (!_db.Policies.Any())
            {
                _db.Policies.AddRange(_catalog);
                _db.SaveChanges();
            }
        }

        [HttpGet("catalog")]
        public IActionResult Catalog()
        {
            var items = _db.Policies.Where(p => p.IsActive).ToList();
            return Ok(items);
        }

    [HttpPost("{policyId:guid}/purchase")]
    public IActionResult Purchase(Guid policyId, [FromQuery] Guid? assetId, [FromQuery] Guid? beneficiaryId)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var policy = _db.Policies.Find(policyId);
            if (policy == null) return NotFound();

            var userPolicy = new UserPolicy
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                PolicyId = policy.Id,
                EffectiveDate = DateTime.UtcNow,
                AssetId = assetId,
                BeneficiaryId = beneficiaryId
            };

            _db.UserPolicies.Add(userPolicy);
            _db.SaveChanges();

            return Ok(userPolicy);
        }

        [HttpGet("mine")]
        public IActionResult Mine()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var policies = _db.UserPolicies
                .Where(up => up.UserId == userId.Value)
                .Select(up => new {
                    up.Id,
                    up.PolicyId,
                    up.EffectiveDate,
                    up.TerminatedDate,
                    up.IsActive,
                    up.AssetId,
                    up.BeneficiaryId,
                    Policy = _db.Policies.FirstOrDefault(p => p.Id == up.PolicyId)
                })
                .ToList();

            return Ok(policies);
        }

        [HttpPost("{userPolicyId:guid}/terminate")]
        public IActionResult Terminate(Guid userPolicyId)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var up = _db.UserPolicies.Find(userPolicyId);
            if (up == null) return NotFound();
            if (up.UserId != userId.Value) return Forbid();

            up.TerminatedDate = DateTime.UtcNow;
            _db.SaveChanges();
            return Ok(up);
        }

        private int? GetUserIdFromClaims()
        {
            // Try common claim types: NameIdentifier, sub, or custom 'id'
            var candidates = new[] { ClaimTypes.NameIdentifier, "sub", "id" };
            foreach (var c in candidates)
            {
                var claim = User.FindFirst(c)?.Value;
                if (!string.IsNullOrEmpty(claim) && int.TryParse(claim, out var parsed)) return parsed;
            }
            return null;
        }
    }
}
