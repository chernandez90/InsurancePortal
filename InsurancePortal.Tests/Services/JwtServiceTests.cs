using FluentAssertions;
using InsurancePortal.API.Models;
using InsurancePortal.API.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace InsurancePortal.Tests.Services
{
    public class JwtServiceTests
    {
        private readonly JwtService _jwtService;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public JwtServiceTests()
        {
            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(x => x["Jwt:SecretKey"]).Returns("this-is-a-very-long-secret-key-for-testing-jwt-tokens");
            _mockConfiguration.Setup(x => x["Jwt:Issuer"]).Returns("test-issuer");
            _mockConfiguration.Setup(x => x["Jwt:Audience"]).Returns("test-audience");

            _jwtService = new JwtService(_mockConfiguration.Object);
        }

        [Fact]
        public void GenerateToken_ShouldReturnValidJwtToken()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                Role = "User"
            };

            // Act
            var token = _jwtService.GenerateToken(user);

            // Assert
            token.Should().NotBeNullOrEmpty();
            
            // Verify it's a valid JWT token
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            
            jsonToken.Should().NotBeNull();
            jsonToken.Issuer.Should().Be("test-issuer");
            jsonToken.Audiences.Should().Contain("test-audience");
        }

        [Fact]
        public void GenerateToken_ShouldIncludeCorrectClaims()
        {
            // Arrange
            var user = new User
            {
                Id = 42,
                Username = "testuser",
                Email = "test@example.com",
                Role = "Admin"
            };

            // Act
            var token = _jwtService.GenerateToken(user);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            
            var claims = jsonToken.Claims.ToList();
            
            claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == "42");
            claims.Should().Contain(c => c.Type == ClaimTypes.Name && c.Value == "testuser");
            claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == "test@example.com");
            claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
        }

        [Fact]
        public void GenerateToken_ShouldHaveCorrectExpiration()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                Role = "User"
            };

            // Act
            var token = _jwtService.GenerateToken(user);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            
            // Token should expire in approximately 24 hours (allow 1 minute tolerance)
            var expectedExpiry = DateTime.UtcNow.AddHours(24);
            jsonToken.ValidTo.Should().BeCloseTo(expectedExpiry, TimeSpan.FromMinutes(1));
        }
    }
}