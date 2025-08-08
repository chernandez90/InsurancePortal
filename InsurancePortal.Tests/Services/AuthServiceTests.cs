using FluentAssertions;
using InsurancePortal.API.DTOs;
using InsurancePortal.API.Models;
using InsurancePortal.API.Services;
using InsurancePortal.Tests.Helpers;
using Moq;
using Xunit;

namespace InsurancePortal.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IJwtService> _mockJwtService;

        public AuthServiceTests()
        {
            _mockJwtService = new Mock<IJwtService>();
            _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>()))
                          .Returns("test-jwt-token");
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnAuthResponse()
        {
            // Arrange
            using var context = await TestDbHelper.GetSeededDbContextAsync();
            var authService = new AuthService(context, _mockJwtService.Object);
            
            var loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "password123"
            };

            // Act
            var result = await authService.LoginAsync(loginDto);

            // Assert
            result.Should().NotBeNull();
            result!.Token.Should().Be("test-jwt-token");
            result.Username.Should().Be("testuser");
            result.Email.Should().Be("test@example.com");
            result.Role.Should().Be("User");
        }

        [Fact]
        public async Task LoginAsync_WithInvalidUsername_ShouldReturnNull()
        {
            // Arrange
            using var context = await TestDbHelper.GetSeededDbContextAsync();
            var authService = new AuthService(context, _mockJwtService.Object);
            
            var loginDto = new LoginDto
            {
                Username = "nonexistent",
                Password = "password123"
            };

            // Act
            var result = await authService.LoginAsync(loginDto);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ShouldReturnNull()
        {
            // Arrange
            using var context = await TestDbHelper.GetSeededDbContextAsync();
            var authService = new AuthService(context, _mockJwtService.Object);
            
            var loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "wrongpassword"
            };

            // Act
            var result = await authService.LoginAsync(loginDto);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task RegisterAsync_WithNewUser_ShouldCreateUserAndReturnAuthResponse()
        {
            // Arrange
            using var context = TestDbHelper.GetInMemoryDbContext();
            var authService = new AuthService(context, _mockJwtService.Object);
            
            var registerDto = new RegisterDto
            {
                Username = "newuser",
                Email = "newuser@example.com",
                Password = "newpassword123"
            };

            // Act
            var result = await authService.RegisterAsync(registerDto);

            // Assert
            result.Should().NotBeNull();
            result!.Token.Should().Be("test-jwt-token");
            result.Username.Should().Be("newuser");
            result.Email.Should().Be("newuser@example.com");
            result.Role.Should().Be("User");

            // Verify user was created in database
            var user = context.Users.FirstOrDefault(u => u.Username == "newuser");
            user.Should().NotBeNull();
            user!.Email.Should().Be("newuser@example.com");
            BCrypt.Net.BCrypt.Verify("newpassword123", user.PasswordHash).Should().BeTrue();
        }

        [Fact]
        public async Task RegisterAsync_WithExistingUsername_ShouldReturnNull()
        {
            // Arrange
            using var context = await TestDbHelper.GetSeededDbContextAsync();
            var authService = new AuthService(context, _mockJwtService.Object);
            
            var registerDto = new RegisterDto
            {
                Username = "testuser", // This username already exists
                Email = "different@example.com",
                Password = "password123"
            };

            // Act
            var result = await authService.RegisterAsync(registerDto);

            // Assert
            result.Should().BeNull();
        }
    }
}