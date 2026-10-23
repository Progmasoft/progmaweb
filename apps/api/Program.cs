// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Progmasoft.Progmaweb.Api.Accounts;
using Progmasoft.OAuth;
using Progmasoft.Progmaweb.Api.Security;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<AccountSessionOptions>(builder.Configuration.GetSection(AccountSessionOptions.SectionName));
builder.Services.AddSingleton(TimeProvider.System);
AccountStoreKind accountStore = builder.Services.AddAccountStore(
    builder.Configuration,
    builder.Environment.IsProduction());
builder.Services.AddSingleton<AccountService>();
builder.Services.AddSingleton<SessionService>();
// Progmasoft OAuth, the OAuth 2.1 and OpenID Connect provider on its own host; see OAuth/OAuthRegistration.cs.
builder.Services.AddProgmasoftOAuth(builder.Configuration, accountStore, builder.Environment.IsProduction());
builder.Services.AddAuthorization();
AuthenticationBuilder authentication = builder.Services
    .AddAuthentication()
    .AddCookie(AccountEndpoints.ExternalCookieScheme, options =>
    {
        options.Cookie.Name = "__Host-ProgmasoftExternal";
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
    });

// The Google scheme exists only when its client is configured. Registered with empty credentials, its option
// validation fails inside the authentication middleware and every request, not only Google sign-in, ends in 500.
// Without the scheme the service runs normally and the Google start endpoint answers that sign-in is unavailable.
string? googleClientId = builder.Configuration["Authentication:Google:ClientId"];
string? googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
{
    authentication.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;
        options.CallbackPath = "/api/v1/accounts/oauth/google/callback";
        options.SignInScheme = AccountEndpoints.ExternalCookieScheme;
        options.SaveTokens = false;
        // A callback that cannot finish (the visitor declined on Google, or the state cookie is missing or
        // expired) would otherwise end in an unhandled 500. The cause is logged, and the sign-in page explains
        // a failed Google sign-in.
        options.Events.OnRemoteFailure = context => GoogleSignInFailure.HandleAsync(
            context,
            context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger(typeof(GoogleSignInFailure)));
    });
}
builder.Services.AddProblemDetails();
// progmasoft.com is served as if .com required HSTS: the API answers with the same preload header as Nginx, so a
// proxied response never carries two different policies.
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(730);
    options.IncludeSubDomains = true;
    options.Preload = true;
});
builder.Services.AddHealthChecks();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // The OAuth endpoints and the developer portal: generous for real clients, a ceiling for scripted abuse.
    options.AddPolicy("oauth", context =>
    {
        string partition = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(partition, _ => new SlidingWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 60,
            QueueLimit = 0,
            SegmentsPerWindow = 6,
            Window = TimeSpan.FromMinutes(1)
        });
    });
    options.AddPolicy("account-auth", context =>
    {
        string partition = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(partition, _ => new SlidingWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 12,
            QueueLimit = 0,
            SegmentsPerWindow = 6,
            Window = TimeSpan.FromMinutes(3)
        });
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(ForwardedHeadersPolicy.Configure);

builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 16 * 1024);

WebApplication app = builder.Build();

if (accountStore is AccountStoreKind.Memory)
{
    AccountStoreRegistration.WarnThatAccountsAreInMemory(app.Logger);
}

app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseMiddleware<SecurityHeadersMiddleware>();
// Before authentication, where OpenIddict answers its own endpoints: OAuth only on its host, and nothing else there.
app.UseMiddleware<OAuthHostFilter>();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseExceptionHandler();

app.MapHealthChecks("/health");
app.MapGet("/api/v1/status", () => Results.Ok(new
{
    service = "progmaweb-account",
    status = "online",
    version = "1.0.0"
}));
app.MapAccountEndpoints();
app.MapProgmasoftOAuth();

app.Run();

/// <summary>Entry point of the Progmaweb account API.</summary>
/// <remarks>
/// The top-level statements configure the services, the request pipeline and the routes. The class is declared so
/// that the integration tests can start the application in memory.
/// </remarks>
public partial class Program;
