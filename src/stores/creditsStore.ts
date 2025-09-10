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

      // Try to get cached credits first for INSTANT display
      const cachedUser = await AsyncStorage.getItem('user_profile');
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          if (user.credits !== undefined && user.credits !== null) {
            // Show cached credits immediately WITHOUT setting loading
            set({ balance: user.credits, error: null });
            console.log('📱 Showing cached credits instantly:', user.credits);
          }
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }
      }

      // Fetch fresh data in background
      console.log('🔄 Fetching fresh credit balance...');
      const { userService } = await import('../services/userService');
      
      try {
        const profileResponse = await userService.fetchUserProfile(token);
        
        if (profileResponse.ok && profileResponse.credits) {
          const newBalance = profileResponse.credits.balance;
          const currentBalance = get().balance;
          
          // Update balance and cache
          set({
            balance: newBalance,
            dailyCap: profileResponse.daily_cap || 30,
            error: null
          });
          
          // Update cached user credits
          if (cachedUser) {
            try {
              const user = JSON.parse(cachedUser);
              user.credits = newBalance;
              await AsyncStorage.setItem('user_profile', JSON.stringify(user));
            } catch (e) {
              console.error('Failed to update cached credits:', e);
            }
          }
          
          console.log(`✅ Credits updated: ${currentBalance} → ${newBalance}`);
        }
      } catch (error) {
        // Silently fail for background refresh - we already showed cached
        console.error('Background credit refresh error:', error);
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
