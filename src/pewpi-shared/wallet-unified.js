/**
 * pewpi-shared Wallet Unified Service
 * Unified wallet interface for token and payment management
 */

class WalletUnified {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.tokenService = options.tokenService;
    this.balance = 0;
    this.transactions = [];
    this.listeners = new Set();
  }

  /**
   * Initialize the wallet
   */
  async initialize() {
    try {
      if (this.storage) {
        const walletData = this.storage.getItem('pewpi_wallet');
        if (walletData) {
          const data = JSON.parse(walletData);
          this.balance = data.balance || 0;
          this.transactions = data.transactions || [];
        }
      }
      return { success: true, balance: this.balance };
    } catch (error) {
      console.error('WalletUnified initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current balance
   */
  async getBalance() {
    return { success: true, balance: this.balance };
  }

  /**
   * Add funds to wallet
   */
  async addFunds(amount, metadata = {}) {
    try {
      if (typeof amount !== 'number' || amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }

      const transaction = {
        id: this._generateId(),
        type: 'credit',
        amount,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      this.balance += amount;
      this.transactions.push(transaction);
      await this._persist();
      this._notifyListeners('funds_added', { transaction, balance: this.balance });

      return { success: true, balance: this.balance, transaction };
    } catch (error) {
      console.error('Add funds error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deduct funds from wallet
   */
  async deductFunds(amount, metadata = {}) {
    try {
      if (typeof amount !== 'number' || amount <= 0) {
        return { success: false, error: 'Invalid amount' };
      }

      if (this.balance < amount) {
        return { success: false, error: 'Insufficient funds' };
      }

      const transaction = {
        id: this._generateId(),
        type: 'debit',
        amount,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      this.balance -= amount;
      this.transactions.push(transaction);
      await this._persist();
      this._notifyListeners('funds_deducted', { transaction, balance: this.balance });

      return { success: true, balance: this.balance, transaction };
    } catch (error) {
      console.error('Deduct funds error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit = 50) {
    try {
      const recent = this.transactions.slice(-limit);
      return { success: true, transactions: recent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Purchase token with wallet funds
   */
  async purchaseToken(tokenData) {
    try {
      if (!this.tokenService) {
        return { success: false, error: 'Token service not configured' };
      }

      const amount = tokenData.value || 0;
      if (this.balance < amount) {
        return { success: false, error: 'Insufficient funds' };
      }

      const deductResult = await this.deductFunds(amount, { 
        purpose: 'token_purchase',
        tokenId: tokenData.id 
      });

      if (!deductResult.success) {
        return deductResult;
      }

      const tokenResult = await this.tokenService.createToken(tokenData);
      
      if (!tokenResult.success) {
        // Rollback if token creation fails
        await this.addFunds(amount, { purpose: 'token_purchase_rollback' });
        return tokenResult;
      }

      return { 
        success: true, 
        token: tokenResult.token,
        balance: this.balance 
      };
    } catch (error) {
      console.error('Purchase token error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to wallet events
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Private: Generate unique ID
   */
  _generateId() {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Private: Persist wallet data
   */
  async _persist() {
    if (this.storage) {
      try {
        const data = {
          balance: this.balance,
          transactions: this.transactions
        };
        this.storage.setItem('pewpi_wallet', JSON.stringify(data));
      } catch (error) {
        console.error('Wallet persistence error:', error);
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
        console.error('Wallet listener error:', error);
      }
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WalletUnified;
}

if (typeof window !== 'undefined') {
  window.WalletUnified = WalletUnified;
}
