// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Progmasoft.Progmaweb.Api.Accounts;
using Progmasoft.Progmaweb.Api.Security;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<AccountSessionOptions>(builder.Configuration.GetSection(AccountSessionOptions.SectionName));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IAccountStore, InMemoryAccountStore>();
builder.Services.AddSingleton<AccountService>();
builder.Services.AddSingleton<SessionService>();
builder.Services
    .AddAuthentication()
    .AddCookie(AccountEndpoints.ExternalCookieScheme, options =>
    {
        options.Cookie.Name = "__Host-ProgmasoftExternal";
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
    })
    .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? string.Empty;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? string.Empty;
        options.CallbackPath = "/api/v1/accounts/oauth/google/callback";
        options.SignInScheme = AccountEndpoints.ExternalCookieScheme;
        options.SaveTokens = false;
    });
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
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

app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseAuthentication();
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

app.Run();

/// <summary>Entry point of the Progmaweb account API.</summary>
/// <remarks>
/// The top-level statements configure the services, the request pipeline and the routes. The class is declared so
/// that the integration tests can start the application in memory.
/// </remarks>
public partial class Program;
