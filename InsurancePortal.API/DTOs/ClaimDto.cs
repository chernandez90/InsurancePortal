namespace InsurancePortal.API.DTOs
{
    public class ClaimDto
    {
        public int Id { get; set; }
        public required string PolicyNumber { get; set; } // Add required
        public required string Description { get; set; }  // Add required
        public DateTime DateFiled { get; set; }
    }
}
