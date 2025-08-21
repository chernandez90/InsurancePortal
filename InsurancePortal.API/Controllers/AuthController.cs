using Microsoft.AspNetCore.Mvc;
using InsurancePortal.API.DTOs;
using InsurancePortal.API.Services;

namespace InsurancePortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            
            if (result == null)
            {
                return Unauthorized("Invalid username or password");
            }

            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);

            if (result == null || !result.Success)
            {
                return BadRequest(result?.Error ?? "Registration failed");
            }

            return Ok(result.AuthResponse);
        }
    }
}