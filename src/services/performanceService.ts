// src/services/performanceService.ts
// Performance Monitoring and Analytics Service
// Tracks app performance, user behavior, and error reporting

import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserEvent {
  event: string;
  timestamp: number;
  properties?: Record<string, any>;
  userId?: string;
}

export interface ErrorReport {
  error: string;
  stack?: string;
  timestamp: number;
  userId?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AppMetrics {
  sessionDuration: number;
  generationsCompleted: number;
  generationsFailed: number;
  averageGenerationTime: number;
  cacheHitRate: number;
  errorCount: number;
  lastSessionEnd: number;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetric[] = [];
  private events: UserEvent[] = [];
  private errors: ErrorReport[] = [];
  private sessionStartTime: number;
  private isEnabled: boolean;

  private constructor() {
    this.sessionStartTime = Date.now();
    this.isEnabled = config.ENABLE_PUSH_NOTIFICATIONS; // Use same flag for now
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    try {
      if (!this.isEnabled) {
        console.log('📊 [Performance] Monitoring disabled');
        return;
      }

      console.log('📊 [Performance] Initializing performance monitoring...');
      
      // Load existing data
      await this.loadStoredData();
      
      // Start session tracking
      this.startSession();
      
      console.log('✅ [Performance] Performance monitoring initialized');
    } catch (error) {
      console.error('❌ [Performance] Failed to initialize:', error);
    }
  }

  /**
   * Track performance metric
   */
  trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    console.log(`📊 [Performance] Metric tracked: ${name} = ${value}`);
  }

  /**
   * Track user event
   */
  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const userEvent: UserEvent = {
      event,
      timestamp: Date.now(),
      properties,
    };

    this.events.push(userEvent);
    
    // Keep only last 500 events
    if (this.events.length > 500) {
      this.events = this.events.slice(-500);
    }

    console.log(`📊 [Performance] Event tracked: ${event}`, properties);
  }

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      context,
      severity,
    };

    this.errors.push(errorReport);
    
    // Keep only last 200 errors
    if (this.errors.length > 200) {
      this.errors = this.errors.slice(-200);
    }

    console.log(`📊 [Performance] Error tracked: ${errorReport.error}`, { severity, context });

    // Send critical errors immediately
    if (severity === 'critical') {
      this.sendErrorReport(errorReport);
    }
  }

  /**
   * Track generation performance
   */
  trackGeneration(mode: string, duration: number, success: boolean, error?: string): void {
    this.trackMetric('generation_duration', duration, { mode, success });
    this.trackEvent(success ? 'generation_completed' : 'generation_failed', { 
      mode, 
      duration, 
      error 
    });

    if (!success && error) {
      this.trackError(error, { mode, duration }, 'high');
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, success: boolean, statusCode?: number): void {
    this.trackMetric('api_call_duration', duration, { endpoint, success, statusCode });
    this.trackEvent('api_call', { endpoint, duration, success, statusCode });
  }

  /**
   * Track cache performance
   */
  trackCacheHit(key: string, hit: boolean): void {
    this.trackMetric('cache_hit', hit ? 1 : 0, { key });
    this.trackEvent(hit ? 'cache_hit' : 'cache_miss', { key });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, screen: string, properties?: Record<string, any>): void {
    this.trackEvent('user_interaction', {
      action,
      screen,
      ...properties,
    });
  }

  /**
   * Get app metrics
   */
  async getAppMetrics(): Promise<AppMetrics> {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    const generationsCompleted = this.events.filter(e => e.event === 'generation_completed').length;
    const generationsFailed = this.events.filter(e => e.event === 'generation_failed').length;
    
    const generationDurations = this.metrics
      .filter(m => m.name === 'generation_duration' && m.metadata?.success)
      .map(m => m.value);
    
    const averageGenerationTime = generationDurations.length > 0 
      ? generationDurations.reduce((a, b) => a + b, 0) / generationDurations.length 
      : 0;

    const cacheHits = this.metrics.filter(m => m.name === 'cache_hit' && m.value === 1).length;
    const cacheTotal = this.metrics.filter(m => m.name === 'cache_hit').length;
    const cacheHitRate = cacheTotal > 0 ? cacheHits / cacheTotal : 0;

    return {
      sessionDuration,
      generationsCompleted,
      generationsFailed,
      averageGenerationTime,
      cacheHitRate,
      errorCount: this.errors.length,
      lastSessionEnd: Date.now(),
    };
  }

  /**
   * Send performance data to backend
   */
  async sendPerformanceData(): Promise<void> {
    try {
      if (!this.isEnabled) return;

      const metrics = await this.getAppMetrics();
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        console.log('⚠️ [Performance] No auth token, skipping data send');
        return;
      }

      const payload = {
        metrics,
        recentEvents: this.events.slice(-50), // Send last 50 events
        recentErrors: this.errors.slice(-20), // Send last 20 errors
        timestamp: Date.now(),
      };

      const response = await fetch(config.apiUrl('analytics'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ [Performance] Performance data sent successfully');
        // Clear sent data
        this.events = this.events.slice(-10); // Keep last 10 events
        this.errors = this.errors.slice(-5); // Keep last 5 errors
      } else {
        console.warn('⚠️ [Performance] Failed to send performance data:', response.status);
      }

    } catch (error) {
      console.error('❌ [Performance] Failed to send performance data:', error);
    }
  }

  /**
   * Send error report immediately
   */
  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        console.log('⚠️ [Performance] No auth token, skipping error report');
        return;
      }

      await fetch(config.apiUrl('error-report'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      console.log('✅ [Performance] Critical error report sent');

    } catch (error) {
      console.error('❌ [Performance] Failed to send error report:', error);
    }
  }

  /**
   * Start new session
   */
  private startSession(): void {
    this.sessionStartTime = Date.now();
    this.trackEvent('session_start', {
      timestamp: this.sessionStartTime,
    });
  }

  /**
   * End current session
   */
  endSession(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.trackEvent('session_end', {
      duration: sessionDuration,
    });
    
    // Send performance data at session end
    this.sendPerformanceData();
  }

  /**
   * Load stored data from AsyncStorage
   */
  private async loadStoredData(): Promise<void> {
    try {
      const [metricsData, eventsData, errorsData] = await Promise.all([
        AsyncStorage.getItem('performance_metrics'),
        AsyncStorage.getItem('performance_events'),
        AsyncStorage.getItem('performance_errors'),
      ]);

      if (metricsData) {
        this.metrics = JSON.parse(metricsData);
      }
      if (eventsData) {
        this.events = JSON.parse(eventsData);
      }
      if (errorsData) {
        this.errors = JSON.parse(errorsData);
      }

    } catch (error) {
      console.error('❌ [Performance] Failed to load stored data:', error);
    }
  }

  /**
   * Save data to AsyncStorage
   */
  async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('performance_metrics', JSON.stringify(this.metrics)),
        AsyncStorage.setItem('performance_events', JSON.stringify(this.events)),
        AsyncStorage.setItem('performance_errors', JSON.stringify(this.errors)),
      ]);
    } catch (error) {
      console.error('❌ [Performance] Failed to save data:', error);
    }
  }

  /**
   * Clear all data
   */
  async clearData(): Promise<void> {
    this.metrics = [];
    this.events = [];
    this.errors = [];
    
    await Promise.all([
      AsyncStorage.removeItem('performance_metrics'),
      AsyncStorage.removeItem('performance_events'),
      AsyncStorage.removeItem('performance_errors'),
    ]);
    
    console.log('🧹 [Performance] All performance data cleared');
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): string {
    const metrics = this.metrics.length;
    const events = this.events.length;
    const errors = this.errors.length;
    const sessionDuration = Math.round((Date.now() - this.sessionStartTime) / 1000);
    
    return `Session: ${sessionDuration}s | Metrics: ${metrics} | Events: ${events} | Errors: ${errors}`;
  }
}

export default PerformanceService;
