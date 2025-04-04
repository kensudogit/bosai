declare module 'react-linkify' {
  import { ComponentType, ReactNode } from 'react';

  interface LinkifyProps {
    children: ReactNode;
    componentDecorator?: (href: string, text: string, key: number) => ReactNode;
  }

  const Linkify: ComponentType<LinkifyProps>;
  export default Linkify;
} 