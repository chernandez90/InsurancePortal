namespace InsurancePortal.API.Models
{
    public class UserPolicy
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public Guid PolicyId { get; set; }
        public Guid? AssetId { get; set; }
        public Guid? BeneficiaryId { get; set; }
        public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;
        public DateTime? TerminatedDate { get; set; }
        public bool IsActive => TerminatedDate == null;

    // Navigation properties (optional)
    public InsurancePolicy? Policy { get; set; }
    public Asset? Asset { get; set; }
    public Beneficiary? Beneficiary { get; set; }
    }
}
