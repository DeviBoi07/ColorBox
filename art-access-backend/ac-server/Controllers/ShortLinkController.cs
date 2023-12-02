using System.ComponentModel.DataAnnotations;
using Common;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;

[Route("api/[controller]")]
[ApiController]

public class ShortLinkController : ControllerBase
{
    readonly IDbService _db;

    public ShortLinkController(IDbService db)
    {
        _db = db;
    }

    [HttpGet("linkId")]
    public async Task<ShortLink> GetShortLink(string linkId)
    {
        var link = await _db.getCollection<ShortLink>()
            .Find(s => s.id == linkId)
            .SingleOrDefaultAsync();

        if (null != link)
            return link;
        else
            return new ShortLink();
    }
}

[MongoCollection("shortLinks")]
public class ShortLink
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string forwardUrl { get; set; } = String.Empty;

}

