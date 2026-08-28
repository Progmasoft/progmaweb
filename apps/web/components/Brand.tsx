import Link from "next/link";

interface BrandProps {
  compact?: boolean;
  account?: boolean;
}

export function Brand({ compact = false, account = false }: BrandProps) {
  return (
    <Link
      className="brand"
      href={
        account
          ? "https://account.progmasoft.com/"
          : "https://www.progmasoft.com/"
      }
    >
      <span className="brand-mark" aria-hidden="true">
        P
      </span>
      <span className="brand-copy">
        <strong>Progmasoft</strong>
        {!compact && <small>{account ? "Account" : "Developer systems"}</small>}
      </span>
    </Link>
  );
}
