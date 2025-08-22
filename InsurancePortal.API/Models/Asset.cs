using System;
using System.Collections.Generic;

namespace InsurancePortal.API.Models
{
    public class Asset
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } = string.Empty; // e.g., Car, House, Boat, Rental
        public string Name { get; set; } = string.Empty; // e.g., "Toyota Camry"
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Vehicle-specific
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public int? VehicleYear { get; set; }
    public string? VIN { get; set; }
    public string? LicensePlate { get; set; }
    public int? Odometer { get; set; }

    // Home-specific
    public string? Address { get; set; }
    public int? YearBuilt { get; set; }
    public int? SquareFeet { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }

    // Life-specific
    public DateTime? DateOfBirth { get; set; }
    public decimal? CoverageAmount { get; set; }
    public string? Beneficiary { get; set; }

    // Rental-specific
    public string? UnitNumber { get; set; }
    public string? LandlordName { get; set; }
        // Navigation
        public List<UserPolicy>? UserPolicies { get; set; }
    }
}
