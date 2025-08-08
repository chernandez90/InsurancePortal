using Microsoft.EntityFrameworkCore;
using InsurancePortal.API.Models;

namespace InsurancePortal.Tests.Helpers
{
    public static class TestDbHelper
    {
        public static InsuranceDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<InsuranceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
                .Options;

            return new InsuranceDbContext(options);
        }

        public static async Task<InsuranceDbContext> GetSeededDbContextAsync()
        {
            var context = GetInMemoryDbContext();

            // Seed test data
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

            context.Users.AddRange(testUsers);
            await context.SaveChangesAsync();

            return context;
        }
    }
}