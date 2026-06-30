'use client';

import { AccountProvider } from '@/lib/account-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      {children}
    </AccountProvider>
  );
}
