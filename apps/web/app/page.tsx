// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

const products = [
  {
    eyebrow: "Programming language",
    name: "Visual X#",
    description:
      "A modern programming language developed by Progmasoft, with its own dedicated product and documentation site.",
    href: "https://xsharp-lang.xyz/",
    action: "Explore Visual X#",
    accent: "violet",
  },
  {
    eyebrow: "Package registry",
    name: "ViGet",
    description:
      "The canonical package and DSL-plugin registry for the Visual X# ecosystem, operated directly by Progmasoft.",
    href: "https://viget.progmasoft.com/",
    action: "Open ViGet",
    accent: "blue",
  },
  {
    eyebrow: "Developer tooling",
    name: "Open engineering",
    description:
      "Compiler, formatter, linter, analyzer, project-system, and editor work developed in public repositories.",
    href: "https://github.com/Progmasoft",
    action: "View on GitHub",
    accent: "green",
  },
] as const;

export default function Homepage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero corporate-hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Developer systems by Progmasoft</p>
              <h1>
                Tools should make hard work <span>understandable.</span>
              </h1>
              <p className="hero-lede">
                We build programming-language infrastructure, package systems,
                and developer tools around explicit contracts instead of
                accidental complexity.
              </p>
              <div className="hero-actions">
                <a className="button" href="#products">
                  Explore products
                </a>
                <a
                  className="button button-secondary"
                  href="https://github.com/Progmasoft"
                >
                  Browse source
                </a>
              </div>
              <dl className="hero-facts">
                <div>
                  <dt>Open</dt>
                  <dd>Public engineering</dd>
                </div>
                <div>
                  <dt>Typed</dt>
                  <dd>Contracts before shortcuts</dd>
                </div>
                <div>
                  <dt>Native</dt>
                  <dd>Performance without mystery</dd>
                </div>
              </dl>
            </div>
            <div
              className="hero-visual"
              aria-label="Progmasoft product principles"
            >
              <div className="system-window">
                <div className="window-bar">
                  <span></span>
                  <span></span>
                  <span></span>
                  <code>progmasoft/company</code>
                </div>
                <div className="system-stack">
                  <div className="stack-row stack-language">
                    <span>Products</span>
                    <strong>Focused experiences</strong>
                    <small>
                      Clear purpose · durable names · public identity
                    </small>
                  </div>
                  <div className="stack-arrow" aria-hidden="true">
                    ↓
                  </div>
                  <div className="stack-row stack-project">
                    <span>Platform</span>
                    <strong>Shared account foundation</strong>
                    <small>Authentication · service access · recovery</small>
                  </div>
                  <div className="stack-arrow" aria-hidden="true">
                    ↓
                  </div>
                  <div className="stack-row stack-native">
                    <span>Operations</span>
                    <strong>First-party infrastructure</strong>
                    <small>Observable · maintainable · directly operated</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="products">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Products and projects</p>
                <h2>One ecosystem, clear boundaries.</h2>
              </div>
              <p>
                Each surface has one responsibility and a documented contract
                with the next layer.
              </p>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article
                  className={`product-card accent-${product.accent}`}
                  key={product.name}
                >
                  <p className="eyebrow">{product.eyebrow}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <a href={product.href}>{product.action} →</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted" id="principles">
          <div className="shell principles-grid">
            <div className="section-heading vertical">
              <p className="eyebrow">Engineering principles</p>
              <h2>Built to remain legible.</h2>
              <p>
                Architecture is useful only when a new contributor can
                understand where a decision belongs and how to verify it.
              </p>
            </div>
            <div className="principle-list">
              <article>
                <span>01</span>
                <div>
                  <h3>Explicit contracts</h3>
                  <p>
                    Typed boundaries make ownership, compatibility, and failure
                    behavior visible.
                  </p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Real verification</h3>
                  <p>
                    Tests exercise installed artifacts, production-shaped paths,
                    and observable behavior.
                  </p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>Durable naming</h3>
                  <p>
                    Public vocabulary follows the product model rather than
                    historical implementation accidents.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section callout-section">
          <div className="shell callout">
            <div>
              <p className="eyebrow">Progmasoft account</p>
              <h2>A single identity for Progmasoft services.</h2>
              <p>
                Manage your profile and future service access from the dedicated
                account surface.
              </p>
            </div>
            <a
              className="button button-light"
              href="https://account.progmasoft.com/"
            >
              Open account
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
