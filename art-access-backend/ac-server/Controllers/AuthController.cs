using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;

[Route("api/[controller]")]
[ApiController]

public class AuthController : ControllerBase
{
    readonly IDbService _db;
    readonly ILogger _logger;
    readonly AuthConfig _myConfig;

    public AuthController(IDbService db,
        IConfiguration config,
        ILogger<AuthController> logger
        )
    {
        _logger = logger;
        _db = db;
        _myConfig = AuthConfig.CreateFromConfig(config);
    }

    [HttpGet("sessionToken")]
    public AuthenticatedUserInUi GenerateSessionToken()
    {
        if (! (this.HttpContext.User?.Identity?.IsAuthenticated??false))
        {
            throw new Exception("There is already an Authenticated JWT");
        }

        return new AuthenticatedUserInUi
        {
            jwt = GenerateJWTToken(_myConfig, new AuthIdentity[]
            {
                new SessionIdentity()
            })
        };
    }


    public static string GenerateJWTToken(AuthConfig _myConfig, AuthIdentity[] idenitities, string? userId = null)
    {

        if (string.IsNullOrWhiteSpace(userId))
        {
            userId = "sessionId_" + Guid.NewGuid().ToString();
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_myConfig.PrivateKey));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = idenitities.Select(i=>

            new Claim(i.GetType().Name,i.id))

            .Concat(new[]
            {
                    new Claim(JwtRegisteredClaimNames.Sub, userId),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    //new Claim(JwtRegisteredClaimNames.UniqueName, user.details?.primaryEmail??user.details?.phoneNumber),
                }
            )
            .ToArray();

        var token = new JwtSecurityToken(
        issuer: _myConfig.JwtIssuer,
        audience: _myConfig.JwtIssuer,
        claims: claims,
        expires: DateTime.Now.AddMinutes(_myConfig.JwtExpiryMin),
        signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}

/// <summary>
/// How we store the user in Database
/// </summary>
[MongoCollection("users")]
public class UserInDb
{
    [BsonId]
    public string userId { get; set; } = Guid.NewGuid().ToString();

}

/// <summary>
/// The user info sent over to the frontend
/// </summary>
public class AuthenticatedUserInUi
{
    [Required]
    public string jwt { get; set; } = "";

    [Required]
    public UserDisplayDetails details { get; set; } = new UserDisplayDetails();
}

/// <summary>
/// used by front end to display user in various places
/// </summary>
public class UserDisplayDetails
{

}

/// <summary>
/// An Idenity that can be used to Identify a user
/// These can move around between users,
/// We want these identities to be unique so they go in their own table
/// that means Identities may or may not have a user associated with them
/// </summary>
[MongoCollection("authIdentities")]
[BsonDiscriminator(Required = true, RootClass = true)]
[BsonKnownTypes(
    typeof(PhoneNumberIdenitity), typeof(EmailIdenitity)
)]
public class AuthIdentity
{
    [BsonId]
    public string id { get; set; } = string.Empty;

    public DateTime created { get; set; } = DateTime.Now;

    /// <summary>
    /// what user this identity belongs to
    /// </summary>
    public string? userId { get; set; }

}

public class PhoneNumberIdenitity: AuthIdentity
{
    [BsonIgnore]
    public string phoneNumber {
        get { return id; }

        //todo: use regex to strip anything that is NOT + or numeric
        set { id = value; }
    }
}

public class EmailIdenitity : AuthIdentity
{
    [BsonIgnore]
    public string email
    {
        get { return id; }
        set { id = (value??"").ToLower(); }
    }
}

/// <summary>
/// Not a real Idenitity, just use to authenticate browser sessions
/// that have not yet authentictaed with any other identity
/// </summary>
public class SessionIdentity : AuthIdentity
{
    [BsonIgnore]
    public string sessionId
    {
        get { return id; }
        set { id = value; }
    }

    public SessionIdentity()
    {
        sessionId = Guid.NewGuid().ToString();
    }
}


public class AuthConfig
{
    public string PrivateKey { get; set; } = "";
    public string JwtIssuer { get; set; } = @"colourbox";

    public int JwtExpiryMin { get; set; } = 60 * 24 * 7; //7 days

    /// <summary>
    /// When does the OTP Timesout in seconds
    /// </summary>
    public int OtpTimeout { get; set; } = 60 * 5;

    /// <summary>
    /// can resend OTP after how many seconds
    /// </summary>
    public int OtpResendTimeout { get; set; } = 15;

    static string _generatedPrivateKey = string.Empty;

    public static AuthConfig CreateFromConfig(IConfiguration Configuration)
    {
        var config = Configuration.GetSection("login").Get<AuthConfig>();
        if (null == config)
            config = new AuthConfig();

        if (string.IsNullOrEmpty(config.PrivateKey))
        {
            if (string.IsNullOrWhiteSpace(_generatedPrivateKey))
            {
                var rnd = new Random();
                _generatedPrivateKey = new string( Enumerable.Range(0, 64).Select(i => (char)rnd.Next('a', 'z')).ToArray());
            }

            config.PrivateKey = _generatedPrivateKey;
        }

        return config;

    }

}


