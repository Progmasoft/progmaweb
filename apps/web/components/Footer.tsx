import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand compact />
          <p>
            Programming-language infrastructure and developer systems built with
            durable contracts.
          </p>
        </div>
        <div>
          <strong>Products</strong>
          <a href="https://xsharp-lang.xyz/">Visual X#</a>
          <a href="https://viget.xsharp-lang.xyz/">ViGet</a>
          <a href="https://github.com/Progmasoft">Open source</a>
        </div>
        <div>
          <strong>Company</strong>
          <a href="mailto:support@progmasoft.com">Support</a>
          <a href="https://account.progmasoft.com/">Account</a>
          <a href="https://github.com/Progmasoft/progmaweb">Website source</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Progmasoft</span>
        <span>Designed for clarity, security, and long-term maintenance.</span>
      </div>
    </footer>
  );
}
