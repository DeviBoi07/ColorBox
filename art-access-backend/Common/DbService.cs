using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reflection;

namespace Common
{
    public interface IDbService
    {
        IMongoDatabase db { get; }
        IMongoCollection<T> getCollection<T>();
    }

    public class MongoConfig
    {
        public string connectionString { get; set; } = "mongodb://localhost?connect=direct";
        public string dbName { get; set; } = "colourbox_artdb";
    }

    public class DbService : IDbService
    {
        readonly MongoClient _client;
        readonly IMongoDatabase _db;
        readonly ILogger _logger;

        public DbService(IConfiguration configuration, ILogger<DbService> logger)
        {
            _logger = logger;
            var config = configuration.GetSection("mongo").Get<MongoConfig>() ?? new MongoConfig();

            _client = new MongoClient(config.connectionString);
            
            _db = _client.GetDatabase(config.dbName);
        }

        static DbService()
        {
            var pack = new ConventionPack();
            pack.Add(new IgnoreExtraElementsConvention(true));
            pack.Add(new IgnoreIfDefaultConvention(true));
            
            ConventionRegistry.Register("Custom Conventions", pack, t => true);

#pragma warning disable CS0618
            BsonDefaults.GuidRepresentation = GuidRepresentation.Standard;
            BsonDefaults.GuidRepresentationMode = GuidRepresentationMode.V3;
#pragma warning restore CS0618

            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

        }

        public IMongoDatabase db => _db;

        public IMongoCollection<T> getCollection<T>()
        {
            var attribute = typeof(T).GetCustomAttributes<MongoCollectionAttribute>(true).FirstOrDefault();

            if (string.IsNullOrWhiteSpace(attribute?.collectionName))
            {
                Debug.Assert(false);
                throw new Exception("MongoCollection not defined");
            }

            var collection = db.GetCollection<T>(attribute.collectionName);

            CreateIndexes<T>(collection);

            return collection;
        }

        /// <summary>
        /// Used to create the Index the first time we create the db
        /// </summary>
        static ConcurrentDictionary<Type, bool> _indexesCreated = new ConcurrentDictionary<Type, bool>();

        void CreateIndexes<T>(IMongoCollection<T> collection)
        {
            var theType = typeof(T);

            if (_indexesCreated.ContainsKey(theType))
                return;

            var allStatics = theType.GetMethods(BindingFlags.Static | BindingFlags.Public);

            var allDone = allStatics
                .Where(m => m.GetCustomAttributes<MongoIndexAttribute>(false).Count() > 0)
                .Select(m =>
                {
                    m.Invoke(null, new[] { collection });
                    return true;
                })
                .ToArray();
            ;

            /*
            chatItems.ChatMessageModel.CreateIndexes(_db);
            login.UserModel.CreateIndexes(_db);
            */

            _indexesCreated[theType] = true;
        }
    }

    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class MongoCollectionAttribute : Attribute
    {
        public string collectionName { get; private set; }
        public MongoCollectionAttribute(string collectionName)
        {
            this.collectionName = collectionName;
        }
    }

    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class MongoIndexAttribute : Attribute { }
}
