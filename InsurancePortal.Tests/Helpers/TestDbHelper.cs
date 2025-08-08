using Microsoft.EntityFrameworkCore;
using InsurancePortal.API.Models;

namespace InsurancePortal.Tests.Helpers
{
    public static class TestDbHelper
    {
        public static InsuranceDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<InsuranceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new InsuranceDbContext(options);
        }

        public static async Task<InsuranceDbContext> GetSeededDbContextAsync()
        {
            var context = GetInMemoryDbContext();

            // Seed test data
            var testClaims = new List<InsuranceClaim>
            {
                new InsuranceClaim
                {
                    Id = 1,
                    PolicyNumber = "POL-001",
                    Description = "Test claim 1",
                    DateFiled = DateTime.UtcNow.AddDays(-10)
                },
                new InsuranceClaim
                {
                    Id = 2,
                    PolicyNumber = "POL-002",
                    Description = "Test claim 2",
                    DateFiled = DateTime.UtcNow.AddDays(-5)
                }
            };

            var testUsers = new List<User>
            {
                new User
                {
                    Id = 1,
                    Username = "testuser",
                    Email = "test@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = "User"
                }
            };

            context.Claims.AddRange(testClaims);
            context.Users.AddRange(testUsers);
            await context.SaveChangesAsync();

            return context;
        }
    }
}