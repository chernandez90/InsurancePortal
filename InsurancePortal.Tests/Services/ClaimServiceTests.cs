using FluentAssertions;
using InsurancePortal.API.Models;
using InsurancePortal.API.Services;
using InsurancePortal.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InsurancePortal.Tests.Services
{
    public class ClaimServiceTests
    {
        [Fact]
        public async Task GetAllClaimsAsync_ShouldReturnAllClaims()
        {
            // Arrange
            using var context = await TestDbHelper.GetSeededDbContextAsync();
            var claimService = new ClaimService(context);

            // Act
            var result = await claimService.GetAllClaimsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(c => c.PolicyNumber == "POL-001");
            result.Should().Contain(c => c.PolicyNumber == "POL-002");
        }

        [Fact]
        public async Task GetAllClaimsAsync_WithEmptyDatabase_ShouldReturnEmptyList()
        {
            // Arrange
            using var context = TestDbHelper.GetInMemoryDbContext();
            var claimService = new ClaimService(context);

            // Act
            var result = await claimService.GetAllClaimsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SubmitClaimAsync_ShouldAddClaimToDatabase()
        {
            // Arrange
            using var context = TestDbHelper.GetInMemoryDbContext();
            var claimService = new ClaimService(context);
            
            var newClaim = new InsuranceClaim
            {
                PolicyNumber = "POL-003",
                Description = "New test claim",
                DateFiled = DateTime.UtcNow
            };

            // Act
            var result = await claimService.SubmitClaimAsync(newClaim);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            result.PolicyNumber.Should().Be("POL-003");
            result.Description.Should().Be("New test claim");

            // Verify it was saved to database
            var savedClaim = await context.Claims.FirstOrDefaultAsync(c => c.PolicyNumber == "POL-003");
            savedClaim.Should().NotBeNull();
        }

        [Fact]
        public async Task SubmitClaimAsync_ShouldReturnClaimWithGeneratedId()
        {
            // Arrange
            using var context = TestDbHelper.GetInMemoryDbContext();
            var claimService = new ClaimService(context);
            
            var newClaim = new InsuranceClaim
            {
                PolicyNumber = "POL-004",
                Description = "Another test claim",
                DateFiled = DateTime.UtcNow
            };

            // Act
            var result = await claimService.SubmitClaimAsync(newClaim);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            
            // The service should return the same object that was passed in
            result.Should().BeSameAs(newClaim);
        }
    }
}