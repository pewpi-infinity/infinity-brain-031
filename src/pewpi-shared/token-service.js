/**
 * pewpi-shared Token Service
 * Manages token operations for the Infinity Brain network
 */

class TokenService {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.tokenCache = new Map();
    this.listeners = new Set();
  }

  /**
   * Initialize the token service
   */
  async initialize() {
    try {
      if (this.storage) {
        const cached = this.storage.getItem('pewpi_tokens');
        if (cached) {
          const tokens = JSON.parse(cached);
          tokens.forEach(token => this.tokenCache.set(token.id, token));
        }
      }
      return { success: true };
    } catch (error) {
      console.error('TokenService initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new token
   */
  async createToken(tokenData) {
    try {
      const token = {
        id: tokenData.id || this._generateId(),
        value: tokenData.value || 0,
        type: tokenData.type || '🧱🍄⭐',
        timestamp: new Date().toISOString(),
        ...tokenData
      };
      
      this.tokenCache.set(token.id, token);
      await this._persistTokens();
      this._notifyListeners('token_created', token);
      
      return { success: true, token };
    } catch (error) {
      console.error('Token creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get token by ID
   */
  async getToken(tokenId) {
    try {
      const token = this.tokenCache.get(tokenId);
      return { success: true, token: token || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all tokens
   */
  async getAllTokens() {
    try {
      const tokens = Array.from(this.tokenCache.values());
      return { success: true, tokens };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update token value
   */
  async updateToken(tokenId, updates) {
    try {
      const token = this.tokenCache.get(tokenId);
      if (!token) {
        return { success: false, error: 'Token not found' };
      }
      
      const updatedToken = { ...token, ...updates };
      this.tokenCache.set(tokenId, updatedToken);
      await this._persistTokens();
      this._notifyListeners('token_updated', updatedToken);
      
      return { success: true, token: updatedToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to token events
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Private: Generate unique ID
   */
  _generateId() {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Private: Persist tokens to storage
   */
  async _persistTokens() {
    if (this.storage) {
      try {
        const tokens = Array.from(this.tokenCache.values());
        this.storage.setItem('pewpi_tokens', JSON.stringify(tokens));
      } catch (error) {
        console.error('Token persistence error:', error);
      }
    }
  }

  /**
   * Private: Notify all listeners
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenService;
}

if (typeof window !== 'undefined') {
  window.TokenService = TokenService;
}
