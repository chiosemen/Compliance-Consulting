'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

/**
 * Lazy-loaded Framer Motion components for better bundle splitting
 * This reduces the initial bundle size by loading motion components only when needed
 */

// Dynamically import AnimatePresence with no SSR
export const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false }
);

// Create a factory function for motion components
function createLazyMotion<T extends keyof JSX.IntrinsicElements>(tag: T) {
  return dynamic(
    () =>
      import('framer-motion').then((mod) => {
        const Component = (props: ComponentProps<typeof mod.motion[T]>) =>
          mod.motion[tag](props);
        return Component;
      }),
    { ssr: false }
  ) as any;
}

// Export commonly used motion components
export const motion = {
  div: createLazyMotion('div'),
  header: createLazyMotion('header'),
  h1: createLazyMotion('h1'),
  h2: createLazyMotion('h2'),
  h3: createLazyMotion('h3'),
  p: createLazyMotion('p'),
  span: createLazyMotion('span'),
  button: createLazyMotion('button'),
  input: createLazyMotion('input'),
  nav: createLazyMotion('nav'),
  section: createLazyMotion('section'),
  article: createLazyMotion('article'),
  ul: createLazyMotion('ul'),
  li: createLazyMotion('li'),
  a: createLazyMotion('a'),
  img: createLazyMotion('img'),
} as const;

/**
 * Alternative approach using LazyMotion for even smaller bundle size
 * Use this wrapper in your app layout for optimal performance
 */
export const LazyMotionProvider = dynamic(
  () =>
    import('framer-motion').then((mod) => {
      const { LazyMotion, domAnimation } = mod;
      return function Provider({ children }: { children: React.ReactNode }) {
        return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
      };
    }),
  { ssr: false }
);
