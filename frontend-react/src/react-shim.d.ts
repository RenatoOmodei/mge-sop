declare module 'react' {
  export type CSSProperties = Record<string, string | number | undefined>;
  export type ReactNode = unknown;
  export type FormEvent<T = Element> = {
    preventDefault(): void;
    currentTarget: T;
    target: EventTarget;
  };
  export type ChangeEvent<T = Element> = {
    currentTarget: T;
    target: T;
  };
  export type SetStateAction<S> = S | ((previous: S) => S);
  export type Dispatch<A> = (value: A) => void;

  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: unknown[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useRef<T = unknown>(initialValue?: T): { current: T };
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export const StrictMode: any;
}

declare module 'react-dom/client' {
  import type { ReactNode } from 'react';

  export function createRoot(container: Element | DocumentFragment): {
    render(children: ReactNode): void;
  };
}

declare module 'plotly.js-dist-min' {
  const Plotly: any;
  export default Plotly;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export const jsx: any;
  export const jsxs: any;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicAttributes {
    key?: string | number;
  }
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
