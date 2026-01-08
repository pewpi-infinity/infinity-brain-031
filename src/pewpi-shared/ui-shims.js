/**
 * pewpi-shared UI Shims
 * UI helper functions for integrating pewpi services
 */

const UIShims = {
  /**
   * Create a status indicator element
   */
  createStatusIndicator(initialState = 'idle') {
    const indicator = document.createElement('div');
    indicator.className = 'pewpi-status-indicator';
    indicator.setAttribute('data-state', initialState);
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
    `;
    indicator.textContent = `🐶 pewpi: ${initialState}`;
    return indicator;
  },

  /**
   * Update status indicator
   */
  updateStatus(indicator, state, message) {
    if (indicator) {
      indicator.setAttribute('data-state', state);
      indicator.textContent = message || `🐶 pewpi: ${state}`;
    }
  },

  /**
   * Create auth gate UI
   */
  createAuthGate(onAuth) {
    const gate = document.createElement('div');
    gate.id = 'pewpi-auth-gate';
    gate.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(14, 14, 14, 0.95);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: system-ui, sans-serif;
    `;

    gate.innerHTML = `
      <h1 style="font-size: 3em; margin-bottom: 20px;">🐶 pewpi</h1>
      <input 
        id="pewpi-auth-input" 
        placeholder="Handle" 
        style="padding: 10px 15px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; font-size: 16px;"
      />
      <button 
        id="pewpi-auth-button"
        style="padding: 10px 25px; background: #ff69b4; color: white; border: 0; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 16px;"
      >
        Enter
      </button>
    `;

    const input = gate.querySelector('#pewpi-auth-input');
    const button = gate.querySelector('#pewpi-auth-button');

    const handleAuth = () => {
      const handle = input.value.trim();
      if (handle && onAuth) {
        onAuth(handle);
      }
    };

    button.addEventListener('click', handleAuth);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAuth();
    });

    return gate;
  },

  /**
   * Remove auth gate
   */
  removeAuthGate() {
    const gate = document.getElementById('pewpi-auth-gate');
    if (gate) {
      gate.remove();
    }
  },

  /**
   * Create wallet display
   */
  createWalletDisplay(balance = 0) {
    const display = document.createElement('div');
    display.className = 'pewpi-wallet-display';
    display.style.cssText = `
      padding: 15px 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      font-family: monospace;
      display: inline-block;
      margin: 10px;
    `;
    display.innerHTML = `
      <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Wallet Balance</div>
      <div style="font-size: 24px; font-weight: bold;">$${balance.toFixed(2)}</div>
    `;
    return display;
  },

  /**
   * Update wallet display
   */
  updateWalletDisplay(display, balance) {
    if (display) {
      const balanceEl = display.querySelector('div:last-child');
      if (balanceEl) {
        balanceEl.textContent = `$${balance.toFixed(2)}`;
      }
    }
  },

  /**
   * Create token display card
   */
  createTokenCard(token) {
    const card = document.createElement('div');
    card.className = 'pewpi-token-card';
    card.style.cssText = `
      padding: 15px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      font-family: monospace;
      margin: 10px;
      min-width: 200px;
    `;
    card.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px;">${token.type || '🧱🍄⭐'}</div>
      <div style="font-size: 14px; opacity: 0.8;">Value: $${token.value}</div>
      <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">ID: ${token.id}</div>
    `;
    return card;
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'pewpi-notification';
    
    const bgColor = {
      info: 'rgba(59, 130, 246, 0.9)',
      success: 'rgba(34, 197, 94, 0.9)',
      warning: 'rgba(251, 146, 60, 0.9)',
      error: 'rgba(239, 68, 68, 0.9)'
    }[type] || 'rgba(0, 0, 0, 0.9)';

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${bgColor};
      color: white;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      z-index: 10001;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);

    return notification;
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIShims;
}

if (typeof window !== 'undefined') {
  window.UIShims = UIShims;
}
