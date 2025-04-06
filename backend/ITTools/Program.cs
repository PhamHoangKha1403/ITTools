using System.Text;
using ITTools.API.Middlewares;
using ITTools.Application.Services;
using ITTools.Domain.Enums;
using ITTools.Domain.Interfaces;
using ITTools.Infrastructure.DataAccess;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Access IConfiguration via builder.Configuration
var configuration = builder.Configuration;
builder.Services.AddSingleton<IConfiguration>(configuration);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
 {
     options.TokenValidationParameters = new TokenValidationParameters
     {
         ValidateIssuer = true,
         ValidateAudience = true,
         ValidateLifetime = true,
         ValidateIssuerSigningKey = true,
         ValidIssuer = builder.Configuration["jwt:issuer"],
         ValidAudience = builder.Configuration["jwt:audience"],
         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["jwt:secret"]))
     };
     options.Events = new JwtBearerEvents
     {
         OnMessageReceived = context =>
         {
             // Extract token from cookie if present
             if (context.Request.Cookies.ContainsKey("jwt"))
             {
                 context.Token = context.Request.Cookies["jwt"];
             }
             return Task.CompletedTask;
         },

         OnChallenge = async context =>
         {
             // Skip the default logic
             context.HandleResponse();

             // Set the 401 status code
             context.Response.StatusCode = 401;

             // Write the custom error message
             context.Response.ContentType = "application/json";
             var result = System.Text.Json.JsonSerializer.Serialize(new { message = "Invalid or expired token. Please log in again." });
             await context.Response.WriteAsync(result);
         }
     };

 });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole(UserRole.Admin.ToString()));
    options.AddPolicy("PremiumOrAdmin", policy => policy.RequireRole(UserRole.Premium.ToString(), UserRole.Admin.ToString()));
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")).UseSnakeCaseNamingConvention());

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

app.UseMiddleware<GlobalRoutePrefixMiddleware>("/api/v1");
app.UsePathBase(new PathString("/api/v1"));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();