namespace InsurancePortal.API.DTOs
{
    public class ClaimDto
    {
        public string PolicyNumber { get; set; }
        public string Description { get; set; }
        public DateTime DateFiled { get; set; }
        // Add validation attributes if needed

    }
}
