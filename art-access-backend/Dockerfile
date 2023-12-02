FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /app/ac-server

# Copy csproj and restore as distinct layers
RUN curl -L https://raw.githubusercontent.com/Microsoft/artifacts-credprovider/master/helpers/installcredprovider.sh  | sh
ARG FEED_ACCESSTOKEN
ENV VSS_NUGET_EXTERNAL_FEED_ENDPOINTS \
    "{\"endpointCredentials\": [{\"endpoint\":\"https://pkgs.dev.azure.com/newearthart/colourBox/_packaging/ac-feed-1/nuget/v3/index.json\", \"password\":\"${FEED_ACCESSTOKEN}\"}]}"

COPY Common/nuget.config ../Common/nuget.config
COPY Common/nuget.config ./nuget.config
COPY Common/*.csproj ../Common/

COPY ac-server/*.csproj ./
ENV app__command=no_deploy

RUN dotnet restore && rm ./nuget.config && rm ../Common/nuget.config

RUN dotnet new tool-manifest && dotnet tool install SwashBuckle.AspNetCore.Cli

# Copy everything else and build
COPY ac-server ./
COPY Common ../Common


RUN dotnet publish -c Release -o out \
    && dotnet swagger tofile --output ./swagger.yml --yaml ./out/ac-server.dll v2 



#FROM openapitools/openapi-generator-cli:v6.0.0 AS public-env
#WORKDIR /app

#RUN npm install openapi-typescript
#/usr/local/bin/docker-entrypoint.sh generate  -i ./swagger.yml -o ./api-out -g typescript-axios -skip-validate-spec

#COPY --from=build-env /app/ac-server/swagger.* ./

#RUN npx openapi-typescript ./swagger.yml --output ./ac-server.ts


# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build-env /app/ac-server/out .
COPY --from=build-env /app/ac-server/swagger.* ./
#COPY --from=public-env /app/ac-server.ts .

RUN mkdir wwwroot

ENTRYPOINT ["dotnet", "ac-server.dll"]

