/**
 * pewpi-shared Auth Service
 * Handles authentication and user session management
 */

class AuthService {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.currentUser = null;
    this.listeners = new Set();
    this.sessionKey = 'pewpi_user';
  }

  /**
   * Initialize the auth service
   */
  async initialize() {
    try {
      if (this.storage) {
        const userData = this.storage.getItem(this.sessionKey);
        if (userData) {
          this.currentUser = typeof userData === 'string' ? { handle: userData } : JSON.parse(userData);
        }
      }
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('AuthService initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign in user
   */
  async signIn(credentials) {
    try {
      const user = {
        handle: credentials.handle || credentials.username,
        timestamp: new Date().toISOString(),
        ...credentials
      };
      
      this.currentUser = user;
      
      if (this.storage) {
        this.storage.setItem(this.sessionKey, typeof user === 'object' ? JSON.stringify(user) : user.handle);
      }
      
      this._notifyListeners('auth_signin', user);
      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const previousUser = this.currentUser;
      this.currentUser = null;
      
      if (this.storage) {
        this.storage.removeItem(this.sessionKey);
      }
      
      this._notifyListeners('auth_signout', previousUser);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    return { success: true, user: this.currentUser };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Subscribe to auth events
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Private: Notify all listeners
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}

if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}
