using System.Net;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class SecurityHeaderTests
{
    [Fact]
    public async Task ApiResponsesSetDefensiveHeaders()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        HttpResponseMessage response =
            await client.GetAsync("/api/v1/status", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("no-store", Assert.Single(response.Headers.GetValues("Cache-Control")));
        Assert.Equal("no-referrer", Assert.Single(response.Headers.GetValues("Referrer-Policy")));
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
        Assert.Equal("DENY", Assert.Single(response.Headers.GetValues("X-Frame-Options")));
        Assert.Contains("frame-ancestors 'none'",
            Assert.Single(response.Headers.GetValues("Content-Security-Policy")), StringComparison.Ordinal);
    }
}
