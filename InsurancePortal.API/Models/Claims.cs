namespace InsurancePortal.API.Models
{
    public class InsuranceClaim
    {
        public int Id { get; set; }
        public string PolicyNumber { get; set; }
        public string Description { get; set; }
        public DateTime DateFiled { get; set; }
    }

}