// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Progmasoft.Progmaweb.Api.Security;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class SecurityHeaderTests
{
    [Fact]
    public void ForwardedHeadersTrustOnlyTheLocalReverseProxy()
    {
        ForwardedHeadersOptions options = new();

        ForwardedHeadersPolicy.Configure(options);

        Assert.Equal(ForwardedHeadersPolicy.MaximumForwardedHops, options.ForwardLimit);
        Assert.Equal(ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedHost |
            ForwardedHeaders.XForwardedProto, options.ForwardedHeaders);
        Assert.Equal(ForwardedHeadersPolicy.TrustedProxies, options.KnownProxies);
        Assert.Empty(options.KnownIPNetworks);
    }

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
