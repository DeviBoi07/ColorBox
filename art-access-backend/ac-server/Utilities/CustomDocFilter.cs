using System;
using Common.models;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ac_server;

public class CustomDocFilter : IDocumentFilter
{

    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var schemaGenerator = context.SchemaGenerator;

        foreach (var foundType in PolymorphicBaseJsonConverter.GetPolymorphicTypes())
            schemaGenerator.GenerateSchema(foundType, context.SchemaRepository);
    }
}

