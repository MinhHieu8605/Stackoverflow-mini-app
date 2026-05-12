using Demo.Features.Auth.Services;
using Demo.Features.Posts.Services;
using Demo.Features.Tags.Services;
using Demo.Features.Uploads.Services;
using Demo.Features.Users.Repositories;
using Demo.Features.Users.Services;
using Demo.Shared.Data;
using Demo.Shared.Exceptions;
using Demo.Shared.Utils;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ======================
// 1. BASIC SERVICES
// ======================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// ======================
// 2. DATABASE
// ======================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           .UseSnakeCaseNamingConvention());

// ======================
// 3. DEPENDENCY INJECTION (SCAN)
// ======================
builder.Services.Scan(scan => scan
    .FromAssemblies(
        typeof(IUserService).Assembly,
        typeof(IPostService).Assembly,
        typeof(IAuthService).Assembly,
        typeof(ITagService).Assembly,
        typeof(IUploadService).Assembly
    )

    // Services
    .AddClasses(c => c.Where(t => t.Name.EndsWith("Service")))
        .AsImplementedInterfaces()
        .WithScopedLifetime()

    // Repositories
    .AddClasses(c => c.Where(t => t.Name.EndsWith("Repository")))
        .AsImplementedInterfaces()
        .WithScopedLifetime()

    // Converter
    .AddClasses(c => c.Where(t => t.Name.EndsWith("Converter")))
        .AsSelf()
        .WithScopedLifetime()
);

// ======================
// 4. JWT + AUTH
// ======================
builder.Services.AddScoped<IJwtHelper, JwtHelper>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSection["SecretKey"]
    ?? throw new InvalidOperationException("Jwt:SecretKey is missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)
            ),

            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],

            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,

            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

// ======================
// 5. CORS
// ======================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ======================
// BUILD APP
// ======================
var app = builder.Build();

// ======================
// 6. MIDDLEWARE
// ======================

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Auto migrate DB
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Error handling
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseMiddleware<GlobalExceptionHandler>();

// Core pipeline
app.UseRouting();

app.UseCors("AllowAll");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// ======================
// 7. ENDPOINTS
// ======================
app.MapControllers();

app.Run();