import type { Metadata } from 'next';
import ShowcaseClient from '@/components/showcase/ShowcaseClient';

export const metadata: Metadata = {
  title: 'Eloquencing — Herramientas',
  description: 'Las herramientas top de Eloquencing en una presentación cinematográfica.',
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
