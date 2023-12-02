using System.ComponentModel.DataAnnotations;
using Common;
using Common.models;

using Common.Services;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace ac_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrderPrintController : ControllerBase
{
    readonly IDbService _db;
    readonly ILogger _logger;
    readonly IStripePayments _stripe;
    readonly IPublishEndpoint _publishEp;


    public OrderPrintController(IDbService db,
        IStripePayments stripe,
        IPublishEndpoint publishEp,
        ILogger<OrderPrintController> logger)
    {
        _db = db;
        _logger = logger;
        _stripe = stripe;
        _publishEp = publishEp;
    }


    [HttpPost("newOrder/{artworkId}")]
    public async Task<BasePaymentUIDetails> CreateNewOrder(string artworkId, [FromBody] ArtWorkSaleSize size)
    {
        var artWorkCollection = _db.getCollection<Artwork>();
        var artWork = await artWorkCollection.Find(x => x.id == artworkId).FirstAsync();

        var saleDetail = artWork.saleDetails.Where(s => s.size.height == size.height && s.size.width == size.width).Single();


        var printOrder = new Common.Sagas.PrintOrder
        {
            orderDetails = new Common.Sagas.PrintSaleOrderDetails
            {
                artworkId = artworkId,
                selectedSize = saleDetail
            },
            paymentDetails = await _stripe.CreatePaymentDetails(saleDetail.price)

        };

        await _db.getCollection<Common.Sagas.PrintOrder>().InsertOneAsync(printOrder);

        await _publishEp.Publish(new Common.Sagas.PrintOrderMessage
        {
            details = printOrder
        });

        if(null == printOrder.paymentDetails.baseUiDetails)
        {
            throw new InvalidOperationException("The payment service returned null UI Details");
        }

        return printOrder.paymentDetails.baseUiDetails;

    }


}

