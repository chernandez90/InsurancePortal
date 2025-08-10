# Dockerfile inside InsurancePortal.API

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["InsurancePortal.API/InsurancePortal.API.csproj", "InsurancePortal.API/"]
RUN dotnet restore "InsurancePortal.API/InsurancePortal.API.csproj"
COPY . .
WORKDIR "/src/InsurancePortal.API"
RUN dotnet build "InsurancePortal.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "InsurancePortal.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Critical fix: Tell ASP.NET Core to listen on all interfaces
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV FRONTEND_URL=""

# Install required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libicu-dev \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["dotnet", "InsurancePortal.API.dll"]
