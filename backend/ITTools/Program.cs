using System.Text;
using ITTools.API.Middlewares;
using ITTools.Application.Services;
using ITTools.Domain.Enums;
using ITTools.Domain.Interfaces;
using ITTools.Infrastructure.DataAccess;
using ITTools.Infrastructure.Plugins;
using ITTools.Infrastructure.Watchers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Access IConfiguration via builder.Configuration
var configuration = builder.Configuration;
builder.Services.AddSingleton<IConfiguration>(configuration);

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        // Tùy chọn cấu hình Newtonsoft nếu cần
        // Ví dụ: giữ nguyên kiểu xử lý vòng lặp tham chiếu mặc định
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        // options.SerializerSettings.ContractResolver = new DefaultContractResolver(); // Thêm các cấu hình khác nếu bạn cần
    });



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


builder.Services.AddScoped<IPluginLoader, PluginLoader>();
builder.Services.AddScoped<IPluginChangeHandler, ToolRegistrationService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ToolService>();
builder.Services.AddScoped<ToolGroupService>();
builder.Services.AddScoped<FavoriteService>();
builder.Services.AddScoped<ToolExecutionService>();

builder.Services.AddHostedService<PluginWatcherService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost5173", policy =>
    {
        policy.WithOrigins("https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Áp dụng CORS
app.UseCors("AllowLocalhost5173");


app.UseMiddleware<GlobalRoutePrefixMiddleware>("/api/v1");
app.UsePathBase(new PathString("/api/v1"));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseCors("AllowLocalhost5173");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();