declare module 'next/navigation' {
  export interface AppRouterInstance {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward?: () => void;
    refresh?: () => void;
    prefetch?: (href: string) => Promise<void>;
  }

  export function useRouter(): AppRouterInstance;
}
