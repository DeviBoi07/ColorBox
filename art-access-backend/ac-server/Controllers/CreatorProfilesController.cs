using Common;
using Common.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ac_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreatorProfilesController : ControllerBase
    {
        readonly IDbService _db;
        readonly IConfiguration _config;

        public CreatorProfilesController(IDbService db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpGet("{creatorprofileid}")]
        public async Task<CreatorProfile> GetCreatorProfile(string creatorprofileid)
        {
            var creatorProfileCollection = _db.getCollection<CreatorProfile>();
            var creatorProfile = await creatorProfileCollection.Find(x => x.id == creatorprofileid).FirstAsync();
            return creatorProfile;
        }

        [HttpGet("totalcount")]
        public async Task<IActionResult> GetTotalCount()
        {
            var creatorProfileCollection = _db.getCollection<CreatorProfile>();
            var count = await creatorProfileCollection.EstimatedDocumentCountAsync();
            return Ok(count);
        }

        [HttpGet("{pagenumber}/{contentnumber}")]
        public async Task<CreatorProfile[]> GetAllCreatorsByPageNumberAndContentNumber(int pagenumber, int contentnumber)
        {
            var creatorProfileCollection = _db.getCollection<CreatorProfile>();
            var contentToSkip = (pagenumber - 1) * contentnumber;
            var creatorProfiles = await creatorProfileCollection.Find(Builders<CreatorProfile>.Filter.Empty).Skip(contentToSkip).Limit(contentnumber).ToListAsync();
            return creatorProfiles.ToArray();
        }

        [HttpPost]
        [Authorize]
        public async Task<CreatorProfile> PostCreatorProfile([FromBody] CreatorProfile creatorprofile)
        {
            var creatorProfileCollection = _db.getCollection<CreatorProfile>();
            if(!String.IsNullOrWhiteSpace(creatorprofile.id))
            {
                var existingCreator = await creatorProfileCollection.Find(x => x.id == creatorprofile.id).FirstOrDefaultAsync();
                if(existingCreator != null)
                {
                    await creatorProfileCollection.ReplaceOneAsync(x => x.id == existingCreator.id, creatorprofile);
                    return await GetCreatorProfile(creatorprofile.id);
                }
            }

            await creatorProfileCollection.InsertOneAsync(creatorprofile);
            return await GetCreatorProfile(creatorprofile.id);
        }

    }
}
