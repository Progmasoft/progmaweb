import Link from "next/link";
import { Brand } from "./Brand";

interface SiteHeaderProps {
  account?: boolean;
  signedInName?: string;
}

export function SiteHeader({ account = false, signedInName }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand account={account} />
        <nav className="primary-nav" aria-label="Primary navigation">
          {account ? (
            <>
              <Link href="https://www.progmasoft.com/">Company</Link>
              {signedInName ? (
                <Link
                  className="button button-small"
                  href={`/${signedInName}/dashboard`}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login">Sign in</Link>
                  <Link className="button button-small" href="/register">
                    Create account
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <a href="#products">Products</a>
              <a href="#principles">Principles</a>
              <a href="https://github.com/Progmasoft">GitHub</a>
              <Link
                className="button button-small"
                href="https://account.progmasoft.com/"
              >
                Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
