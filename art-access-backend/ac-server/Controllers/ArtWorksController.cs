using System.Reflection;
using System.Text.RegularExpressions;
using Common;
using Common.models;
using CSVFile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace ac_server.Controllers
{
    public class MyArtWorks
    {
        public CreatorProfile CreatorProfile { get; set; } = new CreatorProfile();
        public List<Artwork> Artworks { get; set; } = new List<Artwork>();
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ArtWorksController : ControllerBase
    {
        readonly IDbService _db;
        readonly IConfiguration _config;

        public ArtWorksController(IDbService db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpGet("{artworkid}")]
        public async Task<Artwork> GetArtwork(string artworkid)
        {
            var artWorkCollection = _db.getCollection<Artwork>();
            var artWork = await artWorkCollection.Find(x => x.id == artworkid).SingleAsync();
            return artWork;
        }

        [HttpGet("myartworks/{creatorprofileid}")]
        public async Task<MyArtWorks> GetMyArtWorks(string creatorprofileid)
        {
            var creatorProfileCollection = _db.getCollection<CreatorProfile>();
            var artWorkCollection = _db.getCollection<Artwork>();
            var myArtWorks = new MyArtWorks();

            var creatorProfile = await creatorProfileCollection.Find(x => x.id == creatorprofileid).FirstOrDefaultAsync();
            if (creatorProfile == null)
            {
                throw new ExceptionWithCode("Creator Profile not found");
            }

            var artWorks = await artWorkCollection.Find(x => x.creatorProfileId == creatorProfile.id).ToListAsync();
            myArtWorks.CreatorProfile = creatorProfile;
            myArtWorks.Artworks = artWorks;

            return myArtWorks;
        }

        [HttpGet("totalcount")]
        public async Task<IActionResult> GetTotalCount()
        {
            var artworksCollection = _db.getCollection<Artwork>();
            var count = await artworksCollection.EstimatedDocumentCountAsync();
            return Ok(count);
        }

        [HttpGet("{pagenumber}/{contentnumber}")]
        public async Task<Artwork[]> GetAllArtWorksByPageNumberAndContentNumber(int pagenumber, int contentnumber)
        {
            var artWorkCollection = _db.getCollection<Artwork>();
            var contentToSkip = (pagenumber - 1) * contentnumber;
            var artWorks = await artWorkCollection.Find(Builders<Artwork>.Filter.Empty).Skip(contentToSkip).Limit(contentnumber).ToListAsync();
            return artWorks.ToArray();
        }

        [HttpPost]
        [Authorize]
        public async Task<Artwork> CreateArtWork([FromBody] Artwork artwork)
        {
            var artWorkCollection = _db.getCollection<Artwork>();
            if (!String.IsNullOrWhiteSpace(artwork.id))
            {
                var existingArtWork = await artWorkCollection.Find(x => x.id == artwork.id).FirstOrDefaultAsync();
                if (existingArtWork != null)
                {
                    await artWorkCollection.ReplaceOneAsync(x => x.id == existingArtWork.id, artwork);
                    return await GetArtwork(artwork.id);
                }
            }

            await artWorkCollection.InsertOneAsync(artwork);
            return await GetArtwork(artwork.id);
        }


        #region load data
        public static async Task ImportArtWork(IDbService _db, string fileName)
        {
            var harcodedArtistName = "Gillian Dates";

            var artist = await _db.getCollection<CreatorProfile>().Find(a => a.name == harcodedArtistName).FirstOrDefaultAsync();
            if(null == artist)
            {
                artist = new CreatorProfile
                {
                    name = harcodedArtistName
                };

                await _db.getCollection<CreatorProfile>().InsertOneAsync(artist);
            }

            var artWorkRows = ReadTemplateFile(fileName).Select(artwork =>
            {
                artwork.creatorProfileId = artist.id;

                return new ReplaceOneModel<Artwork>(
                Builders<Artwork>.Filter.Where(o =>
                                o.artistSpecificId == artwork.artistSpecificId && artwork.creatorProfileId == artist.id),
                artwork)
                {
                    IsUpsert = true
                };
            }).ToArray();

            var done = await _db.getCollection<Artwork>().BulkWriteAsync(artWorkRows);

            Console.WriteLine($"updated {done.InsertedCount}, {done.Upserts.Count()}");
        }


        static IEnumerable<Artwork> ReadTemplateFile(string templateFile)
        {
            using (var reader = new StreamReader(templateFile))
            using (CSVReader cr = new CSVReader(reader, new CSVSettings
            {

            }))
            {

                var templateProps = typeof(Artwork).GetProperties(BindingFlags.Public | BindingFlags.Instance);

                var lineNo = 0;
                foreach (string[] line in cr)
                {
                    lineNo++;
                    var myObj = cr.Headers.Select((h, i) =>
                        new
                        {
                            key = h,
                            value = line[i]
                        }).ToDictionary(k => k.key, v => v.value);


                    var ret = new Artwork();

                    if (myObj.TryGetValue(nameof(Artwork.id), out var value))
                    {
                        ret.artistSpecificId = value;
                    }
                    else
                    {
                        throw new Exception($"line {lineNo} is missing Id");
                    }

                    if (myObj.TryGetValue(nameof(Artwork.imageURL), out var imageURL))
                    {
                        ret.imageURL = imageURL;
                    }

                    if (myObj.TryGetValue(nameof(Artwork.label), out var label))
                    {
                        ret.label = label;
                    }

                    if (myObj.TryGetValue(nameof(Artwork.material), out var material))
                    {
                        ret.material = material;
                    }

                    if (myObj.TryGetValue(nameof(Artwork.description), out var description))
                    {
                        ret.description = description;
                    }

                    if (myObj.TryGetValue(nameof(Artwork.originalSize), out var originalSize))
                    {
                        ret.originalSize = parseSize(originalSize);
                    }

                    var sizeList = new List<PrintSaleDetail>();

                    for (var i = 0; i < 10; i++)
                    {
                        var fieldName = $"saleDetails_{i}.price";

                        if (!myObj.TryGetValue(fieldName, out var fieldNameValue))
                        {
                            continue;
                        }

                        fieldName = $"saleDetails_{i}.size";

                        if (!myObj.TryGetValue(fieldName, out var sizeValue))
                        {
                            continue;
                        }

                        var newSize = new PrintSaleDetail
                        {
                            price = decimal.Parse(fieldNameValue),
                            size = parseSize(sizeValue)
                        };


                        sizeList.Add(newSize);
                    }

                    ret.saleDetails = sizeList.ToArray();


                    yield return ret;

                }

            }
        }


        static ArtWorkSaleSize parseSize(string sizeValue)
        {
            var pattern = new Regex(@"(?<lower>[\.\d]+)\s*X\s*(?<upper>[\.\d]+)");
            var match = pattern.Match(sizeValue);

            if (!match.Success)
                throw new Exception($"{sizeValue} does not match range");

            var lower = match.Groups["lower"].ToString();
            var upper = match.Groups["upper"].ToString();

            return new ArtWorkSaleSize
            {
                width = decimal.Parse(lower),
                height = decimal.Parse(upper)

            };
        }
        #endregion

    }
}