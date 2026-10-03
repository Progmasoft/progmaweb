// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

namespace Progmasoft.Progmaweb.Api.Security;

/// <summary>Decides which forwarded headers the API trusts.</summary>
/// <remarks>
/// The API listens on loopback behind Nginx and the Next.js server. Only those local proxies may state the client
/// address, host and scheme; the authentication rate limiter depends on the client address being genuine.
/// </remarks>
internal static class ForwardedHeadersPolicy
{
    /// <summary>Number of proxy hops whose headers are read.</summary>
    internal const int MaximumForwardedHops = 1;
    /// <summary>Addresses of the proxies that may send forwarded headers.</summary>
    internal static readonly IPAddress[] TrustedProxies = [IPAddress.Loopback, IPAddress.IPv6Loopback];

    /// <summary>Applies the policy to the forwarded-headers middleware.</summary>
    /// <param name="options">Options to configure.</param>
    public static void Configure(ForwardedHeadersOptions options)
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedHost |
            ForwardedHeaders.XForwardedProto;
        options.ForwardLimit = MaximumForwardedHops;

        // The API is bound to loopback and only receives forwarded headers from the local Nginx/Next.js proxy.
        // Trusting every peer would let a direct caller forge the IP used by the authentication rate limiter.
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
        foreach (IPAddress trustedProxy in TrustedProxies)
        {
            options.KnownProxies.Add(trustedProxy);
        }
    }
}
