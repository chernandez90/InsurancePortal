// InsurancePortal.API/DTOs/RegisterResultDto.cs
namespace InsurancePortal.API.DTOs
{
    public class RegisterResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public AuthResponseDto? AuthResponse { get; set; }
    // Back-compat helpers: expose commonly expected fields directly for tests / callers
    public string? Token => AuthResponse?.Token;
    public string? Username => AuthResponse?.Username;
    public string? Email => AuthResponse?.Email;
    public string? Role => AuthResponse?.Role;
    }
}