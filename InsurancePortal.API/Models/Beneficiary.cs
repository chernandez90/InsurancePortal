namespace InsurancePortal.API.Models
{
    public class Beneficiary
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Relationship { get; set; }
        public decimal? Percentage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
