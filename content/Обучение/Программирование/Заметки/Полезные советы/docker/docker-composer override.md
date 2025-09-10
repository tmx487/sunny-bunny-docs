
```c#
services:
  rates.api:
    container_name: rates.api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=https://+:5001;http://+:5000
    ports:
      - "5000"
      - "5001"
    volumes:
      - ${APPDATA}/Microsoft/UserSecrets:/root/.microsoft/usersecrets:ro
      - ${APPDATA}/ASP.NET/Https:/root/.aspnet/https:ro
    depends_on:
      - rates.db
  rates.db:
    image: postgres:latest
    container_name: rates.db
    environment:
      POSTGRES_USER: rates-sa 
      POSTGRES_PASSWORD: rates-sa 
      POSTGRES_DB: rates
    volumes:
      - postgres:/var/lib/postgresql/data 
    ports:
      - 5432:5432
volumes:
  postgres:  
```

```c#

// Dockerfile
# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Rates.API/Rates.API.csproj", "Rates.API/"]
COPY ["Rates.Contracts/Rates.Contracts.csproj", "Rates.Contracts/"]
COPY ["Rates.Infrastructure/Rates.Infrastructure.csproj", "Rates.Infrastructure/"]
COPY ["Rates.Application/Rates.Application.csproj", "Rates.Application/"]
COPY ["Rates.Domain/Rates.Domain.csproj", "Rates.Domain/"]
RUN dotnet restore "./Rates.API/Rates.API.csproj"
COPY . .
WORKDIR "/src/Rates.API"
RUN dotnet build "./Rates.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Rates.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Rates.API.dll"]
```