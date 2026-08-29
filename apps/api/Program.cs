// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Progmasoft.Progmaweb.Api.Accounts;
using Progmasoft.Progmaweb.Api.Security;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<AccountSessionOptions>(builder.Configuration.GetSection(AccountSessionOptions.SectionName));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IAccountStore, InMemoryAccountStore>();
builder.Services.AddSingleton<AccountService>();
builder.Services.AddSingleton<SessionService>();
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

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedHost |
        ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

WebApplication app = builder.Build();

app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseMiddleware<SecurityHeadersMiddleware>();
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
