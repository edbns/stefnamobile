// Test Account Utility - Quick login for development
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TestUser {
  id: string;
  email: string;
  credits: number;
  loginTime: number;
}

export const TEST_ACCOUNTS = {
  developer: {
    id: 'test-dev-001',
    email: 'dev@stefna.test',
    credits: 1000,
    loginTime: Date.now(),
  },
  user: {
    id: 'test-user-001', 
    email: 'user@stefna.test',
    credits: 50,
    loginTime: Date.now(),
  },
  premium: {
    id: 'test-premium-001',
    email: 'premium@stefna.test', 
    credits: 5000,
    loginTime: Date.now(),
  }
} as const;

export class TestAccountService {
  static async loginAsTestUser(accountType: keyof typeof TEST_ACCOUNTS = 'developer'): Promise<boolean> {
    try {
      const testUser = TEST_ACCOUNTS[accountType];
      const testToken = `test-token-${testUser.id}`;
      
      // Store test auth data
      await AsyncStorage.setItem('auth_token', testToken);
      await AsyncStorage.setItem('user_profile', JSON.stringify(testUser));
      
      console.log(`🧪 [Test Account] Logged in as ${accountType}:`, testUser.email);
      return true;
    } catch (error) {
      console.error('❌ [Test Account] Login failed:', error);
      return false;
    }
  }
  
  static async clearTestSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_profile']);
      console.log('🧪 [Test Account] Test session cleared');
    } catch (error) {
      console.error('❌ [Test Account] Clear failed:', error);
    }
  }
  
  static getTestAccountInfo(accountType: keyof typeof TEST_ACCOUNTS) {
    return TEST_ACCOUNTS[accountType];
  }
}
