namespace InsurancePortal.API.Models
{
    public class InsurancePolicy
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty; // e.g., AUTO-001
        public string Name { get; set; } = string.Empty; // e.g., Auto Insurance
        public string Description { get; set; } = string.Empty;
        public decimal MonthlyPremium { get; set; }
        public bool IsActive { get; set; } = true;
    // Optional explicit supported asset type for stronger client filtering
    public SupportedAssetType? SupportedAssetType { get; set; }
    }
}
