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
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
    public DbSet<InsurancePolicy> Policies { get; set; }
    public DbSet<UserPolicy> UserPolicies { get; set; }
        public DbSet<Asset> Assets { get; set; }
    public DbSet<Beneficiary> Beneficiaries { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserPolicy>()
                .HasOne(up => up.Asset)
                .WithMany(a => a.UserPolicies)
                .HasForeignKey(up => up.AssetId)
                .OnDelete(DeleteBehavior.SetNull);

            // default mapping for Beneficiary if needed
            modelBuilder.Entity<Beneficiary>()
                .HasKey(b => b.Id);
        }
    }
}