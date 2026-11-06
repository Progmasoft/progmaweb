// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;

namespace Progmasoft.Progmaweb.AiSupport;

/// <summary>What AI Support writes to its log. No entry contains a question, an answer or an address.</summary>
internal static partial class Log
{
    /// <summary>The service started without an index.</summary>
    [LoggerMessage(EventId = 1, Level = LogLevel.Warning,
        Message = "No index at {Path}; questions are answered without documentation.")]
    public static partial void MissingIndex(ILogger logger, string path);

    /// <summary>A model server refused or failed a request.</summary>
    [LoggerMessage(EventId = 2, Level = LogLevel.Warning, Message = "A model server failed: {Status}")]
    public static partial void ModelFailed(ILogger logger, HttpStatusCode? status);
}
