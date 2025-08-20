// InsurancePortal.API/Controllers/CustomerProfileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InsurancePortal.API.Models;
using System.Security.Claims;

namespace InsurancePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomerProfileController : ControllerBase
    {
        private readonly InsuranceDbContext _context;

        public CustomerProfileController(InsuranceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CustomerProfile>> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var profile = await _context.CustomerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] CustomerProfile updatedProfile)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var profile = await _context.CustomerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound();

            profile.FirstName = updatedProfile.FirstName;
            profile.LastName = updatedProfile.LastName;
            profile.Email = updatedProfile.Email;
            profile.Phone = updatedProfile.Phone;
            profile.Address = updatedProfile.Address;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<CustomerProfile>> CreateProfile([FromBody] CustomerProfile newProfile)
        {
            // Optionally, set UserId from the authenticated user
            newProfile.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            _context.CustomerProfiles.Add(newProfile);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProfile), new { id = newProfile.Id }, newProfile);
        }
    }
}