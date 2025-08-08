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

// Add CORS policy for production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        policy => policy.WithOrigins(
            "http://localhost:4200",
            "https://localhost:4200",
            "https://*.amplifyapp.com",
            "https://*.awsapprunner.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
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
builder.Services.AddSignalR();

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

// CORS
app.UseCors("AllowAngularDev");

// Swagger available for demo
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Insurance Portal API v1");
    c.RoutePrefix = "swagger";
});

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    await next();
});

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { 
    Status = "Healthy", 
    Time = DateTime.UtcNow,
    Environment = app.Environment.EnvironmentName 
}));

// SignalR Hub
app.MapHub<ClaimHub>("/claimHub");

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
