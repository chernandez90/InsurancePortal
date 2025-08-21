// InsurancePortal.API/DTOs/RegisterResultDto.cs
namespace InsurancePortal.API.DTOs
{
    public class RegisterResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public AuthResponseDto? AuthResponse { get; set; }
    }
}