import Link from "next/link";

interface BrandProps {
  account?: boolean;
}

export function Brand({ account = false }: BrandProps) {
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
        <span className="brand-tile brand-tile-slate" />
        <span className="brand-tile brand-tile-teal" />
        <span className="brand-tile brand-tile-violet" />
        <span className="brand-tile brand-tile-orange" />
      </span>
      <strong className="brand-name">Progmasoft</strong>
      {account && <span className="brand-product">Account</span>}
    </Link>
  );
}
