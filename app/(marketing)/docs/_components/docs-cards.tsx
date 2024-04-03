import { Cms } from '@kit/cms';

import { DocsCard } from './docs-card';

export function DocsCards({ cards }: { cards: Cms.ContentItem[] }) {
  return (
    <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
      {cards.map((item) => {
        return (
          <DocsCard
            key={item.title}
            title={item.title}
            subtitle={item.description}
            link={{
              url: `/docs/${item.slug}`,
              label: 'Read more',
            }}
          />
        );
      })}
    </div>
  );
}
