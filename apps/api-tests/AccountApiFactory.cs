using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Progmasoft.Progmaweb.Api.Tests;

internal sealed class AccountApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AccountSessions:LifetimeHours"] = "2",
                ["AccountSessions:CookieName"] = "__Host-ProgmasoftSession"
            });
        });
    }

    public HttpClient CreateAccountClient(bool handleCookies = true) => CreateClient(
        new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = handleCookies
        });
}
