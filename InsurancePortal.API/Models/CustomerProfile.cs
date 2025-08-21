// InsurancePortal.API/Models/CustomerProfile.cs
namespace InsurancePortal.API.Models
{
    public class CustomerProfile
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty; // Link to Auth User
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime? Dob { get; set; } // Date of Birth (nullable)
    }
}