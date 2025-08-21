// InsurancePortal.API/Controllers/CustomerProfileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InsurancePortal.API.Models;
using System.Security.Claims;
using System.Text.RegularExpressions;

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

            // Check for whitespace in username
            if (string.IsNullOrWhiteSpace(userId) || Regex.IsMatch(userId, @"\s"))
            {
                return BadRequest("Username must not contain whitespace characters.");
            }

            var profile = await _context.CustomerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound();

            // Check for unique email (exclude current user's profile)
            bool emailExists = await _context.CustomerProfiles
                .AnyAsync(p => p.Email == updatedProfile.Email && p.UserId != userId);
            if (emailExists)
            {
                return BadRequest("Email address is already in use.");
            }

            profile.FirstName = updatedProfile.FirstName;
            profile.LastName = updatedProfile.LastName;
            profile.Email = updatedProfile.Email;
            profile.Phone = updatedProfile.Phone;
            profile.Address = updatedProfile.Address;
            profile.Dob = updatedProfile.Dob;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<CustomerProfile>> CreateProfile([FromBody] CustomerProfile newProfile)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Check for whitespace in username
            if (string.IsNullOrWhiteSpace(userId) || Regex.IsMatch(userId, @"\s"))
            {
                return BadRequest("Username must not contain whitespace characters.");
            }

            // Check for unique email
            bool emailExists = await _context.CustomerProfiles
                .AnyAsync(p => p.Email == newProfile.Email);
            if (emailExists)
            {
                return BadRequest("Email address is already in use.");
            }

            newProfile.UserId = userId;

            _context.CustomerProfiles.Add(newProfile);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProfile), new { id = newProfile.Id }, newProfile);
        }
    }
}