// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using System.Globalization;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Where the notices of a new version of the policies are submitted.</summary>
internal sealed class PolicyNoticeOptions
{
    /// <summary>The section of the configuration.</summary>
    public const string Section = "PolicyNotices";

    /// <summary>The mail server, Postfix on the same host.</summary>
    public string SmtpHost { get; set; } = "127.0.0.1";

    /// <summary>Its port; loopback submission needs neither authentication nor TLS.</summary>
    public int SmtpPort { get; set; } = 25;
}

/// <summary>Sends one notice.</summary>
internal interface IPolicyNoticeSender
{
    /// <summary>Sends a message.</summary>
    /// <param name="message">The message.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A task that completes once the mail server took the message.</returns>
    Task SendAsync(MimeMessage message, CancellationToken cancellationToken);
}

/// <summary>Submits notices to the mail server of the host over SMTP.</summary>
/// <param name="options">Where the mail server is.</param>
internal sealed class SmtpPolicyNoticeSender(IOptions<PolicyNoticeOptions> options) : IPolicyNoticeSender
{
    /// <inheritdoc/>
    public async Task SendAsync(MimeMessage message, CancellationToken cancellationToken)
    {
        using SmtpClient client = new();
        // The server is Postfix on loopback, which relays for 127.0.0.0/8 and signs with DKIM; the message never
        // leaves the host before Postfix takes it, and Postfix requires TLS for the remote delivery.
        await client.ConnectAsync(options.Value.SmtpHost, options.Value.SmtpPort, SecureSocketOptions.None, cancellationToken);
        await client.SendAsync(new SmtpSendRequest(message), cancellationToken);
        await client.DisconnectAsync(quit: true, cancellationToken);
    }
}

/// <summary>The notice an account holder gets before a new version of the policies takes effect.</summary>
/// <remarks>
/// The Privacy Policy promises to write to the owners of accounts before a new version takes effect. The notice is
/// sent from <c>noreply@progmasoft.com</c>; replies go to support. It is written in the four languages of the site,
/// English first, because an account keeps no language.
/// </remarks>
internal static class PolicyNotice
{
    /// <summary>The sender of every notice.</summary>
    public static readonly MailboxAddress From = new("Progmasoft", "noreply@progmasoft.com");

    /// <summary>Where a reply goes.</summary>
    public static readonly MailboxAddress ReplyTo = new("Progmasoft Support", "support@progmasoft.com");

    /// <summary>Builds the notice of <see cref="PolicyAcceptance.CurrentVersion"/> for one account.</summary>
    /// <param name="account">The account.</param>
    /// <returns>The message.</returns>
    public static MimeMessage For(AccountRecord account)
    {
        string version = PolicyAcceptance.CurrentVersion;
        DateOnly effective = DateOnly.ParseExact(version, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        string english = effective.ToString("d MMMM yyyy", CultureInfo.GetCultureInfo("en-US"));
        string previous = DateOnly.ParseExact(PolicyAcceptance.PreviousVersion, "yyyy-MM-dd", CultureInfo.InvariantCulture)
            .ToString("d MMMM yyyy", CultureInfo.GetCultureInfo("en-US"));
        string privacy = $"https://progmasoft.com/privacy/{version}";
        string security = $"https://progmasoft.com/security/{version}";

        MimeMessage message = new();
        message.From.Add(From);
        message.ReplyTo.Add(ReplyTo);
        message.To.Add(new MailboxAddress(account.AccountName, account.Email));
        message.Subject = $"The Progmasoft policies change on {english}";
        message.MessageId = MimeKit.Utils.MimeUtils.GenerateMessageId("progmasoft.com");
        message.Headers.Add("Auto-Submitted", "auto-generated");
        message.Body = new TextPart("plain")
        {
            Text = $"""
                Hello {account.AccountName},

                The Privacy Policy and the Security Policy of Progmasoft change on {english}. ViGet was closed, and the
                new version names the Agenceland MCP Marketplace (agencelandmcp.progmasoft.com) in its place: once the
                marketplace takes uploads, the IP address an upload came from is kept with it, malicious software is
                taken off and the account that uploaded it is closed, and every server it serves is listed with its
                SHA-256 digest, which Agenceland checks. Nothing else changes.

                The new version:
                {privacy}
                {security}

                Until {english}, the version of {previous} applies. If you do not agree, write to
                support@progmasoft.com from the address of your account and we delete the account.

                Progmasoft

                --

                Die Datenschutzerklärung und die Sicherheitsrichtlinie von Progmasoft ändern sich am {effective.ToString("d. MMMM yyyy", CultureInfo.GetCultureInfo("de-DE"))}.
                ViGet wurde geschlossen; an seiner Stelle nennt die neue Fassung den Agenceland MCP Marketplace
                (agencelandmcp.progmasoft.com). Sonst ändert sich nichts. Die neue Fassung: {privacy} und {security}.
                Wenn Sie nicht einverstanden sind, schreiben Sie von der Adresse Ihres Kontos an support@progmasoft.com,
                und wir löschen das Konto.

                --

                Политика конфиденциальности и Политика безопасности Progmasoft меняются {effective.ToString("d MMMM yyyy", CultureInfo.GetCultureInfo("ru-RU"))} г.
                ViGet закрыт; вместо него новая версия называет Agenceland MCP Marketplace
                (agencelandmcp.progmasoft.com). Больше ничего не меняется. Новая версия: {privacy} и {security}.
                Если вы не согласны, напишите на support@progmasoft.com с адреса вашей учётной записи, и мы её удалим.

                --

                La Politique de confidentialité et la Politique de sécurité de Progmasoft changent le {effective.ToString("d MMMM yyyy", CultureInfo.GetCultureInfo("fr-FR"))}.
                ViGet a été fermé ; à sa place, la nouvelle version nomme l’Agenceland MCP Marketplace
                (agencelandmcp.progmasoft.com). Rien d’autre ne change. La nouvelle version : {privacy} et {security}.
                Si vous n’êtes pas d’accord, écrivez à support@progmasoft.com depuis l’adresse de votre compte, et nous
                supprimons le compte.
                """
        };
        return message;
    }
}
