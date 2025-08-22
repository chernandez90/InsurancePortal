using Microsoft.AspNetCore.Mvc;
using InsurancePortal.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace InsurancePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssetsController : ControllerBase
    {
        private readonly InsuranceDbContext _db;

        public AssetsController(InsuranceDbContext db)
        {
            _db = db;
        }

        [HttpGet("mine")]
        public IActionResult Mine()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var assets = _db.Assets.Where(a => a.UserId == userId.Value).ToList();
            return Ok(assets);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Asset input)
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                Type = input.Type,
                Name = input.Name,
                Description = input.Description,
                CreatedAt = DateTime.UtcNow,
                // vehicle
                VehicleMake = input.VehicleMake,
                VehicleModel = input.VehicleModel,
                VehicleYear = input.VehicleYear,
                VIN = input.VIN,
                LicensePlate = input.LicensePlate,
                Odometer = input.Odometer,
                // home
                Address = input.Address,
                YearBuilt = input.YearBuilt,
                SquareFeet = input.SquareFeet,
                Bedrooms = input.Bedrooms,
                Bathrooms = input.Bathrooms,
                // life
                DateOfBirth = input.DateOfBirth,
                CoverageAmount = input.CoverageAmount,
                Beneficiary = input.Beneficiary,
                // rental
                UnitNumber = input.UnitNumber,
                LandlordName = input.LandlordName
            };

            _db.Assets.Add(asset);
            _db.SaveChanges();
            return Ok(asset);
        }

        [HttpGet("{id:guid}")]
        public IActionResult Get(Guid id)
        {
            var asset = _db.Assets.Find(id);
            if (asset == null) return NotFound();
            var userId = GetUserIdFromClaims();
            if (userId == null || asset.UserId != userId.Value) return Forbid();
            return Ok(asset);
        }

        [HttpDelete("{id:guid}")]
        public IActionResult Delete(Guid id)
        {
            var asset = _db.Assets.Find(id);
            if (asset == null) return NotFound();
            var userId = GetUserIdFromClaims();
            if (userId == null || asset.UserId != userId.Value) return Forbid();

            _db.Assets.Remove(asset);
            _db.SaveChanges();
            return NoContent();
        }

        private int? GetUserIdFromClaims()
        {
            var candidates = new[] { System.Security.Claims.ClaimTypes.NameIdentifier, "sub", "id" };
            foreach (var c in candidates)
            {
                var claim = User.FindFirst(c)?.Value;
                if (!string.IsNullOrEmpty(claim) && int.TryParse(claim, out var parsed)) return parsed;
            }
            return null;
        }
    }
}
