using InsurancePortal.API.Services;
using InsurancePortal.API.Repositories;
using InsurancePortal.API.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using InsurancePortal.API.Models;
using Amazon.S3;
using Amazon.SQS;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS configuration with environment-based origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = new List<string>
        {
            "http://localhost:4200",  // Angular dev server
            "https://localhost:4200", // Angular dev server HTTPS
            "https://localhost:7018", // Your API (for testing)
        };

        // Add production frontend URL from environment variable
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            allowedOrigins.Add(frontendUrl);
            // Also add HTTPS version if HTTP is provided
            if (frontendUrl.StartsWith("http://"))
            {
                allowedOrigins.Add(frontendUrl.Replace("http://", "https://"));
            }
        }

        // Allow S3 website pattern for production
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            
            // Allow localhost for development
            if (origin.Contains("localhost")) return true;
            
            // Allow your S3 website pattern
            if (origin.Contains("insurance-portal-ui") && origin.Contains("s3-website")) return true;
            
            // Check against explicitly allowed origins
            return allowedOrigins.Contains(origin);
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
        };
        
        // Configure JWT for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/claimHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Database Configuration - Always use InMemory for simplicity in demo
builder.Services.AddDbContext<InsuranceDbContext>(options =>
    options.UseInMemoryDatabase("InsurancePortalDb"));

// Redis Cache - Only add if connection string exists
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    try
    {
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
        });
    }
    catch (Exception ex)
    {
        // Log but don't fail - Redis is optional for demo
        Console.WriteLine($"Redis connection failed: {ex.Message}");
    }
}

// MediatR for CQRS
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

// Repository Pattern
builder.Services.AddScoped<IClaimRepository, ClaimRepository>();

// Application Services
builder.Services.AddScoped<ClaimService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IDocumentService, S3DocumentService>();

// AWS Services - Only if running in AWS environment
try
{
    builder.Services.AddAWSService<IAmazonS3>();
    builder.Services.AddAWSService<IAmazonSQS>();
}
catch (Exception ex)
{
    // Log but don't fail - AWS services optional for basic demo
    Console.WriteLine($"AWS service registration failed: {ex.Message}");
}

// Data Protection
builder.Services.AddDataProtection();

// SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
})
.AddJsonProtocol(); // Ensure JSON protocol is available for all transports

// API Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Insurance Portal API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// Enhanced Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS - This must be before UseAuthorization and MapControllers
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { 
    Status = "Healthy", 
    Time = DateTime.UtcNow,
    Environment = app.Environment.EnvironmentName 
}));

app.UseRouting();

// Configure SignalR hub with additional options
app.MapHub<ClaimHub>("/claimHub", options =>
{
    // Allow all transports for better compatibility
    options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.All;
});

// API Controllers
app.MapControllers();

// Startup logging
app.Lifetime.ApplicationStarted.Register(() =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("🚀 Insurance Portal API is running!");
    logger.LogInformation("📡 SignalR hub available at: /claimHub");
    logger.LogInformation("📚 Swagger UI available at: /swagger");
    logger.LogInformation("🌍 Environment: {Environment}", app.Environment.EnvironmentName);
});

app.Run();
// This is the entry point for the application
public partial class Program { }
