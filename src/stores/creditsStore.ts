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
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Try to get cached credits first for faster loading
      const cachedUser = await AsyncStorage.getItem('user_profile');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        if (user.credits !== undefined) {
          // Show cached credits immediately
          set({ balance: user.credits, isLoading: false });
          console.log('📱 Showing cached credits:', user.credits);
        }
      }

      // Then fetch fresh data in background with a short timeout and retry
      console.log('🔄 Fetching fresh credit balance...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const { userService } = await import('../services/userService');
      let profileResponse;
      try {
        profileResponse = await userService.fetchUserProfile(token);
      } catch (e) {
        // One quick retry
        console.log('⏳ Retry fetching credits...');
        profileResponse = await userService.fetchUserProfile(token);
      } finally {
        clearTimeout(timeoutId);
      }

      if (profileResponse.ok) {
        set({
          balance: profileResponse.credits.balance,
          dailyCap: profileResponse.daily_cap,
          isLoading: false
        });
        console.log('✅ Fresh credits loaded:', profileResponse.credits.balance);
      } else {
        // If we had cached data, keep showing it
        const currentBalance = get().balance;
        if (currentBalance > 0) {
          set({ isLoading: false }); // Keep cached data
          console.log('⚠️ API failed but keeping cached credits');
        } else {
          throw new Error('Failed to refresh balance');
        }
      }
    } catch (error) {
      console.error('Refresh balance error:', error);
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
