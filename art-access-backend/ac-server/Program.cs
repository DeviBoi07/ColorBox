using ac_server;
using Common;
using Common.Sagas;
using Common.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var appConfig = builder.Configuration.GetSection("app").Get<AppConfig>() ?? new AppConfig();

// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.DocumentFilter<CustomDocFilter>();
    c.SwaggerDoc("v2", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Version = "v2",
        Title = "ac-server",
    });
});


builder.Services.AddTransient<IDbService, DbService>();
builder.Services.AddTransient<IStripePayments, StripePayments>();

builder.Services.ConfigureACSagas(builder.Configuration);


builder.Services.AddCors();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    var loginConfig = AuthConfig.CreateFromConfig(builder.Configuration);

    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = loginConfig.JwtIssuer,
        ValidAudience = loginConfig.JwtIssuer,
        ClockSkew = TimeSpan.FromSeconds(5),


        //https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(loginConfig.PrivateKey)),

    };

    //presence.NameUserIdProvider.ParseJWTinQueryString(options, "/messaging");
});

builder.Services.AddAuthorization(options =>
{
    //options.AddPolicy("HeroSelected", policy => policy.RequireClaim(AuthController.ClaimSelectedHeroId));
    //options.AddPolicy("SeasonJoined", policy => policy.RequireClaim(AuthController.ClaimSelectedSeasonId));
});

var app = builder.Build();

app.UseCors(c =>
{
    c.AllowAnyOrigin()
    .AllowAnyHeader().AllowAnyMethod();
});

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v2/swagger.json", "ac-server v3");
});


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

#region AppCommands

if (!string.IsNullOrWhiteSpace(appConfig?.Command))
{
    switch (appConfig.Command.ToLower())
    {
        case "importartwork":
#pragma warning disable ASP0000 // Do not call 'IServiceCollection.BuildServiceProvider' in 'ConfigureServices'
            var dbService = builder.Services.BuildServiceProvider().GetService<IDbService>();
#pragma warning restore ASP0000 // Do not call 'IServiceCollection.BuildServiceProvider' in 'ConfigureServices'

            if (string.IsNullOrWhiteSpace(appConfig.file))
            {
                throw new Exception("appConfig.file is empty");
            }

            ac_server.Controllers.ArtWorksController.ImportArtWork(dbService!, appConfig.file).Wait();


            Console.WriteLine("import completed");


            break;
    }

}
else
{
    app.Run();
}

public class AppConfig
{
    public string? allowCorsOrigin { get; set; }

    public string? Command { get; set; }

    /// <summary>
    /// Some commands need text file
    /// </summary>
    public string? file { get; set; }

}

#endregion