# pewpi-shared

Unified authentication, wallet, and token management library for the Infinity Brain network.

## Features

- **🔐 Authentication Service**: User sign-in/sign-out and session management
- **🪙 Token Service**: Create, store, and manage tokens
- **💰 Wallet Service**: Unified wallet with transaction history
- **🔗 Integration Listener**: Event coordination across services
- **⚙️ Machine Adapter**: State machine integration pattern
- **🎨 UI Shims**: Ready-to-use UI components

## Installation

### Browser (Direct)

```html
<!-- Load individual services -->
<script src="src/pewpi-shared/auth-service.js"></script>
<script src="src/pewpi-shared/token-service.js"></script>
<script src="src/pewpi-shared/wallet-unified.js"></script>
<script src="src/pewpi-shared/integration-listener.js"></script>
<script src="src/pewpi-shared/machines/adapter.js"></script>
<script src="src/pewpi-shared/ui-shims.js"></script>

<!-- Or use the loader -->
<script src="src/pewpi-shared/index-shim.js"></script>
```

### Node.js/CommonJS

```javascript
const AuthService = require('./src/pewpi-shared/auth-service');
const TokenService = require('./src/pewpi-shared/token-service');
const WalletUnified = require('./src/pewpi-shared/wallet-unified');
```

## Quick Start

```javascript
// 1. Create service instances
const auth = new AuthService();
const tokens = new TokenService();
const wallet = new WalletUnified({ tokenService: tokens });

// 2. Initialize services
await auth.initialize();
await tokens.initialize();
await wallet.initialize();

// 3. Use services
await auth.signIn({ handle: 'myhandle' });
await wallet.addFunds(100);
await tokens.createToken({ value: 29, type: '🧱🍄⭐' });
```

## Core Services

### AuthService

Manages user authentication and sessions:

```javascript
const auth = new AuthService();
await auth.initialize();

// Sign in
await auth.signIn({ handle: 'username' });

// Check status
const isAuth = auth.isAuthenticated();

// Get current user
const { user } = await auth.getCurrentUser();

// Sign out
await auth.signOut();
```

### TokenService

Handles token operations:

```javascript
const tokens = new TokenService();
await tokens.initialize();

// Create token
const result = await tokens.createToken({
  value: 29,
  type: '🧱🍄⭐',
  name: 'Brain Token'
});

// Get all tokens
const { tokens: list } = await tokens.getAllTokens();

// Update token
await tokens.updateToken(tokenId, { value: 35 });
```

### WalletUnified

Manages wallet and transactions:

```javascript
const wallet = new WalletUnified({ tokenService: tokens });
await wallet.initialize();

// Add funds
await wallet.addFunds(100, { source: 'deposit' });

// Get balance
const { balance } = await wallet.getBalance();

// Purchase token
await wallet.purchaseToken({ value: 29, type: '🧱🍄⭐' });

// View transactions
const { transactions } = await wallet.getTransactions(20);
```

## Integration Layer

### IntegrationListener

Coordinates events across services:

```javascript
const integration = new IntegrationListener({
  authService: auth,
  tokenService: tokens,
  walletService: wallet
});
await integration.initialize();

// Listen to specific events
integration.on('auth:signin', (event) => {
  console.log('User logged in:', event.data);
});

// Listen to all events
integration.on('*', (event) => {
  console.log('Event:', event);
});
```

### MachineAdapter

State machine pattern adapter:

```javascript
const machine = new MachineAdapter({
  authService: auth,
  tokenService: tokens,
  walletService: wallet,
  integrationListener: integration
});
await machine.initialize();

// Execute transitions
await machine.transition('signin', { handle: 'user' });
await machine.transition('create_token', { value: 29 });

// Get state
const state = machine.getState();
const history = machine.getHistory(10);
```

## UI Components

### UIShims

Ready-to-use UI helpers:

```javascript
// Auth gate
const gate = UIShims.createAuthGate((handle) => {
  auth.signIn({ handle });
});
document.body.appendChild(gate);

// Status indicator
const status = UIShims.createStatusIndicator('idle');
document.body.appendChild(status);
UIShims.updateStatus(status, 'ready', '🐶 pewpi: online');

// Wallet display
const display = UIShims.createWalletDisplay(100);
document.body.appendChild(display);

// Notifications
UIShims.showNotification('Success!', 'success');
UIShims.showNotification('Error occurred', 'error');
```

## Event System

All services support event subscriptions:

```javascript
// Subscribe to auth events
const unsubscribe = auth.subscribe((event, data) => {
  if (event === 'auth_signin') {
    console.log('User signed in:', data);
  }
});

// Cleanup
unsubscribe();
```

### Event Types

**AuthService Events:**
- `auth_signin` - User signed in
- `auth_signout` - User signed out

**TokenService Events:**
- `token_created` - New token created
- `token_updated` - Token updated

**WalletService Events:**
- `funds_added` - Funds added to wallet
- `funds_deducted` - Funds deducted from wallet

## Storage

Services use `localStorage` by default. Provide custom storage:

```javascript
const customStorage = {
  getItem: (key) => { /* ... */ },
  setItem: (key, value) => { /* ... */ },
  removeItem: (key) => { /* ... */ }
};

const auth = new AuthService({ storage: customStorage });
```

## Error Handling

All methods return result objects:

```javascript
const result = await tokens.createToken(data);

if (result.success) {
  console.log('Success:', result.token);
} else {
  console.error('Error:', result.error);
}
```

## Dependencies

**Optional:**
- `dexie` - For IndexedDB storage (recommended for large datasets)
- `crypto-js` - For encryption features (if needed)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any browser with ES6+ support and localStorage

## License

Part of the pewpi-infinity Infinity Brain network.

## Documentation

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration guide.

## Contact

- Repository: pewpi-infinity/infinity-brain-031
- Email: marvaseater@gmail.com
- Phone: 808-342-9974
