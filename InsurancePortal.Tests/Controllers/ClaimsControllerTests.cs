using FluentAssertions;
using InsurancePortal.API.Models;
using InsurancePortal.API.DTOs;
using InsurancePortal.Tests.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Xunit;

namespace InsurancePortal.Tests.Controllers
{
    public class ClaimsControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public ClaimsControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove existing DbContext registration
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<InsuranceDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    // Add in-memory database for testing
                    services.AddDbContext<InsuranceDbContext>(options =>
                        options.UseInMemoryDatabase("TestDatabase"));

                    // Disable authorization for testing
                    services.AddSingleton<IPolicyEvaluator, DisableAuthenticationPolicyEvaluator>();
                });
            });
        }

        [Fact]
        public async Task GetAllClaims_ShouldReturnEmptyList_WhenNoClaims()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/claims");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            var claims = JsonSerializer.Deserialize<List<InsuranceClaim>>(content, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });
            
            claims.Should().NotBeNull();
            claims.Should().BeEmpty();
        }

        [Fact]
        public async Task PostClaim_ShouldCreateClaim_WhenValidData()
        {
            // Arrange
            var client = _factory.CreateClient();
            var claimDto = new ClaimDto
            {
                PolicyNumber = "POL-TEST-001",
                Description = "Test claim description",
                DateFiled = DateTime.UtcNow
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/claims", claimDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var content = await response.Content.ReadAsStringAsync();
            var createdClaim = JsonSerializer.Deserialize<InsuranceClaim>(content, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });
            
            createdClaim.Should().NotBeNull();
            createdClaim!.PolicyNumber.Should().Be("POL-TEST-001");
            createdClaim.Description.Should().Be("Test claim description");
            createdClaim.Id.Should().BeGreaterThan(0);
        }

        // Helper class to disable authentication for testing
        public class DisableAuthenticationPolicyEvaluator : IPolicyEvaluator
        {
            public Task<AuthenticateResult> AuthenticateAsync(AuthorizationPolicy policy, HttpContext context)
            {
                var result = AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(), "Test"));
                return Task.FromResult(result);
            }

            public Task<PolicyAuthorizationResult> AuthorizeAsync(AuthorizationPolicy policy, AuthenticateResult authenticationResult, HttpContext context, object? resource)
            {
                return Task.FromResult(PolicyAuthorizationResult.Success());
            }
        }
    }
}