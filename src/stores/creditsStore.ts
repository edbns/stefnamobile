// Credits Store - Manages credit reservation, finalization, and balance
// Uses creditsService internally for HTTP calls

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { creditsService, CreditReservationResponse, CreditFinalizationResponse } from '../services/creditsService';
import { creditsUtils } from '../services/creditsService';

interface CreditTransaction {
  id: string;
  action: string;
  cost: number;
  status: 'reserved' | 'committed' | 'refunded' | 'failed';
  createdAt: Date;
}

interface CreditsState {
  // Current balance
  balance: number;
  dailyCap: number;

  // Transaction tracking
  currentTransaction: CreditTransaction | null;
  transactionHistory: CreditTransaction[];

  // Loading states
  isReserving: boolean;
  isFinalizing: boolean;
  isLoading: boolean;

  // Error handling
  error: string | null;

  // Actions
  initializeFromCache: () => Promise<void>;
  reserveCredits: (cost: number, action: string) => Promise<boolean>;
  finalizeCredits: (disposition: 'commit' | 'refund') => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
  reset: () => void;

  // Utility
  hasEnoughCredits: (cost: number) => boolean;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  balance: 0,
  dailyCap: 30,

  currentTransaction: null,
  transactionHistory: [],

  isReserving: false,
  isFinalizing: false,
  isLoading: false,

  error: null,

  // Initialize credits from cache on store creation
  initializeFromCache: async () => {
    try {
      console.log('🔄 Initializing credits from cache...');
      const cachedUser = await AsyncStorage.getItem('user_profile');
      console.log('📱 Cached user data:', cachedUser);
      
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        console.log('📱 Parsed user:', user);
        
        if (user.credits !== undefined && user.credits !== null) {
          set({ balance: user.credits });
          console.log('📱 Initialized credits from cache:', user.credits);
        } else {
          console.log('❌ No credits found in cached user:', user);
        }
      } else {
        console.log('❌ No cached user found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize credits from cache:', error);
    }
  },

  reserveCredits: async (cost: number, action: string): Promise<boolean> => {
    try {
      set({ isReserving: true, error: null });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const requestId = creditsUtils.generateRequestId();

      const response: CreditReservationResponse = await creditsService.reserveCredits(token, {
        cost,
        action,
        request_id: requestId,
      });

      if (response.ok) {
        const transaction: CreditTransaction = {
          id: response.request_id,
          action: response.action,
          cost: response.cost,
          status: 'reserved',
          createdAt: new Date(),
        };

        set({
          currentTransaction: transaction,
          balance: response.balance,
          isReserving: false
        });

        // Add to history
        const { transactionHistory } = get();
        set({ transactionHistory: [transaction, ...transactionHistory] });

        return true;
      } else {
        set({
          error: response.error || 'Failed to reserve credits',
          isReserving: false
        });
        return false;
      }
    } catch (error) {
      console.error('Reserve credits error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to reserve credits',
        isReserving: false
      });
      return false;
    }
  },

  finalizeCredits: async (disposition: 'commit' | 'refund'): Promise<boolean> => {
    try {
      set({ isFinalizing: true, error: null });

      const { currentTransaction } = get();
      if (!currentTransaction) {
        throw new Error('No active credit reservation');
      }

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response: CreditFinalizationResponse = await creditsService.finalizeCredits(token, {
        request_id: currentTransaction.id,
        disposition,
      });

      if (response.ok) {
        // Update transaction status
        const updatedTransaction: CreditTransaction = {
          ...currentTransaction,
          status: disposition === 'commit' ? 'committed' : 'refunded',
        };

        // Update balance if committed
        let newBalance = get().balance;
        if (disposition === 'commit' && response.newCredits !== undefined) {
          newBalance = response.newCredits;
        }

        // Update transaction in history
        const { transactionHistory } = get();
        const updatedHistory = transactionHistory.map(tx =>
          tx.id === currentTransaction.id ? updatedTransaction : tx
        );

        set({
          currentTransaction: null,
          balance: newBalance,
          transactionHistory: updatedHistory,
          isFinalizing: false
        });

        return true;
      } else {
        set({
          error: response.error || 'Failed to finalize credits',
          isFinalizing: false
        });
        return false;
      }
    } catch (error) {
      console.error('Finalize credits error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to finalize credits',
        isFinalizing: false
      });
      return false;
    }
  },

  refreshBalance: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        set({ error: 'Not authenticated', isLoading: false });
        return;
      }

      // Bypass API calls for test accounts
      if (token.startsWith('test-token-')) {
        console.log('🧪 [Test Account] Bypassing API calls for test account');
        const cachedUser = await AsyncStorage.getItem('user_profile');
        if (cachedUser) {
          try {
            const user = JSON.parse(cachedUser);
            if (user.credits !== undefined && user.credits !== null) {
              set({ balance: user.credits, error: null });
              console.log('📱 [Test Account] Credits loaded from cache:', user.credits);
            }
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }
        return;
      }

      // Show cached credits immediately if we don't have a balance yet
      const currentBalance = get().balance;
      if (currentBalance === 0) {
        const cachedUser = await AsyncStorage.getItem('user_profile');
        if (cachedUser) {
          try {
            const user = JSON.parse(cachedUser);
            if (user.credits !== undefined && user.credits !== null) {
              // Show cached credits immediately as fallback
              set({ balance: user.credits, error: null });
              console.log('📱 Showing cached credits as fallback:', user.credits);
            }
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }
      }

      // Fetch fresh data in background (silently)
      console.log('🔄 Fetching fresh credit balance...');
      const { userService } = await import('../services/userService');
      
      try {
        const profileResponse = await userService.fetchUserProfile(token);
        console.log('📱 Profile response:', JSON.stringify(profileResponse, null, 2));
        
        if (profileResponse.ok && profileResponse.credits) {
          const newBalance = profileResponse.credits.balance;
          const currentBalance = get().balance;
          
          console.log(`📱 Credits data: balance=${newBalance}, dailyCap=${profileResponse.daily_cap}`);
          
          // Always update the balance to reflect the real-time data
          set({
            balance: newBalance,
            dailyCap: profileResponse.daily_cap || 30,
            error: null
          });
          
          if (newBalance !== currentBalance) {
            console.log(`✅ Credits updated: ${currentBalance} → ${newBalance}`);
          } else {
            console.log(`📱 Credits confirmed: ${newBalance} (no change)`);
          }
          
          // Always update cached user credits
          const cachedUser = await AsyncStorage.getItem('user_profile');
          if (cachedUser) {
            try {
              const user = JSON.parse(cachedUser);
              user.credits = newBalance;
              await AsyncStorage.setItem('user_profile', JSON.stringify(user));
              console.log('📱 Updated cached user credits:', newBalance);
            } catch (e) {
              console.error('Failed to update cached credits:', e);
            }
          }
        } else {
          console.error('❌ Invalid profile response:', {
            ok: profileResponse.ok,
            hasCredits: !!profileResponse.credits,
            credits: profileResponse.credits
          });
        }
      } catch (error) {
        // Enhanced error logging for debugging
        console.error('❌ Background credit refresh error:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Don't set error state if we have cached balance
        if (get().balance === 0) {
          set({ error: 'Failed to load credits' });
        }
      }
    } catch (error) {
      console.error('Critical refresh balance error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh balance',
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    balance: 0,
    dailyCap: 30,
    currentTransaction: null,
    transactionHistory: [],
    isReserving: false,
    isFinalizing: false,
    isLoading: false,
    error: null,
  }),

  hasEnoughCredits: (cost: number) => {
    const { balance } = get();
    return balance >= cost;
  },
}));
