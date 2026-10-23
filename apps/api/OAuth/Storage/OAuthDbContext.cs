// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.EntityFrameworkCore;
using OpenIddict.EntityFrameworkCore.Models;

namespace Progmasoft.OAuth.Storage;

/// <summary>The tables of Progmasoft OAuth: OpenIddict's, and who owns each application.</summary>
/// <remarks>
/// The tables are named <c>oauth_*</c> so that they sit next to the account tables of the same database without a
/// clash. <see cref="OAuthSchema"/> creates them; Entity Framework only reads and writes rows.
/// </remarks>
/// <param name="options">Options of the context.</param>
internal sealed class OAuthDbContext(DbContextOptions<OAuthDbContext> options) : DbContext(options)
{
    /// <summary>Which account registered which application.</summary>
    public DbSet<ApplicationOwner> ApplicationOwners => Set<ApplicationOwner>();

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseOpenIddict();
        modelBuilder.Entity<OpenIddictEntityFrameworkCoreApplication>().ToTable("oauth_applications");
        modelBuilder.Entity<OpenIddictEntityFrameworkCoreAuthorization>().ToTable("oauth_authorizations");
        modelBuilder.Entity<OpenIddictEntityFrameworkCoreScope>().ToTable("oauth_scopes");
        modelBuilder.Entity<OpenIddictEntityFrameworkCoreToken>().ToTable("oauth_tokens");
        modelBuilder.Entity<ApplicationOwner>(owner =>
        {
            owner.ToTable("oauth_application_owners");
            owner.HasKey(entry => entry.ApplicationId);
            owner.HasIndex(entry => entry.AccountId);
            owner.HasOne<OpenIddictEntityFrameworkCoreApplication>()
                .WithMany()
                .HasForeignKey(entry => entry.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

/// <summary>The account that registered an application and may change or delete it.</summary>
internal sealed class ApplicationOwner
{
    /// <summary>Identifier of the OpenIddict application.</summary>
    public string ApplicationId { get; set; } = string.Empty;

    /// <summary>Identifier of the owning account.</summary>
    public Guid AccountId { get; set; }

    /// <summary>When the application was registered.</summary>
    public DateTimeOffset CreatedAt { get; set; }
}
