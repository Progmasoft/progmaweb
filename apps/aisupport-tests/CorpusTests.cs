// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Progmasoft.Progmaweb.AiSupport.Corpus;

namespace Progmasoft.Progmaweb.AiSupport.Tests;

public sealed class CorpusTests
{
    [Fact]
    public void APassageCarriesTheHeadingsAboveIt()
    {
        const string Markdown =
            """
            # Tazel

            Intro.

            ## Commands

            ### build

            Builds a target.

            ## Lockfile

            Pins versions.
            """;

        IReadOnlyList<Passage> passages = DocumentChunker.Split("Documents/CLI.md", Markdown);

        Assert.Equal(
            [
                new Passage("Tazel", "Intro."),
                new Passage("Tazel › Commands › build", "Builds a target."),
                new Passage("Tazel › Lockfile", "Pins versions.")
            ],
            passages);
    }

    [Fact]
    public void AHashInACodeBlockIsNotAHeading()
    {
        const string Markdown =
            """
            ## Example

            ```bash
            # not a heading
            tazel build
            ```
            """;

        Passage passage = Assert.Single(DocumentChunker.Split("README.md", Markdown));

        Assert.Equal("README.md › Example", passage.Title);
        Assert.Contains("# not a heading", passage.Text, StringComparison.Ordinal);
    }

    [Fact]
    public void FrontMatterNamesTheDocument()
    {
        const string Markdown = "---\ntitle: \"Installation\"\nnavigation: true\n---\n\nInstall Tazel.\n";

        Passage passage = Assert.Single(DocumentChunker.Split("content/en-US/docs/1.a/1.installation.md", Markdown));

        Assert.Equal(new Passage("Installation", "Install Tazel."), passage);
    }

    [Fact]
    public void LongTextIsCutAtBlankLinesAndWhiteSpace()
    {
        string paragraph = string.Join(' ', Enumerable.Repeat("word", 200));
        string longParagraph = string.Join(' ', Enumerable.Repeat("token", 700));
        string source = string.Join("\n\n", paragraph, paragraph, longParagraph);

        IReadOnlyList<Passage> passages = DocumentChunker.Split("Spec/Language/Decls.tala", source);

        Assert.All(passages, passage => Assert.InRange(passage.Text.Length, 1, DocumentChunker.MaximumLength));
        Assert.All(passages, passage => Assert.Equal("Spec/Language/Decls.tala", passage.Title));
        Assert.Equal(
            source.Split([' ', '\n'], StringSplitOptions.RemoveEmptyEntries),
            passages.SelectMany(passage => passage.Text.Split([' ', '\n'], StringSplitOptions.RemoveEmptyEntries)));
    }

    [Theory]
    [InlineData("tazel-docs", "tazel.net", "main", "content/en-US/docs/2.reference/1.commands.md",
        "https://tazel.net/docs/reference/commands")]
    [InlineData("tazel-docs", "tazel.net", "main", "content/en-US/docs/2.reference/0.index.md",
        "https://tazel.net/docs/reference")]
    [InlineData("github", "catch3", "devel", "docs/assertions.md",
        "https://github.com/Progmasoft/catch3/blob/devel/docs/assertions.md")]
    public void AFileHasThePublicAddressOfItsSource(
        string links, string repository, string branch, string path, string expected)
    {
        CorpusFile file = new(new CorpusSource(repository, branch, ["**"], null, links), path, path);

        Assert.Equal(expected, SourceLinks.For(file));
    }

    [Fact]
    public void TheManifestTakesTheIncludedFilesOfEachRepositoryInOrder()
    {
        string root = Directory.CreateTempSubdirectory("aisupport-corpus").FullName;
        try
        {
            foreach (string path in new[]
                     {
                         "tala/README.md", "tala/Documents/CLI.md", "tala/Documents/Contributing/STYLE.md",
                         "tala/Benchmarks/X.md", "tala/Spec/Language/Decls.tala"
                     })
            {
                string full = Path.Combine(root, path);
                Directory.CreateDirectory(Path.GetDirectoryName(full)!);
                File.WriteAllText(full, "text");
            }

            CorpusManifest manifest = new([
                new CorpusSource("tala", "main", ["README.md", "Documents/**/*.md", "Spec/**/*.tala"],
                    ["Documents/Contributing/**"], "github")
            ]);

            Assert.Equal(
                ["Documents/CLI.md", "README.md", "Spec/Language/Decls.tala"],
                manifest.Enumerate(root).Select(file => file.Path));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    [Fact]
    public void TheManifestOfTheServiceReadsAndLinksEverySource()
    {
        CorpusManifest manifest = CorpusManifest.Load(Path.Combine(AppContext.BaseDirectory, "corpus.json"));

        Assert.Contains(manifest.Sources, source => source.Repository == "tala");
        Assert.All(manifest.Sources, source =>
            Assert.StartsWith("https://", SourceLinks.For(new CorpusFile(source, "README.md", "README.md")),
                StringComparison.Ordinal));
    }
}
