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
    [BsonIgnoreExtraElements]
    [MongoCollection("creatorProfiles")]
    public class CreatorProfile
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; } = "";
        public string imageURL { get; set; } = "";
        public string name { get; set; } = "";
        public string description { get; set; } = "";
    }
}
