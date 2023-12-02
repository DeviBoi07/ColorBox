using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.models
{
    public class ArtWorkSaleSize
    {
        public decimal height { get; set; }
        public decimal width { get; set; }
    }
    public class PrintSaleDetail
    {
        /// <summary>
        /// print size in inches
        /// </summary>
        public ArtWorkSaleSize size { get; set; } = new ArtWorkSaleSize();

        /// <summary>
        /// What price in USD we are selling these at 
        /// </summary>
        public decimal price { get; set; }

        public override string ToString()
        {
            return $"Archival print {size.width} X {size.height}";
        }
    }

    [BsonIgnoreExtraElements]
    [MongoCollection("artworks")]
    public class Artwork
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// The id of the artwork speific to the artist
        /// </summary>
        public string artistSpecificId { get; set; } = "";

        public string imageURL { get; set; } = "";
        public string label { get; set; } = "";
        public string description { get; set; } = "";

        /// <summary>
        /// What the original work is made of
        /// </summary>
        public string material { get; set; } = "";

        /// <summary>
        /// The size of the original work
        /// </summary>
        public ArtWorkSaleSize originalSize { get; set; } = new ArtWorkSaleSize();

        public PrintSaleDetail[] saleDetails { get; set; } = new PrintSaleDetail[] { };

        /// <summary>
        /// This is actually the artist Id
        /// </summary>
        public string? creatorProfileId { get; set; } = "";
    }
}
