import type { Metadata } from 'next';
import Showcase2Client from '@/components/showcase-v2/Showcase2Client';

export const metadata: Metadata = {
  title: 'Eloquencing — Herramientas (v2)',
  description: 'Presentación cinematográfica de las herramientas top de Eloquencing, estilo Morph.',
};

export default function ShowcaseV2Page() {
  return <Showcase2Client />;
}
