/**
 * pewpi-shared Machine State Adapter
 * Adapts pewpi services to state machine patterns
 */

class MachineAdapter {
  constructor(options = {}) {
    this.services = {
      auth: options.authService,
      token: options.tokenService,
      wallet: options.walletService,
      integration: options.integrationListener
    };
    this.currentState = 'idle';
    this.stateHistory = [];
    this.transitions = new Map();
    this.maxHistorySize = 100;
  }

  /**
   * Initialize the adapter
   */
  async initialize() {
    try {
      this._defineTransitions();
      this._subscribeToServices();
      await this._transitionTo('initialized');
      
      return { success: true, state: this.currentState };
    } catch (error) {
      console.error('MachineAdapter initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      current: this.currentState,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get state history
   */
  getHistory(limit = 10) {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Execute a transition
   */
  async transition(action, context = {}) {
    try {
      const transitionKey = `${this.currentState}:${action}`;
      const handler = this.transitions.get(transitionKey);

      if (!handler) {
        return { 
          success: false, 
          error: `No transition from ${this.currentState} on ${action}` 
        };
      }

      const result = await handler(context);
      
      if (result.nextState) {
        await this._transitionTo(result.nextState, { action, context });
      }

      return { success: true, state: this.currentState, ...result };
    } catch (error) {
      console.error('Transition error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Private: Define state transitions
   */
  _defineTransitions() {
    // Auth transitions
    this.transitions.set('initialized:signin', async (ctx) => {
      if (!this.services.auth) {
        return { error: 'Auth service not available' };
      }
      const result = await this.services.auth.signIn(ctx);
      return result.success ? { nextState: 'authenticated' } : { error: result.error };
    });

    this.transitions.set('authenticated:signout', async () => {
      if (!this.services.auth) {
        return { error: 'Auth service not available' };
      }
      const result = await this.services.auth.signOut();
      return result.success ? { nextState: 'initialized' } : { error: result.error };
    });

    // Token transitions
    this.transitions.set('authenticated:create_token', async (ctx) => {
      if (!this.services.token) {
        return { error: 'Token service not available' };
      }
      const result = await this.services.token.createToken(ctx);
      return { data: result };
    });

    // Wallet transitions
    this.transitions.set('authenticated:add_funds', async (ctx) => {
      if (!this.services.wallet) {
        return { error: 'Wallet service not available' };
      }
      const result = await this.services.wallet.addFunds(ctx.amount, ctx.metadata);
      return { data: result };
    });

    this.transitions.set('authenticated:purchase_token', async (ctx) => {
      if (!this.services.wallet) {
        return { error: 'Wallet service not available' };
      }
      const result = await this.services.wallet.purchaseToken(ctx.tokenData);
      return { data: result };
    });
  }

  /**
   * Private: Subscribe to service events
   */
  _subscribeToServices() {
    if (this.services.integration) {
      this.services.integration.on('*', async (event) => {
        // Auto-transition based on integration events
        if (event.type === 'auth_signin') {
          await this._transitionTo('authenticated', { trigger: 'integration_event' });
        } else if (event.type === 'auth_signout') {
          await this._transitionTo('initialized', { trigger: 'integration_event' });
        }
      });
    }
  }

  /**
   * Private: Execute state transition
   */
  async _transitionTo(newState, metadata = {}) {
    const previousState = this.currentState;
    this.currentState = newState;

    const historyEntry = {
      from: previousState,
      to: newState,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.stateHistory.push(historyEntry);

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    // Emit integration event if available
    if (this.services.integration) {
      await this.services.integration.emit('state_change', historyEntry);
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MachineAdapter;
}

if (typeof window !== 'undefined') {
  window.MachineAdapter = MachineAdapter;
}
