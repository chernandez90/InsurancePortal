using Microsoft.AspNetCore.Mvc;
using InsurancePortal.API.Models;
using System.Security.Claims;

namespace InsurancePortal.API.Controllers
{
    using Microsoft.AspNetCore.Authorization;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BeneficiariesController : ControllerBase
    {
        private readonly InsuranceDbContext _db;

        public BeneficiariesController(InsuranceDbContext db)
        {
            _db = db;
        }

        [HttpGet("mine")]
        public IActionResult Mine()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var list = _db.Beneficiaries.Where(b => b.UserId == userId.Value).ToList();
            return Ok(list);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Beneficiary model)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var b = new Beneficiary
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                Name = model.Name,
                Relationship = model.Relationship,
                Percentage = model.Percentage,
                CreatedAt = DateTime.UtcNow
            };
            _db.Beneficiaries.Add(b);
            _db.SaveChanges();
            return Ok(b);
        }

        [HttpDelete("{id:guid}")]
        public IActionResult Delete(Guid id)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var b = _db.Beneficiaries.Find(id);
            if (b == null) return NotFound();
            if (b.UserId != userId.Value) return Forbid();

            _db.Beneficiaries.Remove(b);
            _db.SaveChanges();
            return Ok();
        }

        private int? GetUserIdFromClaims()
        {
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
