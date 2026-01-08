/**
 * pewpi-shared Integration Listener
 * Event listener and integration coordinator for pewpi services
 */

class IntegrationListener {
  constructor(options = {}) {
    this.services = {
      auth: options.authService,
      token: options.tokenService,
      wallet: options.walletService
    };
    this.eventQueue = [];
    this.listeners = new Map();
    this.isProcessing = false;
  }

  /**
   * Initialize the integration listener
   */
  async initialize() {
    try {
      // Subscribe to all service events
      if (this.services.auth) {
        this.services.auth.subscribe((event, data) => this._handleEvent('auth', event, data));
      }
      if (this.services.token) {
        this.services.token.subscribe((event, data) => this._handleEvent('token', event, data));
      }
      if (this.services.wallet) {
        this.services.wallet.subscribe((event, data) => this._handleEvent('wallet', event, data));
      }

      return { success: true };
    } catch (error) {
      console.error('IntegrationListener initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a listener for specific event types
   */
  on(eventPattern, callback) {
    if (!this.listeners.has(eventPattern)) {
      this.listeners.set(eventPattern, new Set());
    }
    this.listeners.get(eventPattern).add(callback);
    
    return () => {
      const callbacks = this.listeners.get(eventPattern);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Emit a custom integration event
   */
  async emit(eventType, data) {
    try {
      await this._handleEvent('integration', eventType, data);
      return { success: true };
    } catch (error) {
      console.error('Event emit error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get event queue status
   */
  getQueueStatus() {
    return {
      size: this.eventQueue.length,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Private: Handle incoming events
   */
  async _handleEvent(service, eventType, data) {
    const event = {
      id: this._generateId(),
      service,
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    };

    this.eventQueue.push(event);
    await this._processQueue();
  }

  /**
   * Private: Process event queue
   */
  async _processQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        await this._dispatchEvent(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Private: Dispatch event to registered listeners
   */
  async _dispatchEvent(event) {
    const patterns = [
      `${event.service}:${event.type}`,  // auth:signin
      `${event.service}:*`,              // auth:*
      '*'                                 // all events
    ];

    for (const pattern of patterns) {
      const callbacks = this.listeners.get(pattern);
      if (callbacks) {
        for (const callback of callbacks) {
          try {
            await callback(event);
          } catch (error) {
            console.error('Listener callback error:', error);
          }
        }
      }
    }
  }

  /**
   * Private: Generate unique ID
   */
  _generateId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationListener;
}

if (typeof window !== 'undefined') {
  window.IntegrationListener = IntegrationListener;
}
