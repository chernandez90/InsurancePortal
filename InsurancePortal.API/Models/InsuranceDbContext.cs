using Microsoft.EntityFrameworkCore;
using InsurancePortal.API.Models;

namespace InsurancePortal.API.Models
{
    public class InsuranceDbContext : DbContext
    {
        public InsuranceDbContext(DbContextOptions<InsuranceDbContext> options)
            : base(options) { }

        public DbSet<InsuranceClaim> Claims { get; set; }
        public DbSet<User> Users { get; set; }
    }
}