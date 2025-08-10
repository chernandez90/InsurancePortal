namespace InsurancePortal.API.Models
{
    public class InsuranceClaim
    {
        public int Id { get; set; }
        public required string PolicyNumber { get; set; } // Add required
        public required string Description { get; set; }  // Add required
        public DateTime DateFiled { get; set; }
        public string UserId { get; set; } = string.Empty;
    }

}