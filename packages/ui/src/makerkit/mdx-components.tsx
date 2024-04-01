import { forwardRef } from 'react';

import Image from 'next/image';

import { cn } from '../utils';
import { LazyRender } from './lazy-render';

const NextImage: React.FC<{
  width: number;
  height: number;
  src: string;
  alt: string;
  class?: string;
}> = (props) => {
  const className = cn(props.class, `object-cover`);

  return <Image className={className} src={props.src} alt={props.alt} />;
};

const ExternalLink = forwardRef<
  React.ElementRef<'a'>,
  React.AnchorHTMLAttributes<unknown>
>(function ExternalLink(props, ref) {
  const href = props.href ?? '';
  const isRoot = href === '/';

  const isInternalLink =
    isRoot || href.startsWith(process.env.NEXT_PUBLIC_SITE_URL!);

  if (isInternalLink) {
    return (
      <a {...props} ref={ref} href={href}>
        {props.children}
      </a>
    );
  }

  return (
    <a
      href={href}
      ref={ref}
      {...props}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
});

const Video: React.FC<{
  src: string;
  width?: string;
  type?: string;
}> = ({ src, type, width }) => {
  const useType = type ?? 'video/mp4';

  return (
    <LazyRender rootMargin={'-200px 0px'}>
      <video
        className="my-4"
        width={width ?? `100%`}
        height="auto"
        playsInline
        autoPlay
        muted
        loop
      >
        <source src={src} type={useType} />
      </video>
    </LazyRender>
  );
};

export const MDXComponents = {
  img: NextImage,
  a: ExternalLink,
  Video,
  Image: NextImage,
};
