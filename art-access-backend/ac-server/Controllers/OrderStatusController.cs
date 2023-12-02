using System.ComponentModel.DataAnnotations;
using Common;
using Common.models;
using Common.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;
namespace ac_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrderStatusController : ControllerBase
{
    readonly IDbService _db;
    readonly IStripePayments _stripe;
    readonly ILogger _logger;
    public OrderStatusController(IDbService db,
        IStripePayments stripe,
        ILogger<OrderStatusController> logger
        )
    {
        _logger = logger;
        _db = db;
        _stripe = stripe;
    }

    [HttpGet("byPaymentId/{paymentId}")]
    public async Task<OrderStatusResponse> GetSalesOrderbyPaymentId(string paymentId)
    {
        var order = await _db.getCollection<BaseSaleOrder>()
            .Find(o => o.paymentDetails.paymentId == paymentId)
            .SingleAsync();

        if (order.paymentDetails.GetType() != typeof(StripePaymentDetails))
        {
            throw new NotImplementedException("only stripe payments for now");
        }

        if(SalesOrderStatus.waitingForPayment  == order.orderStatus)
        {
            await _stripe.CheckPaymentStatus(order.id, order.paymentDetails.paymentId);

            //give it a sec to run
            await Task.Delay(TimeSpan.FromSeconds(2));

        }
        else
        {
            _logger.LogInformation($"order {order.id} is not waiting for payment");
        }


        return await GetSalesOrderbyPaymentId(order.id);
    }

    [HttpGet("byId/{orderId}")]
    public async Task<OrderStatusResponse> GetSalesOrderbyPaymentId(Guid orderId)
    {
        var order = await _db.getCollection<BaseSaleOrder>()
            .Find(o => o.id == orderId)
            .SingleAsync();

        return new OrderStatusResponse
        {
            orderId = orderId,
            updates = order.updates
        };
    }
}

public class OrderStatusResponse
{
    [Required]
    public Guid orderId { get; set; }

    [Required]
    public BaseChatMessage[] updates { get; set; } = new BaseChatMessage[] { };
}

