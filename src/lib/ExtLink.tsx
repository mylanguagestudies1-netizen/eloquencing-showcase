import type { AnchorHTMLAttributes, MouseEventHandler } from 'react';

// Tool links point back to the main Eloquencing app, not to this standalone site.
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://eloquencing.up.railway.app').replace(/\/$/, '');

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; onClick?: MouseEventHandler<HTMLAnchorElement> };

export default function ExtLink({ href, ...rest }: Props) {
  const url = href.startsWith('/') ? APP_URL + href : href;
  return <a href={url} {...rest} />;
}
