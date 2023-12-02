using System;
using System.ComponentModel.DataAnnotations;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;

namespace Common.Services;

public interface IStripePayments
{
    Task<models.BasePaymentDetails> CreatePaymentDetails(decimal salePrice);
    Task CheckPaymentStatus(Guid orderId, string paymentId);
}

public class StripePayments: IStripePayments
{
    readonly StripeConfig _config;
    readonly IPublishEndpoint _publishEp;
    readonly ILogger _logger;

    public StripePayments(IConfiguration config,
        IPublishEndpoint publishEp,
        ILogger<StripePayments> logger
        )
    {
        _publishEp = publishEp;
        _logger = logger;   
        _config = config.GetSection("stripe").Get<StripeConfig>() ?? new StripeConfig();
        StripeConfiguration.ApiKey = _config.secret;
    }

    public async Task CheckPaymentStatus(Guid orderId, string paymentId)
    {
        var service = new PaymentIntentService();

        var intent = await service.GetAsync(paymentId, new PaymentIntentGetOptions
        {
            //ClientSecret = correlation.ClientSecret
            //ExtraParams
            Expand = new List<string>(new[] { "payment_method" })

        }, new RequestOptions
        {
            //StripeAccount = correlation.ConnectedAccount,
            ApiKey = _config.secret
        });

        if (null == intent)
        {
            throw new Exception($"invalid intent id {paymentId}");
        }

        if (intent.Status != "succeeded")
        {
            _logger.LogInformation($"intent {paymentId} status is {intent.Status}");
        }

        await _publishEp.Publish(new Sagas.PaymentReceivedMessage
        {
            CorrelationId = orderId,
            details = new StripePaymentReceived
            {
                paymentId = paymentId,
                amount = (decimal)(intent.Amount / 100.00),
                cardFingerPrint = intent.PaymentMethod?.Card?.Fingerprint,
                receiptEmail = intent.ReceiptEmail,
            }

        });

    }

    public async Task<models.BasePaymentDetails> CreatePaymentDetails(decimal salePrice)
    {
        var service = new PaymentIntentService();
        var createOptions = new PaymentIntentCreateOptions
        {
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions()
            {
                Enabled = true
            },
            Amount = (long)Math.Round(salePrice * 100),
            Currency = "usd",
            
        };

        /*
        var options = new ApplePayDomainCreateOptions
        {
            DomainName = _config.applePayDomain,
        };
        */

        //var appleService = new ApplePayDomainService();
        var requestOptions = new RequestOptions
        {
            //StripeAccount = creatorStripe.account,
        };

        var intent = await service.CreateAsync(createOptions, requestOptions);
        //var domain = appleService.Create(options, requestOptions);

        return new StripePaymentDetails
        {
            paymentId = intent.Id,
            uiDetails = new StripePaymentIntent
            {
                redirectUrl = $"{_config.onBoardingReturn}/paymentComplete",
                //ConnectedAccount = creatorStripe.account,
                clientSecret = intent.ClientSecret,
                amount = salePrice,
                stripeKey = _config.publishableKey
            }
        };


    }
}

/// <summary>
/// Saved in the db contains props that should NOT be sent to the front end
/// </summary>
public class StripePaymentDetails: models.BasePaymentDetails<StripePaymentIntent>
{

}

public class StripePaymentReceived : models.BasePaymentReceivedDetails
{
    public string? cardFingerPrint { get; set; }
    public string? receiptEmail { get; set; }
}

/// <summary>
/// Safe to send to the front end
/// </summary>
public class StripePaymentIntent : models.BasePaymentUIDetails
{

    /*
    [Required]
    public string ConnectedAccount { get; set; } = "";
    */

    [Required]
    public string clientSecret { get; set; } = "";

    /// <summary>
    /// IF payment needs a redirect they come back here
    /// </summary>
    [Required]
    public string redirectUrl { get; set; } = "";


    /// <summary>
    /// Stripe publishable key
    /// </summary>
    [Required]
    public string stripeKey { get; set; } = "";

}


public class StripeConfig
{
    public string publishableKey { get; set; } = "pk_test_WonFfiujE8aFSDwnpnp8B6qg";

    public string secret { get; set; } = "sk_test_yN7LGhVVLvz18G7m9KukGE7z";

    public string onBoardingReturn { get; set; } = "http://localhost:3000/stripe";

    public string applePayDomain { get; set; } = "localhost";
}

