using System.ComponentModel.DataAnnotations;
using Common;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

[Route("api/[controller]")]
[ApiController]
public class CrmController : ControllerBase
{
    readonly IDbService _db;

    public CrmController(IDbService db)
    {
        _db = db;
    }

    [HttpPost("updateDetails")]
    public async Task UpdateDetails([FromBody] ContactDetails details)
    {
        if(
            string.IsNullOrWhiteSpace(details.email) &&
            string.IsNullOrWhiteSpace(details.phoneNumber))
        {
            throw new ExceptionWithCode("At least one of Phone number OR email is required");
        }

        await _db.getCollection<AContact>().InsertOneAsync(new AContact
        {
            details = details
        });
        
    }


}

/// <summary>
/// used to keep details about a person interested in services
/// </summary>
[BsonIgnoreExtraElements]
[MongoCollection("contacts")]
public class AContact
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string id { get; set; } = Guid.NewGuid().ToString();

    public ContactDetails details { get; set; } = new ContactDetails();

}

public class ContactDetails
{
    [BsonIgnoreIfDefault]
    public string? email { get; set; }

    [BsonIgnoreIfDefault]
    public string? phoneNumber { get; set; }

    /// <summary>
    /// Why we are trying to contact
    /// </summary>
    [Required]
    public string reason { get; set; } = string.Empty;
}

