using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Common.models;

/// <summary>
/// The base for all sales orders
/// </summary>
[MongoCollection("salesOrders")]

[BsonDiscriminator(Required = true, RootClass = true)]
[BsonKnownTypes(
    typeof(Sagas.PrintOrder)
)]
[JsonConverter(typeof(PolymorphicBaseJsonConverter))]
public class BaseSaleOrder : PolymorphicBase<BaseSaleOrder>
{
    /// <summary>
    /// the order ID
    /// </summary>
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [Required]
    public Guid id { get; set; } = Guid.NewGuid();

    public DateTime created { get; set; } = DateTime.Now;

    public BasePaymentDetails paymentDetails { get; set; } = new BasePaymentDetails();

    public BaseChatMessage[] updates { get; set; } = new BaseChatMessage[] { };

    public SalesOrderStatus orderStatus { get; set; } = SalesOrderStatus.created;


    [MongoIndex]
    public static void CreateIndexes(IMongoCollection<BaseSaleOrder> collection)
    {
        collection.Indexes.CreateOne(
            new CreateIndexModel<BaseSaleOrder>(
            new IndexKeysDefinitionBuilder<BaseSaleOrder>()
                .Ascending(f => f.paymentDetails.paymentId), new CreateIndexOptions
                {
                    Unique = true,
                }
            ));
    }

}

[JsonConverter(typeof(StringEnumConverter))]
public enum SalesOrderStatus { created, waitingForPayment, paymentReceived}

/// <summary>
/// This is used to send out simple pieces of information
/// </summary>
[BsonDiscriminator(Required = true, RootClass = true)]
/*[BsonKnownTypes(
    typeof(Services.StripePaymentDetails)
)]*/
[JsonConverter(typeof(PolymorphicBaseJsonConverter))]
public class BaseChatMessage : PolymorphicBase<BaseChatMessage>
{
    [Required]
    public string id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public DateTime created { get; set; } = DateTime.Now;

    /// <summary>
    /// This can contain markdown
    /// </summary>
    [Required]
    public string message { get; set; } = string.Empty;
}

/// <summary>
/// contains all payment details including backend ONLY props
/// </summary>
[BsonDiscriminator(Required = true, RootClass = true)]
[BsonKnownTypes(
    typeof(Services.StripePaymentDetails)
)]
[JsonConverter(typeof(PolymorphicBaseJsonConverter))]
public class BasePaymentDetails : PolymorphicBase<BasePaymentDetails>
{
    public string paymentId { get; set; } = "";
    public BasePaymentUIDetails? baseUiDetails { get; protected set; } = new BasePaymentUIDetails();
}

public class BasePaymentDetails<T> : BasePaymentDetails where T : BasePaymentUIDetails, new()
{
    public T? uiDetails
    {
        get { return baseUiDetails as T; }
        set { baseUiDetails = value; }
    }
}


/// <summary>
/// Passed om to the front end for display
/// </summary>
[BsonDiscriminator(Required = true, RootClass = true)]
[BsonKnownTypes(
    typeof(Services.StripePaymentIntent)
)]
[JsonConverter(typeof(PolymorphicBaseJsonConverter))]
public class BasePaymentUIDetails : PolymorphicBase<BasePaymentUIDetails>
{
    [Required]
    public decimal amount { get; set; }

}


[BsonDiscriminator(Required = true, RootClass = true)]
[BsonKnownTypes(
 
)]
[JsonConverter(typeof(PolymorphicBaseJsonConverter))]
public class BasePaymentReceivedDetails : PolymorphicBase<BasePaymentReceivedDetails>
{
    public string paymentId { get; set; } = "";
    public decimal amount { get; set; }
}

