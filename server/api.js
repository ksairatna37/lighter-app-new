// Supabase client setup

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';
import { generateAuthToken } from './auth_generator.js';
import { verifyAuthToken, optionalAuth } from './auth_middleware.js';

// Base URL for deployed backend
const BASE_URL = process.env.BASE_URL || 'https://lighter-farm-backend.thankfuldesert-772ce932.westus.azurecontainerapps.io';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

const app = express();

app.use(cors({
  origin: [
    'https://base.app',
    'https://app-lighterfarm-hxgcccdkf8c5h9gw.centralindia-01.azurewebsites.net',
    'https://app.lighter.farm',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
    "https://base.org",
    "https://*.base.org"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Privy-User-Id', 'X-Wallet-Address'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400  // 24 hours
}));

app.use(express.json());



// ============================================================================
// 🚀 OPTIMIZATION 1: Backend Token Cache with TTL (Time To Live)
// These tokens are for Backend API authentication (not client authentication)
// ============================================================================
const backendTokenCache = new Map();
const BACKEND_TOKEN_TTL = 50000; // 50 seconds (tokens valid for ~60s, use 50s to be safe)

function getCachedBackendToken(endpoint) {
  const cached = backendTokenCache.get(endpoint);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }
  backendTokenCache.delete(endpoint);
  return null;
}

function setCachedBackendToken(endpoint, token) {
  backendTokenCache.set(endpoint, {
    token,
    expiresAt: Date.now() + BACKEND_TOKEN_TTL
  });
}

// Clean up expired backend tokens every minute
setInterval(() => {
  const now = Date.now();
  for (const [endpoint, data] of backendTokenCache.entries()) {
    if (now >= data.expiresAt) {
      backendTokenCache.delete(endpoint);
    }
  }
}, 60000);

// ============================================================================
// 🚀 OPTIMIZATION 2: Reusable Backend Auth Token Generator
// These are tokens for authenticating WITH THE BACKEND (not from clients)
// ============================================================================
function getBackendAuthToken(endpoint) {
  // Check cache first
  let token = getCachedBackendToken(endpoint);
  if (token) {
    if (!IS_PRODUCTION) console.log(`🎯 Using cached backend token for ${endpoint}`);
    return token;
  }

  // Generate new backend token using auth_generator.js
  try {
    token = generateAuthToken(endpoint);
    setCachedBackendToken(endpoint, token);
    if (!IS_PRODUCTION) console.log(`🔐 Generated new backend token for ${endpoint}`);
    return token;
  } catch (error) {
    console.error(`❌ Failed to generate backend auth token for ${endpoint}:`, error.message);
    return null;
  }
}

// ============================================================================
// 🚀 OPTIMIZATION 3: Centralized Backend Request Handler - IMPROVED
// ============================================================================
async function forwardToBackend(options) {
  const {
    endpoint,
    method = 'GET',
    body = null,
    headers = {},
    authToken = null
  } = options;

  const backendUrl = `${BASE_URL}${endpoint}`;

  // Log request details (only in development)
  if (!IS_PRODUCTION) {
    console.log(`\n📤 Forwarding request to backend:`);
    console.log(`   URL: ${backendUrl}`);
    console.log(`   Method: ${method}`);
    console.log(`   Backend Auth Token: ${authToken ? 'Bearer ' + authToken.substring(0, 20) + '...' : 'NONE'}`);
    if (body) console.log(`   Body:`, JSON.stringify(body, null, 2));
  }

  const backendHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...headers
  };

  // Add backend auth token if provided
  if (authToken) {
    backendHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const fetchOptions = {
    method,
    headers: backendHeaders
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(backendUrl, fetchOptions);

    // Get response text first
    const responseText = await response.text();

    // Log response details (only in development)
    if (!IS_PRODUCTION) {
      console.log(`📥 Backend response:`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Body preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    }

    // Try to parse as JSON
    let data;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ Failed to parse JSON response:`, parseError.message);
        console.error(`   Response text:`, responseText);
        throw new Error('Backend returned invalid JSON');
      }
    } else {
      // Non-JSON response
      console.error(`❌ Backend returned non-JSON response:`);
      console.error(`   Content-Type: ${contentType || 'NONE'}`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Response text:`, responseText);

      throw new Error(`Backend returned non-JSON response (${response.status}): ${responseText.substring(0, 100)}`);
    }

    return {
      status: response.status,
      ok: response.ok,
      data
    };

  } catch (fetchError) {
    console.error(`❌ Fetch error:`, fetchError.message);

    // Re-throw with more context
    if (fetchError.message.includes('fetch failed')) {
      throw new Error(`Cannot connect to backend at ${backendUrl}`);
    }

    throw fetchError;
  }
}

// ============================================================================
// 🚀 OPTIMIZATION 4: Error Handler Middleware - IMPROVED
// ============================================================================
function handleError(error, req, res) {
  console.error(`\n❌ Error in ${req.method} ${req.path}:`);
  console.error(`   Message: ${error.message}`);
  if (error.stack && !IS_PRODUCTION) console.error(`   Stack:`, error.stack);

  // Connection errors
  if (error.message.includes('Cannot connect to backend')) {
    return res.status(503).json({
      success: false,
      error: 'Backend connection failed',
      message: 'Cannot connect to backend server',
      details: IS_PRODUCTION ? undefined : error.message
    });
  }

  // Non-JSON response errors
  if (error.message.includes('non-JSON response')) {
    return res.status(502).json({
      success: false,
      error: 'Backend error',
      message: 'Backend returned invalid response format',
      details: IS_PRODUCTION ? undefined : error.message
    });
  }

  // Auth token errors
  if (error.message.includes('auth token')) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Failed to generate authentication token',
      details: IS_PRODUCTION ? undefined : error.message
    });
  }

  // Generic errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: IS_PRODUCTION ? 'An unexpected error occurred' : error.message,
    details: IS_PRODUCTION ? undefined : error.stack
  });
}

// ============================================================================
// PUBLIC ROUTES (No Client Authentication Required)
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint - No authentication required
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    auth: 'Fernet-based (5-minute validity)',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

/**
 * POST /api/auth/token
 * Generate client authentication token - Public endpoint
 * Clients must call this first to get a token before accessing protected routes
 */
app.post('/api/auth/token', (req, res) => {
  try {
    const { privy_id, walletAddress, identifier } = req.body;
    
    // For token generation, we use a generic endpoint
    const endpoint = '/api/client/auth';
    
    // Generate Fernet token using auth_generator
    const token = generateAuthToken(endpoint, privy_id || walletAddress || identifier || 'LighterFarmSecureAPI');
    
    console.log('🎫 Client auth token generated for:', privy_id || walletAddress || identifier || 'anonymous');
    
    res.json({
      success: true,
      token,
      expiresIn: '5 minutes',
      message: 'Token generated successfully. Include this in Authorization header as: Bearer <token>'
    });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

// ============================================================================
// PROTECTED ROUTES - ALL REQUIRE CLIENT AUTHENTICATION
// Apply verifyAuthToken middleware to protect routes
// ============================================================================

/**
 * POST /api/track_usdc_deposit - PROTECTED
 * Requires: Authorization: Bearer <token>
 */
app.post('/api/track_usdc_deposit', verifyAuthToken, async (req, res) => {
  try {
    const { sender_address, user_id } = req.body;
    const privyUserId = req.headers['x-privy-user-id'];

    // Log incoming request (only in development)
    if (!IS_PRODUCTION) {
      console.log(`\n🔍 Track USDC Deposit Request (Authenticated):`);
      console.log(`   Sender Address: ${sender_address}`);
      console.log(`   User ID: ${user_id}`);
      console.log(`   Privy User ID: ${privyUserId}`);
      console.log(`   Client Auth: ✅ Verified`);
    }

    // Validation
    if (!sender_address) {
      return res.status(400).json({
        success: false,
        error: 'sender_address is required'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    if (!privyUserId) {
      return res.status(400).json({
        success: false,
        error: 'X-Privy-User-Id header is required'
      });
    }

    // Get BACKEND auth token (different from client auth token)
    const endpoint = '/api/track_usdc_deposit';
    const backendAuthToken = getBackendAuthToken(endpoint);

    if (!backendAuthToken) {
      throw new Error('Failed to generate backend auth token for endpoint: ' + endpoint);
    }

    // Forward to backend with backend auth
    const result = await forwardToBackend({
      endpoint,
      method: 'POST',
      body: {
        sender_address,
        user_id
      },
      headers: {
        'X-Privy-User-Id': privyUserId
      },
      authToken: backendAuthToken  // Backend token, not client token
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/deposit - PROTECTED
 */
app.post('/api/deposit', verifyAuthToken, async (req, res) => {
  try {
    const { id, amount } = req.body;
    const privyUserId = req.headers['x-privy-user-id'];
    const walletAddress = req.headers['x-wallet-address'];

    // Validation
    if (!id) return res.status(400).json({ error: 'User ID is required' });
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid deposit amount is required' });
    if (!privyUserId) return res.status(400).json({ error: 'X-Privy-User-Id header missing' });

    // Forward to backend with backend auth
    const result = await forwardToBackend({
      endpoint: '/deposit',
      method: 'POST',
      body: { id, amount: parseFloat(amount) },
      headers: {
        'X-Privy-User-Id': privyUserId,
        ...(walletAddress && { 'X-Wallet-Address': walletAddress })
      },
      authToken: getBackendAuthToken('/deposit')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/register_new_user - PROTECTED
 */
app.post('/api/register_new_user', verifyAuthToken, async (req, res) => {
  try {
    const { privy_id, referral_code } = req.body;

    if (!privy_id) return res.status(400).json({ success: false, error: 'privy id is required' });
    if (!referral_code) return res.status(400).json({ success: false, error: 'referral code is required' });

    const result = await forwardToBackend({
      endpoint: '/register_new_user',
      method: 'POST',
      body: { privy_id, referral_code },
      headers: { 'X-Privy-User-Id': privy_id },
      authToken: getBackendAuthToken('/register_new_user')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/stake - PROTECTED
 */
app.post('/api/stake', verifyAuthToken, async (req, res) => {
  try {
    const { wallet_address, amount, duration_days, auth_token, timestamp } = req.body;
    const privyUserId = req.headers['x-privy-user-id'];
    const walletAddress = req.headers['x-wallet-address'];

    // Validation
    if (!wallet_address) return res.status(400).json({ success: false, error: 'wallet_address is required' });
    if (!amount) return res.status(400).json({ success: false, error: 'amount is required' });
    if (duration_days === undefined || duration_days === null) {
      return res.status(400).json({ success: false, error: 'duration_days is required' });
    }
    if (!privyUserId) return res.status(400).json({ success: false, error: 'X-Privy-User-Id header is required' });

    const requestBody = { wallet_address, amount, duration_days };
    if (auth_token) requestBody.auth_token = auth_token;
    if (timestamp) requestBody.timestamp = timestamp;

    const result = await forwardToBackend({
      endpoint: '/api/stake',
      method: 'POST',
      body: requestBody,
      headers: {
        'X-Privy-User-Id': privyUserId,
        ...(walletAddress && { 'X-Wallet-Address': walletAddress })
      },
      authToken: getBackendAuthToken('/api/stake')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * GET /api/points/price - PROTECTED
 */
app.get('/api/points/price', verifyAuthToken, async (req, res) => {
  try {
    console.log('📊 Points price request - Client authenticated ✅');
    
    const result = await forwardToBackend({
      endpoint: '/api/points/price',
      method: 'GET',
      authToken: getBackendAuthToken('/api/points/price')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/unstake - PROTECTED
 */
app.post('/api/unstake', verifyAuthToken, async (req, res) => {
  try {
    const { wallet_address, amount, force_unlock, auth_token, timestamp } = req.body;
    const privyUserId = req.headers['x-privy-user-id'];
    const walletAddress = req.headers['x-wallet-address'];

    // Validation
    if (!wallet_address) return res.status(400).json({ success: false, error: 'wallet_address is required' });
    if (!amount) return res.status(400).json({ success: false, error: 'amount is required' });
    if (force_unlock === undefined || force_unlock === null) {
      return res.status(400).json({ success: false, error: 'force unlock is required' });
    }
    if (!privyUserId) return res.status(400).json({ success: false, error: 'X-Privy-User-Id header is required' });

    const requestBody = { wallet_address, amount, force_unlock };
    if (auth_token) requestBody.auth_token = auth_token;
    if (timestamp) requestBody.timestamp = timestamp;

    const result = await forwardToBackend({
      endpoint: '/api/unstake',
      method: 'POST',
      body: requestBody,
      headers: {
        'X-Privy-User-Id': privyUserId,
        ...(walletAddress && { 'X-Wallet-Address': walletAddress })
      },
      authToken: getBackendAuthToken('/api/unstake')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/points/buy - PROTECTED
 */
app.post('/api/points/buy', verifyAuthToken, async (req, res) => {
  try {
    const { wallet_address, usdl_amount, expected_points } = req.body;
    const privyUserId = req.headers['x-privy-user-id'];
    const walletAddress = req.headers['x-wallet-address'];

    // Validation
    if (!wallet_address) return res.status(400).json({ success: false, error: 'wallet_address is required' });
    if (!usdl_amount) return res.status(400).json({ success: false, error: 'amount is required' });
    if (!privyUserId) return res.status(400).json({ success: false, error: 'X-Privy-User-Id header is required' });

    const requestBody = { wallet_address, usdl_amount, expected_points };

    const result = await forwardToBackend({
      endpoint: '/api/points/buy',
      method: 'POST',
      body: requestBody,
      headers: {
        'X-Privy-User-Id': privyUserId,
        ...(walletAddress && { 'X-Wallet-Address': walletAddress })
      },
      authToken: getBackendAuthToken('/api/points/buy')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/points/sell - PROTECTED
 */
app.post('/api/points/sell', verifyAuthToken, async (req, res) => {
  try {
    const { wallet_address, points_amount, expected_usdl } = req.body;
    const privyUserId = req.headers['x-privy-user-id'];
    const walletAddress = req.headers['x-wallet-address'];

    // Validation
    if (!wallet_address) return res.status(400).json({ success: false, error: 'wallet_address is required' });
    if (!points_amount) return res.status(400).json({ success: false, error: 'amount is required' });
    if (!privyUserId) return res.status(400).json({ success: false, error: 'X-Privy-User-Id header is required' });

    const requestBody = { wallet_address, points_amount, expected_usdl };

    const result = await forwardToBackend({
      endpoint: '/api/points/sell',
      method: 'POST',
      body: requestBody,
      headers: {
        'X-Privy-User-Id': privyUserId,
        ...(walletAddress && { 'X-Wallet-Address': walletAddress })
      },
      authToken: getBackendAuthToken('/api/points/sell')
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * GET /api/transactions/:user_id - PROTECTED
 */
app.get('/api/transactions/:user_id', verifyAuthToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    let endpoint = `/api/transactions/${user_id}`;
    if (limit) {
      endpoint += `?limit=${limit}`;
    }

    const result = await forwardToBackend({
      endpoint,
      method: 'GET',
      authToken: getBackendAuthToken(`/api/transactions/${user_id}`)
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * GET /api/points/history/:user_id - PROTECTED
 */
app.get('/api/points/history/:user_id', verifyAuthToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit } = req.query;

    // Validation
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Build endpoint with optional query parameter
    let endpoint = `/api/points/history/${user_id}`;
    if (limit) {
      endpoint += `?limit=${limit}`;
    }

    // Forward to backend with auth
    const result = await forwardToBackend({
      endpoint,
      method: 'GET',
      authToken: getBackendAuthToken(`/api/points/history/${user_id}`)
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * GET /api/account/:user_id - PROTECTED
 */
app.get('/api/account/:user_id', verifyAuthToken, async (req, res) => {
  try {
    const { user_id } = req.params;

    // Validation
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Build endpoint
    const endpoint = `/api/account/${user_id}`;

    // Forward to backend with auth
    const result = await forwardToBackend({
      endpoint,
      method: 'GET',
      authToken: getBackendAuthToken(endpoint)
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * GET /api/account/:user_id/encrypted - PROTECTED
 */
app.get('/api/account/:user_id/encrypted', verifyAuthToken, async (req, res) => {
  try {
    const { user_id } = req.params;

    // Validation
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Build endpoint
    const endpoint = `/api/account/${user_id}/encrypted`;

    // Forward to backend with auth
    const result = await forwardToBackend({
      endpoint,
      method: 'GET',
      authToken: getBackendAuthToken(endpoint)
    });

    return res.status(result.status).json(result.data);

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/check_user_exist - PROTECTED
 */
app.post('/api/check_user_exist', verifyAuthToken, async (req, res) => {
  try {
    const { privy_id } = req.body;
    if (!privy_id) return res.status(400).json({ success: false, error: 'privy_id is required' });

    console.log('🔍 Check user exist request - Client authenticated ✅');

    const endpoint = `/api/account/privy/${privy_id}`;
    const result = await forwardToBackend({
      endpoint,
      method: 'GET',
      headers: { 'X-Privy-User-Id': privy_id },
      authToken: getBackendAuthToken(endpoint)
    });

    if (result.data.success === true) {
      return res.status(200).json({
        success: true,
        exists: 'yes',
        user: result.data.data
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: 'no',
        message: result.data.message || 'User not found'
      });
    }

  } catch (error) {
    return handleError(error, req, res);
  }
});

/**
 * POST /api/get_referal_code - PROTECTED
 */
app.post('/api/get_referal_code', verifyAuthToken, async (req, res) => {
  try {
    const { id, privy_id } = req.body;

    if (!id) return res.status(400).json({ success: false, error: 'User ID is required' });
    if (!privy_id) return res.status(400).json({ success: false, error: 'Privy ID is required' });

    const endpoint = `/api/balance/${id}`;
    const result = await forwardToBackend({
      endpoint,
      method: 'GET',
      authToken: getBackendAuthToken(endpoint)
    });

    // Handle authentication errors
    if (result.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        details: result.data?.message || result.data?.error || 'Invalid authentication token'
      });
    }

    // Handle successful response
    if (result.ok && result.data.success && result.data.data) {
      const balanceData = result.data.data;
      return res.json({
        success: true,
        id: balanceData.user_id,
        usdl_balance: parseFloat(balanceData.usdl_balance),
        points_balance: parseFloat(balanceData.points_balance),
        staked_amount: parseFloat(balanceData.staked_amount),
        total_portfolio_value: parseFloat(balanceData.total_portfolio_value),
        points_usd_value: parseFloat(balanceData.points_usd_value),
        last_updated: balanceData.last_updated
      });
    }

    // Handle legacy array format
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      const balanceData = result.data[0];
      return res.json({
        success: true,
        id: balanceData.user_id,
        usdl_balance: parseFloat(balanceData.usdl_balance),
        points_balance: parseFloat(balanceData.points_balance),
        staked_amount: parseFloat(balanceData.staked_amount),
        total_portfolio_value: parseFloat(balanceData.total_portfolio_value),
        points_usd_value: parseFloat(balanceData.points_usd_value),
        last_updated: balanceData.last_updated
      });
    }

    // Handle errors
    if (!result.ok) {
      const errorMessage = result.data?.error || result.data?.message || `Backend error: ${result.status}`;
      return res.status(result.status).json({
        success: false,
        error: errorMessage,
        details: result.data
      });
    }

    // Unexpected response
    return res.status(500).json({
      success: false,
      error: 'Unexpected response format from backend',
      details: result.data
    });

  } catch (error) {
    return handleError(error, req, res);
  }
});

// ============================================================================
// FARCASTER / BASE APP INTEGRATION - KEEP AS PUBLIC
// ============================================================================

/**
 * GET /.well-known/farcaster.json - PUBLIC
 * Farcaster manifest - no authentication required
 */
app.get('/.well-known/farcaster.json', (req, res) => {
  const manifest = {
    accountAssociation: {
      "header": "eyJmaWQiOjEzODAxMDYsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1NGUxY2IxRTRFRTAwNDAyOEVhQTY1NEVlNGM5MWMwOUFjNDIzMTVCIn0",
      "payload": "eyJkb21haW4iOiJhcHAtbGlnaHRlcmZhcm0taHhnY2NjZGtmOGM1aDlndy5jZW50cmFsaW5kaWEtMDEuYXp1cmV3ZWJzaXRlcy5uZXQifQ",
      "signature": "MHgzYTI0Zjg0ZTQxZTIyZTJmZDMwYjA2NmE2MTdlNzU2MTc3YTQyMDc3NTgzZjkwZjA0YzI2Y2JmMmUxODM5N2YxNzk1MjEwZTI3Y2M5ZTA1ODliNzc2MWRkYzMzNjE4NTNhM2ExYTg1ZGEwY2IyYzM0NDJmZTk0NzMwNjNhODQ4YTFi"
    },
    baseBuilder: {
      allowedAddresses: ["0xc252B5Ba8D936A5c8E6b32b38F69766299599d79"]
    },
    miniapp: {
      version: "1",
      name: "Lighter Farm",
      subtitle: "DeFi Platform",
      description: "Decentralized finance application for farming and trading",
      screenshotUrls: [`${process.env.APP_URL}/screenshot.png`],
      iconUrl: `${process.env.APP_URL}/icon.png`,
      splashImageUrl: `${process.env.APP_URL}/splash.png`,
      splashBackgroundColor: "#000000",
      homeUrl: process.env.APP_URL,
      webhookUrl: `${process.env.APP_URL}/api/webhook`,
      primaryCategory: "finance",
      tags: ["defi", "farming", "trading", "blockchain"],
      heroImageUrl: `${process.env.APP_URL}/hero.png`,
      ogTitle: "Lighter Farm - DeFi Platform",
      ogDescription: "Your decentralized finance companion",
      ogImageUrl: `${process.env.APP_URL}/og-image.png`
    }
  };

  res.json(manifest);
});

/**
 * POST /api/webhook - PUBLIC
 * Farcaster webhook - no authentication required (webhook has its own verification)
 */
app.post('/api/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).json({ success: true });
});

// ============================================================================
// STATIC FILES & CATCH-ALL
// ============================================================================

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler for React SPA
app.get('*', (req, res, next) => {
  if (req.path.includes('/:')) {
    return res.status(400).send('Malformed URL');
  }
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 LighterFarm Proxy Server Running`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Port: ${port}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 Backend URL: ${BASE_URL}`);
  console.log(`🔐 Client Auth: Fernet-based (5-minute token validity)`);
  console.log(`⚡ Backend Token Cache: Enabled (TTL: ${BACKEND_TOKEN_TTL}ms)`);
  console.log(`\n📝 Public Endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/auth/token`);
  console.log(`   - GET  /.well-known/farcaster.json`);
  console.log(`   - POST /api/webhook`);
  console.log(`\n🔒 Protected Endpoints (require Bearer token):`);
  console.log(`   - All other /api/* routes`);
  console.log(`${'='.repeat(60)}\n`);
});

export default app;
