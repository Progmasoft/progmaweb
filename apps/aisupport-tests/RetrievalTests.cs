// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Progmasoft.Progmaweb.AiSupport.Answering;
using Progmasoft.Progmaweb.AiSupport.Corpus;
using Progmasoft.Progmaweb.AiSupport.Llama;
using Progmasoft.Progmaweb.AiSupport.Retrieval;

namespace Progmasoft.Progmaweb.AiSupport.Tests;

public sealed class RetrievalTests
{
    private static IndexEntry Entry(string title, params float[] vector) =>
        new(title, $"https://example.invalid/{title}", title, title, LlamaClient.Normalize(vector));

    [Fact]
    public void SearchReturnsTheClosestPassagesAboveTheThreshold()
    {
        KnowledgeIndex index = new("model", [
            Entry("north", 0, 1), Entry("east", 1, 0), Entry("north-east", 1, 1), Entry("south", 0, -1)
        ]);

        IReadOnlyList<(IndexEntry Entry, float Score)> results = index.Search(LlamaClient.Normalize([0.1f, 1]), 2, 0.3f);

        Assert.Equal(["north", "north-east"], results.Select(result => result.Entry.Title));
        Assert.True(results[0].Score > results[1].Score);
        Assert.Equal(["south"], index.Search([0, -1], 3, 0.99f).Select(result => result.Entry.Title));
    }

    [Fact]
    public void AVectorOfAnotherSizeMatchesNothing()
    {
        KnowledgeIndex index = new("model", [Entry("one", 1, 0)]);

        Assert.Empty(index.Search([1, 0, 0], 3, -1));
    }

    [Fact]
    public void AnIndexReadsBackAsItWasWritten()
    {
        string path = Path.Combine(Directory.CreateTempSubdirectory("aisupport-index").FullName, "index.json");
        KnowledgeIndex index = new("model", [Entry("one", 3, 4)]);

        index.Save(path);
        KnowledgeIndex read = KnowledgeIndex.Load(path);

        Assert.Equal("model", read.Model);
        IndexEntry entry = Assert.Single(read.Entries);
        Assert.Equal([0.6f, 0.8f], entry.Vector);
        Assert.False(File.Exists(path + ".new"));
    }

    [Fact]
    public async Task ABuildEmbedsOnlyThePassagesThatChanged()
    {
        string root = Directory.CreateTempSubdirectory("aisupport-build").FullName;
        Directory.CreateDirectory(Path.Combine(root, "talafmt"));
        string readme = Path.Combine(root, "talafmt", "README.md");
        await File.WriteAllTextAsync(readme, "# talafmt\n\nFormats.\n\n## Check\n\nChecks.\n",
            TestContext.Current.CancellationToken);
        CorpusManifest manifest = new([new CorpusSource("talafmt", "main", ["README.md"], null, "github")]);
        CountingModels models = new();
        IndexBuilder builder = new(models);

        (KnowledgeIndex first, int firstEmbedded) =
            await builder.BuildAsync(manifest, root, KnowledgeIndex.Empty, TestContext.Current.CancellationToken);
        await File.WriteAllTextAsync(readme, "# talafmt\n\nFormats.\n\n## Check\n\nChecks files.\n",
            TestContext.Current.CancellationToken);
        (KnowledgeIndex second, int secondEmbedded) =
            await builder.BuildAsync(manifest, root, first, TestContext.Current.CancellationToken);
        (_, int otherModel) = await builder.BuildAsync(
            manifest, root, second with { Model = "another" }, TestContext.Current.CancellationToken);

        Assert.Equal(2, firstEmbedded);
        Assert.Equal(1, secondEmbedded);
        Assert.Equal(2, otherModel);
        Assert.Equal(IndexBuilder.Model, second.Model);
        Assert.Equal(["talafmt", "talafmt › Check"], second.Entries.Select(entry => entry.Title));
        Assert.All(second.Entries, entry =>
            Assert.Equal("https://github.com/Progmasoft/talafmt/blob/main/README.md", entry.Url));
        Assert.Equal(
            [IndexBuilder.Document("talafmt", "Formats."), IndexBuilder.Document("talafmt › Check", "Checks.")],
            models.Embedded.Take(2));
    }

    [Theory]
    [InlineData("  How do I build?  ", true, "How do I build?")]
    [InlineData("line one\r\nline two", true, "line one\nline two")]
    [InlineData("   ", false, "")]
    [InlineData(null, false, "")]
    [InlineData("bell\a", false, "bell\a")]
    public void AQuestionIsCheckedAndTrimmed(string? question, bool accepted, string expected)
    {
        Assert.Equal(accepted, AnswerService.TryNormalize(question, out string normalized));
        Assert.Equal(expected, normalized);
    }

    [Fact]
    public void AQuestionOfMoreThanAThousandCharactersIsRefused()
    {
        Assert.True(AnswerService.TryNormalize(new string('a', 1000), out _));
        Assert.False(AnswerService.TryNormalize(new string('a', 1001), out _));
    }

    [Fact]
    public void ThePromptNumbersTheExcerptsAndAsksOnlyForThem()
    {
        IReadOnlyList<ChatMessage> messages = AnswerService.Messages("How?", [Entry("first", 1), Entry("second", 1)]);

        Assert.Equal(["system", "user"], messages.Select(message => message.Role));
        Assert.Contains("[1] first\nfirst", messages[0].Content, StringComparison.Ordinal);
        Assert.Contains("[2] second\nsecond", messages[0].Content, StringComparison.Ordinal);
        Assert.Contains("Answer only from the documentation excerpts", messages[0].Content, StringComparison.Ordinal);
        Assert.Equal("How?", messages[1].Content);
        Assert.Contains("(none matched the question)", AnswerService.Messages("How?", [])[0].Content,
            StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("""{"choices":[{"delta":{"content":"Hel"}}]}""", "Hel")]
    [InlineData("""{"choices":[{"delta":{"role":"assistant"}}]}""", null)]
    [InlineData("""{"choices":[{"delta":{"content":null}}]}""", null)]
    [InlineData("""{"choices":[]}""", null)]
    public void AStreamedChunkAddsItsContent(string data, string? expected)
    {
        Assert.Equal(expected, LlamaClient.ChunkText(data));
    }

    private sealed class CountingModels : ILanguageModels
    {
        public List<string> Embedded { get; } = [];

        public Task<float[][]> EmbedAsync(IReadOnlyList<string> texts, CancellationToken cancellationToken)
        {
            Embedded.AddRange(texts);
            return Task.FromResult(texts.Select(text => LlamaClient.Normalize([text.Length, 1])).ToArray());
        }

        public IAsyncEnumerable<string> ChatAsync(IReadOnlyList<ChatMessage> messages, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }
}
