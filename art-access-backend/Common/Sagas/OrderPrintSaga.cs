using System;
using Common.models;
using Common.Services;
using MassTransit;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace Common.Sagas;

/// <summary>
/// we are shipping a print
/// </summary>
public class OrderPrintSaga : MassTransitStateMachine<OrderPrintSagaState>
{
    public State WaitingForPayment { get; private set; }

    public Event<PrintOrderMessage> OnOrdered { get; private set; }
    public Event<PaymentReceivedMessage> OnPaymentReceived { get; private set; }

    public OrderPrintSaga(
        IDbService _db,
        ILogger<OrderPrintSaga> _logger
        )
    {
        InstanceState(x => x.CurrentState);

        Initially(
            When(OnOrdered)
            .ThenAsync(async x =>
            {
                var artWork = await _db.getCollection<Artwork>()
                    .Find(o => o.id == x.Message.details.orderDetails.artworkId).SingleAsync();

                await _db.getCollection<BaseSaleOrder>()
                .UpdateOneAsync(o => o.id == x.Message.CorrelationId,
                    Builders<BaseSaleOrder>.Update
                    .Set(o => o.orderStatus, SalesOrderStatus.waitingForPayment)
                    .PushEach(o => o.updates, new[] {
                        new BaseChatMessage
                        {
                            message = $"Order created for {x.Message.details.orderDetails.selectedSize}"
                        },
                        new BaseChatMessage
                        {
                            message = $"For Artwork {artWork.label} by Bahar Acharjya"
                        }
                    })
                );
                x.Saga.Details = x.Message.details;
            })
            .TransitionTo(WaitingForPayment)
            );

        During(WaitingForPayment,
            When(OnPaymentReceived)
            .ThenAsync(async x =>
            {
                var orderQ =  _db.getCollection<BaseSaleOrder>()
                    .Find(o => o.id == x.Message.CorrelationId);

                var orderString = orderQ.ToString();


                var order = await orderQ
                    .SingleAsync();


                if ( null == order.paymentDetails.baseUiDetails || 
                        x.Message.details.amount < order.paymentDetails?.baseUiDetails?.amount)
                {
                    throw new InvalidOperationException($"incorrect payment amount for order {x.Message.CorrelationId}");
                }

                await _db.getCollection<BaseSaleOrder>()
                .UpdateOneAsync(o => o.id == x.Message.CorrelationId,
                    Builders<BaseSaleOrder>.Update
                    .Set(o => o.orderStatus, SalesOrderStatus.paymentReceived)
                    .Push(o => o.updates, new BaseChatMessage
                    {
                        message = $"Payment received"
                    })
                );

            }
            )
            .Finalize()
            );
    }
}

public class PaymentReceivedMessage : CorrelatedBy<Guid>
{
    public Guid CorrelationId { get; set; }
    public BasePaymentReceivedDetails details { get; set; } = new BasePaymentReceivedDetails();
}

public class OrderPrintSagaState : SagaStateMachineInstance, ISagaVersion
{
    public Guid CorrelationId { get; set; }
    public string? CurrentState { get; set; }
    public int Version { get; set; }

    public PrintOrder Details { get; set; } = new PrintOrder();

}

public class PrintOrderMessage : CorrelatedBy<Guid>
{
    public PrintOrder details { get; set; } = new PrintOrder();
    public Guid CorrelationId { get { return details.id; } }

    /*
    [Newtonsoft.Json.JsonConstructor]
    public PrintOrderMessage(PrintOrder details)
    {
        this.details = details;
    }
    */
}

public class PrintOrder : BaseSaleOrder
{
    public PrintSaleOrderDetails orderDetails { get; set; } = new PrintSaleOrderDetails();
}

public class PrintSaleOrderDetails
{
    public PrintSaleDetail selectedSize { get; set; } = new PrintSaleDetail();

    public string artworkId { get; set; } = string.Empty;
}