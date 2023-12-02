using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Common.Sagas;

public static class Setup
{
    /// <summary>
    /// Add delay to message publish
    /// </summary>
    /// <param name="ctx"></param>
    /// <param name="delay"></param>
    public static void AddDelay(this SendContext ctx, TimeSpan delay)
    {
        ctx.Headers.Set("x-delay", delay.TotalMilliseconds);
    }

    public static IServiceCollection ConfigureACSagas(this IServiceCollection services,
        IConfiguration config
        )
    {
        var mongoConfig = config.GetSection("mongo").Get<MongoConfig>() ?? new MongoConfig();
        var rabbitCfg = config.GetSection("rabbitmq").Get<RabbitMQConfig>() ?? new RabbitMQConfig();

        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.UseMessageRetry(r =>
                {
                    r.Incremental(3, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(5));
                    r.Ignore<InvalidOperationException>();
                    r.Ignore<ArgumentNullException>();
                });

                cfg.Host(rabbitCfg.host, rabbitCfg.virtualHost, h =>
                {
                    h.Username(rabbitCfg.userName);
                    h.Password(rabbitCfg.password);
                });

                cfg.ConfigureEndpoints(context);
            });

            /*
            x.AddConsumer<Sagas.CheckTxConfirmationConsumer>();
            x.AddConsumer<Sagas.OwnerCacheConsumer>();
            x.AddConsumer<Sagas.DailyResetConsumer>();
            */

            x.AddSagaStateMachine<Sagas.OrderPrintSaga, Sagas.OrderPrintSagaState>()
                    .MongoDbRepository(r =>
                    {
                        r.Connection = mongoConfig.connectionString;
                        r.DatabaseName = mongoConfig.dbName + "_sagas";
                    });

        });

        return services;
    }
}

public class RabbitMQConfig
{
    public string userName { get; set; } = "admin";
    public string password { get; set; } = "admin";

    public string host { get; set; } = "localhost";
    public string virtualHost { get; set; } = "/";
}

