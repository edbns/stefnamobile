// src/services/generationPollingService.ts
// Real-time generation polling service - connects to actual API like website

export interface GenerationPollingStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedTime?: number;
  imageUrl?: string;
  error?: string;
  jobId?: string;
  runId?: string;
}

export interface GenerationPollingOptions {
  onProgress?: (status: GenerationPollingStatus) => void;
  onComplete?: (result: GenerationPollingStatus) => void;
  onError?: (error: Error) => void;
  maxAttempts?: number;
  pollInterval?: number;
}

class GenerationPollingService {
  private static instance: GenerationPollingService;
  private activePolls: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): GenerationPollingService {
    if (!GenerationPollingService.instance) {
      GenerationPollingService.instance = new GenerationPollingService();
    }
    return GenerationPollingService.instance;
  }

  /**
   * Start polling for generation completion
   * Uses the same API endpoints as the website
   */
  async startPolling(
    jobId: string,
    runId: string,
    options: GenerationPollingOptions = {}
  ): Promise<void> {
    const {
      onProgress,
      onComplete,
      onError,
      maxAttempts = 30,
      pollInterval = 2000
    } = options;

    let attempts = 0;
    let estimatedTime = 45; // Start with 45 seconds

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`🔍 [GenerationPolling] Poll attempt ${attempts}/${maxAttempts} for job ${jobId}`);

        // Poll the same endpoint as the website
        const { config } = await import('../config/environment');
        const response = await fetch(config.apiUrl(`getMediaByRunId?runId=${encodeURIComponent(runId)}`), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          // Handle 404 as "not ready yet" instead of error
          if (response.status === 404) {
            console.log('📊 [GenerationPolling] Media not found yet (404), continuing to poll...');
            const timeElapsed = attempts * (pollInterval / 1000);
            const progress = Math.min((timeElapsed / estimatedTime) * 100, 95);
            
            let message = 'Getting it ready';
            if (progress < 20) message = 'Getting it ready';
            else if (progress < 50) message = 'Processing your image';
            else if (progress < 80) message = 'Adding artistic touches';
            else message = 'Finalizing your creation';

            const pollingStatus: GenerationPollingStatus = {
              status: 'processing',
              progress: Math.round(progress),
              message,
              estimatedTime: Math.max(estimatedTime - (attempts * 2), 0),
              jobId,
              runId
            };

            if (onProgress) {
              onProgress(pollingStatus);
            }

            // Continue polling if under max attempts
            if (attempts < maxAttempts) {
              const timeoutId = setTimeout(poll, pollInterval);
              this.activePolls.set(jobId, timeoutId);
            } else {
              const error = new Error('Edit timeout - please try again');
              if (onError) {
                onError(error);
              }
              this.stopPolling(jobId);
            }
            return;
          }
          
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 [GenerationPolling] Status response:', data);

        // Calculate progress based on status
        let progress = 0;
        let message = 'Getting it ready';
        let status: 'processing' | 'completed' | 'failed' = 'processing';

        if (data.success && data.media && data.media.url) {
          progress = 100;
          message = 'Complete!';
          status = 'completed';
          
          // Normalize shape to shared interface
          data.status = 'completed';
          data.image_url = data.media.url;
        } else if (data.status === 'failed') {
          progress = 0;
          message = 'Edit failed';
          status = 'failed';
        } else if (data.status === 'processing' || data.status === 'pending') {
          // Simulate progress based on time elapsed
          const timeElapsed = attempts * (pollInterval / 1000);
          progress = Math.min((timeElapsed / estimatedTime) * 100, 95);
          
          if (progress < 20) message = 'Getting it ready';
          else if (progress < 50) message = 'Processing your image';
          else if (progress < 80) message = 'Adding artistic touches';
          else message = 'Finalizing your creation';
        }

        // Update estimated time based on progress
        if (progress > 0 && progress < 100) {
          const timeElapsed = attempts * (pollInterval / 1000);
          estimatedTime = Math.max(Math.round((timeElapsed / progress) * 100), 10);
        }

        const pollingStatus: GenerationPollingStatus = {
          status,
          progress: Math.round(progress),
          message,
          estimatedTime: Math.max(estimatedTime - (attempts * 2), 0),
          imageUrl: data.image_url,
          error: data.error,
          jobId,
          runId
        };

        // Call progress callback
        if (onProgress) {
          onProgress(pollingStatus);
        }

        // Handle completion
        if (status === 'completed') {
          if (onComplete) {
            onComplete(pollingStatus);
          }
          this.stopPolling(jobId);
          return;
        }

        // Handle failure
        if (status === 'failed') {
          const error = new Error(data.error || 'Edit failed');
          if (onError) {
            onError(error);
          }
          this.stopPolling(jobId);
          return;
        }

        // Continue polling if not complete and under max attempts
        if (attempts < maxAttempts) {
          const timeoutId = setTimeout(poll, pollInterval);
          this.activePolls.set(jobId, timeoutId);
        } else {
          // Max attempts reached
          const error = new Error('Edit timeout - please try again');
          if (onError) {
            onError(error);
          }
          this.stopPolling(jobId);
        }

      } catch (error) {
        console.error('❌ [GenerationPolling] Poll error:', error);
        
        // Convert technical errors to user-friendly messages
        let userMessage = 'Failed to check edit status. Please try again.';
        if (error instanceof Error) {
          if (error.message.includes('HTTP 404')) {
            userMessage = 'Edit service is not available. Please try again later.';
          } else if (error.message.includes('HTTP 500')) {
            userMessage = 'Server error occurred. Please try again later.';
          } else if (error.message.includes('fetch')) {
            userMessage = 'Unable to connect to edit service. Please check your connection.';
          }
        }
        
        const userError = new Error(userMessage);
        if (onError) {
          onError(userError);
        }
        this.stopPolling(jobId);
      }
    };

    // Start polling
    poll();
  }

  /**
   * Stop polling for a specific job
   */
  stopPolling(jobId: string): void {
    const timeoutId = this.activePolls.get(jobId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activePolls.delete(jobId);
      console.log(`🛑 [GenerationPolling] Stopped polling for job ${jobId}`);
    }
  }

  /**
   * Stop all active polls
   */
  stopAllPolling(): void {
    this.activePolls.forEach((timeoutId, jobId) => {
      clearTimeout(timeoutId);
      console.log(`🛑 [GenerationPolling] Stopped polling for job ${jobId}`);
    });
    this.activePolls.clear();
  }

  /**
   * Get active poll count
   */
  getActivePollCount(): number {
    return this.activePolls.size;
  }
}

export default GenerationPollingService;
