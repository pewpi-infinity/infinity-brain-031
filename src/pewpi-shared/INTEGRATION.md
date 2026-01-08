# pewpi-shared Integration Guide

## Overview

The `pewpi-shared` library provides a unified authentication, wallet, and token management system for the Infinity Brain network. This guide covers integration steps and best practices.

## Architecture

The library consists of the following core components:

- **AuthService**: User authentication and session management
- **TokenService**: Token creation, storage, and management
- **WalletUnified**: Wallet operations and transaction handling
- **IntegrationListener**: Event coordination across services
- **MachineAdapter**: State machine integration adapter
- **UIShims**: UI helper utilities

## Quick Start

### 1. Include the Library

Add the pewpi-shared scripts to your HTML page:

```html
<script src="src/pewpi-shared/auth-service.js"></script>
<script src="src/pewpi-shared/token-service.js"></script>
<script src="src/pewpi-shared/wallet-unified.js"></script>
<script src="src/pewpi-shared/integration-listener.js"></script>
<script src="src/pewpi-shared/machines/adapter.js"></script>
<script src="src/pewpi-shared/ui-shims.js"></script>
```

Or use the index-shim loader:

```html
<script src="src/pewpi-shared/index-shim.js"></script>
```

### 2. Initialize Services

```javascript
// Initialize core services
const authService = new AuthService();
const tokenService = new TokenService();
const walletService = new WalletUnified({ tokenService });

// Initialize integration layer
const integrationListener = new IntegrationListener({
  authService,
  tokenService,
  walletService
});

const machineAdapter = new MachineAdapter({
  authService,
  tokenService,
  walletService,
  integrationListener
});

// Initialize all services
await authService.initialize();
await tokenService.initialize();
await walletService.initialize();
await integrationListener.initialize();
await machineAdapter.initialize();
```

### 3. Basic Usage

#### Authentication

```javascript
// Sign in user
const result = await authService.signIn({ handle: 'username' });
if (result.success) {
  console.log('User authenticated:', result.user);
}

// Check authentication status
if (authService.isAuthenticated()) {
  console.log('User is logged in');
}

// Sign out
await authService.signOut();
```

#### Token Management

```javascript
// Create a token
const tokenResult = await tokenService.createToken({
  value: 29,
  type: '🧱🍄⭐',
  name: 'Brain Token'
});

// Get all tokens
const { tokens } = await tokenService.getAllTokens();

// Update token
await tokenService.updateToken(tokenId, { value: 35 });
```

#### Wallet Operations

```javascript
// Add funds to wallet
await walletService.addFunds(100, { source: 'deposit' });

// Check balance
const { balance } = await walletService.getBalance();

// Purchase token with wallet
const result = await walletService.purchaseToken({
  value: 29,
  type: '🧱🍄⭐'
});
```

## Event Handling

### Subscribe to Service Events

```javascript
// Auth events
authService.subscribe((event, data) => {
  console.log('Auth event:', event, data);
  // Events: auth_signin, auth_signout
});

// Token events
tokenService.subscribe((event, data) => {
  console.log('Token event:', event, data);
  // Events: token_created, token_updated
});

// Wallet events
walletService.subscribe((event, data) => {
  console.log('Wallet event:', event, data);
  // Events: funds_added, funds_deducted
});
```

### Integration Listener Patterns

```javascript
// Listen to specific service events
integrationListener.on('auth:signin', (event) => {
  console.log('User signed in:', event.data);
});

// Listen to all auth events
integrationListener.on('auth:*', (event) => {
  console.log('Auth event:', event);
});

// Listen to all events
integrationListener.on('*', (event) => {
  console.log('Any event:', event);
});
```

## State Machine Integration

```javascript
// Execute state transitions
const result = await machineAdapter.transition('signin', {
  handle: 'username'
});

// Get current state
const state = machineAdapter.getState();

// View state history
const history = machineAdapter.getHistory(10);
```

## UI Integration

### Auth Gate

```javascript
// Create auth gate
const authGate = UIShims.createAuthGate((handle) => {
  authService.signIn({ handle }).then(() => {
    UIShims.removeAuthGate();
  });
});
document.body.appendChild(authGate);
```

### Status Indicator

```javascript
// Create status indicator
const indicator = UIShims.createStatusIndicator('idle');
document.body.appendChild(indicator);

// Update status
UIShims.updateStatus(indicator, 'authenticated', '🐶 pewpi: ready');
```

### Wallet Display

```javascript
// Create wallet display
const walletDisplay = UIShims.createWalletDisplay(balance);
document.body.appendChild(walletDisplay);

// Update on balance change
walletService.subscribe((event, data) => {
  if (event === 'funds_added' || event === 'funds_deducted') {
    UIShims.updateWalletDisplay(walletDisplay, data.balance);
  }
});
```

### Notifications

```javascript
// Show notification
UIShims.showNotification('Token created!', 'success');
UIShims.showNotification('Insufficient funds', 'error');
```

## Storage Options

By default, services use `localStorage`. You can provide custom storage:

```javascript
const customStorage = {
  getItem: (key) => { /* custom get */ },
  setItem: (key, value) => { /* custom set */ },
  removeItem: (key) => { /* custom remove */ }
};

const authService = new AuthService({ storage: customStorage });
```

## Error Handling

All service methods return a result object with a `success` flag:

```javascript
const result = await tokenService.createToken(data);
if (result.success) {
  console.log('Token created:', result.token);
} else {
  console.error('Error:', result.error);
}
```

## Best Practices

1. **Defensive Initialization**: Always initialize services in a try-catch block
2. **Event Cleanup**: Unsubscribe from events when components unmount
3. **Error Boundaries**: Handle all service errors gracefully
4. **State Sync**: Use IntegrationListener to keep UI in sync with service state
5. **Type Safety**: Validate data before passing to services

## Advanced Usage

### Custom State Transitions

Add custom transitions to the MachineAdapter:

```javascript
machineAdapter.transitions.set('authenticated:custom_action', async (ctx) => {
  // Custom logic
  return { nextState: 'custom_state', data: result };
});
```

### Database Integration

For persistent storage, integrate with Dexie.js (if available):

```javascript
import Dexie from 'dexie';

const db = new Dexie('pewpi-db');
db.version(1).stores({
  tokens: 'id, value, type, timestamp',
  transactions: 'id, type, amount, timestamp'
});

// Use as storage backend for services
```

## Troubleshooting

### Service Not Initializing

- Check browser console for errors
- Verify localStorage is available
- Ensure all dependencies are loaded

### Events Not Firing

- Verify subscriptions are active
- Check IntegrationListener initialization
- Ensure services are initialized before subscribing

### State Machine Issues

- Review state history with `getHistory()`
- Verify transitions are defined for current state
- Check that required services are configured

## Support

For issues or questions:
- Repository: pewpi-infinity/infinity-brain-031
- Contact: marvaseater@gmail.com
