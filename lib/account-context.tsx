'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase-browser';

export type SocialAccount = {
  id: string;
  platform: 'instagram' | 'facebook_page';
  account_name: string;
  profile_picture_url: string | null;
};

interface AccountContextType {
  accounts: SocialAccount[];
  activeAccount: SocialAccount | null;
  setActiveAccount: (account: SocialAccount) => void;
  loading: boolean;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<SocialAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // We only fetch instagram accounts for the general view, or we fetch all and group them?
    // Let's fetch all connected accounts. The user can switch between them.
    const { data, error } = await supabase
      .from('social_accounts')
      .select('id, platform, account_name, profile_picture_url')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const typedData = data as SocialAccount[];
      setAccounts(typedData);
      
      // If we don't have an active account but we have accounts, set the first one as active
      if (!activeAccount && typedData.length > 0) {
        setActiveAccount(typedData[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountContext.Provider value={{ accounts, activeAccount, setActiveAccount, loading, refreshAccounts: fetchAccounts }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
