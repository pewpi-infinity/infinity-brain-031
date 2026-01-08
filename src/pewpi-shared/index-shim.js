/**
 * pewpi-shared Index Shim / Loader
 * Safe, defensive initialization of pewpi-shared modules
 */

(function(global) {
  'use strict';

  // Defensive initialization wrapper
  const PewpiShared = {
    version: '1.0.0',
    initialized: false,
    services: {},
    
    /**
     * Safe module loader
     */
    loadModule: function(name, factory) {
      try {
        this.services[name] = factory();
        return true;
      } catch (error) {
        console.error(`Failed to load module ${name}:`, error);
        return false;
      }
    },

    /**
     * Initialize all services with error handling
     */
    initialize: async function(options = {}) {
      if (this.initialized) {
        console.warn('PewpiShared already initialized');
        return { success: true, message: 'Already initialized' };
      }

      const results = {
        success: true,
        services: {},
        errors: []
      };

      try {
        // Create service instances
        const authService = new (global.AuthService || function(){})();
        const tokenService = new (global.TokenService || function(){})();
        const walletService = new (global.WalletUnified || function(){})({ tokenService });
        const integrationListener = new (global.IntegrationListener || function(){})({
          authService,
          tokenService,
          walletService
        });
        const machineAdapter = new (global.MachineAdapter || function(){})({
          authService,
          tokenService,
          walletService,
          integrationListener
        });

        // Initialize each service with error handling
        const initServices = [
          { name: 'auth', service: authService },
          { name: 'token', service: tokenService },
          { name: 'wallet', service: walletService },
          { name: 'integration', service: integrationListener },
          { name: 'machine', service: machineAdapter }
        ];

        for (const { name, service } of initServices) {
          try {
            if (service && typeof service.initialize === 'function') {
              const result = await service.initialize();
              results.services[name] = result.success ? 'initialized' : 'failed';
              this.services[name] = service;
            } else {
              results.services[name] = 'not_available';
            }
          } catch (error) {
            console.error(`${name} service initialization error:`, error);
            results.services[name] = 'error';
            results.errors.push({ service: name, error: error.message });
          }
        }

        this.initialized = true;
        
        // Apply UI enhancements if available
        if (options.autoUI !== false && global.UIShims) {
          this.applyUIEnhancements(options.ui);
        }

        return results;
      } catch (error) {
        console.error('PewpiShared initialization error:', error);
        results.success = false;
        results.errors.push({ service: 'general', error: error.message });
        return results;
      }
    },

    /**
     * Apply UI enhancements
     */
    applyUIEnhancements: function(uiOptions = {}) {
      if (!global.UIShims) return;

      try {
        // Add status indicator if requested
        if (uiOptions.statusIndicator !== false) {
          const indicator = global.UIShims.createStatusIndicator('initialized');
          document.body.appendChild(indicator);
          this.statusIndicator = indicator;
        }

        // Add auth gate if user not authenticated
        if (uiOptions.authGate !== false && this.services.auth) {
          const auth = this.services.auth;
          if (!auth.isAuthenticated()) {
            const gate = global.UIShims.createAuthGate(async (handle) => {
              const result = await auth.signIn({ handle });
              if (result.success) {
                global.UIShims.removeAuthGate();
                global.UIShims.showNotification('Signed in successfully', 'success');
              }
            });
            document.body.appendChild(gate);
          }
        }
      } catch (error) {
        console.error('UI enhancement error:', error);
      }
    },

    /**
     * Get a service instance
     */
    getService: function(name) {
      return this.services[name] || null;
    },

    /**
     * Update status indicator
     */
    updateStatus: function(state, message) {
      if (this.statusIndicator && global.UIShims) {
        global.UIShims.updateStatus(this.statusIndicator, state, message);
      }
    }
  };

  // Auto-initialize when DOM is ready if configured
  const autoInit = function() {
    const scripts = document.querySelectorAll('script[src*="index-shim"]');
    const shimScript = scripts[scripts.length - 1];
    
    if (shimScript && shimScript.getAttribute('data-auto-init') !== 'false') {
      const options = {
        autoUI: shimScript.getAttribute('data-auto-ui') !== 'false',
        ui: {
          statusIndicator: shimScript.getAttribute('data-status-indicator') !== 'false',
          authGate: shimScript.getAttribute('data-auth-gate') !== 'false'
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(() => PewpiShared.initialize(options), 100);
        });
      } else {
        setTimeout(() => PewpiShared.initialize(options), 100);
      }
    }
  };

  // Expose to global scope
  global.PewpiShared = PewpiShared;

  // Run auto-init check
  if (typeof document !== 'undefined') {
    autoInit();
  }

})(typeof window !== 'undefined' ? window : global);
