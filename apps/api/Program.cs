// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
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
    });
}
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

public partial class Program;
