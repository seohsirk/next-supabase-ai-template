import type { DocumentationPage } from 'contentlayer/generated';

import { DocsCard } from './docs-card';

export function DocsCards({ pages }: { pages: DocumentationPage[] }) {
  return (
    <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
      {pages.map((item) => {
        return (
          <DocsCard
            key={item.label}
            label={item.label}
            subtitle={item.description}
            link={{
              url: item.resolvedPath,
              label: item.cardCTA ?? 'Read more',
            }}
          />
        );
      })}
    </div>
  );
}
