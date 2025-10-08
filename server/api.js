// Supabase client setup
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://drepvbrhkxzwtwqncnyd.supabase.co";
const SUPABASE_KEY = "sb_secret_PILUHtGebPRIeV_3Ojqd1w_yHUPlMkP";

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;


import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';

// Base URL for deployed backend (can be overridden via env var)
const BASE_URL = process.env.BASE_URL || 'https://lighter-farm-backend.thankfuldesert-772ce932.westus.azurecontainerapps.io/';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
// POST /api/referral/register-user
app.post('/api/referral/register-user', async (req, res) => {
  try {
    // Extract required data from request body
    const { wallet_address, referral_code } = req.body;

    // Get Privy User ID from headers
    const privyUserId = req.headers['x-privy-user-id'];

    // Validate required fields
    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'wallet_address is required'
      });
    }

    if (!privyUserId) {
      return res.status(400).json({
        success: false,
        error: 'X-Privy-User-Id header is required'
      });
    }

    // Prepare request body for backend API
    const requestBody = {
      wallet_address,
      ...(referral_code && { referral_code }) // Only include referral_code if provided
    };

    console.log('Forwarding request to backend:', {
      url: `${BASE_URL}api/referral/register-user`,
      headers: {
        'X-Privy-User-Id': privyUserId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: requestBody
    });

    // Make request to actual backend API
    const response = await fetch(`${BASE_URL}api/referral/register-user`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Privy-User-Id': privyUserId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Get response data
    const responseData = await response.json();

    console.log('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    // Forward the response status and data
    if (response.ok) {
      res.status(200).json(responseData);
    } else {
      // Handle error responses from backend
      res.status(response.status).json(responseData);
    }

  } catch (error) {
    console.error('Error in /api/referral/register-user:', error);

    // Handle network errors or other exceptions
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});



app.post('/api/stake', async (req, res) => {
  try {
    // Extract required data from request body
    const { wallet_address, amount, duration_days, auth_token, timestamp } = req.body;

    // Get headers from the request
    const privyUserId = req.headers['x-privy-user-id']; // This is actually Supabase user ID
    const walletAddress = req.headers['x-wallet-address'];
    const authorizationHeader = req.headers['authorization'];

    console.log('📥 Received stake request:', {
      body: {
        wallet_address,
        amount,
        duration_days: duration_days !== undefined ? duration_days : 'not provided',
        hasAuthToken: !!auth_token,
        timestamp
      },
      headers: {
        'X-Privy-User-Id': privyUserId,
        'X-Wallet-Address': walletAddress,
        'Authorization': authorizationHeader ? 'Bearer [TOKEN]' : 'none'
      }
    });

    // Validate required fields
    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'wallet_address is required'
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'amount is required'
      });
    }

    if (duration_days === undefined || duration_days === null) {
      return res.status(400).json({
        success: false,
        error: 'duration_days is required'
      });
    }

    if (!privyUserId) {
      return res.status(400).json({
        success: false,
        error: 'X-Privy-User-Id header is required'
      });
    }

    // Prepare request body for backend API - INCLUDE duration_days
    const requestBody = {
      wallet_address,
      amount,
      duration_days: duration_days // This is required by the API
    };

    // Add auth token if provided
    if (auth_token) {
      requestBody.auth_token = auth_token;
    }
    if (timestamp) {
      requestBody.timestamp = timestamp;
    }

    // Prepare headers for backend API
    const backendHeaders = {
      'Accept': 'application/json',
      'X-Privy-User-Id': privyUserId, // Supabase user ID
      'Content-Type': 'application/json'
    };

    // Add wallet address header if provided
    if (walletAddress) {
      backendHeaders['X-Wallet-Address'] = walletAddress;
    }

    // Add authorization header if provided
    if (authorizationHeader) {
      backendHeaders['Authorization'] = authorizationHeader;
    }

    console.log('🚀 Forwarding request to backend with duration_days:', {
      url: `${BASE_URL}api/stake`,
      headers: {
        ...backendHeaders,
        'Authorization': backendHeaders['Authorization'] ? 'Bearer [TOKEN]' : 'none'
      },
      body: {
        ...requestBody,
        auth_token: requestBody.auth_token ? '[HIDDEN]' : 'none'
      }
    });

    // Make request to actual backend API
    const response = await fetch(`${BASE_URL}api/stake`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(requestBody)
    });

    // Get response data
    const responseData = await response.json();

    console.log('📤 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      success: responseData?.success,
      error: responseData?.error?.code || responseData?.error?.message || null,
      detail: responseData?.detail || null
    });

    // Forward the response status and data
    if (response.ok) {
      res.status(200).json(responseData);
    } else {
      // Handle error responses from backend
      res.status(response.status).json(responseData);
    }

  } catch (error) {
    console.error('💥 Error in /api/stake:', error);

    // Handle network errors or other exceptions
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});


app.post('/api/unstake', async (req, res) => {
  try {
    // Extract required data from request body
    const { wallet_address, amount, force_unlock, auth_token, timestamp } = req.body;

    // Get headers from the request
    const privyUserId = req.headers['x-privy-user-id']; // This is actually Supabase user ID
    const walletAddress = req.headers['x-wallet-address'];
    const authorizationHeader = req.headers['authorization'];

    console.log('📥 Received stake request:', {
      body: {
        wallet_address,
        amount,
        force_unlock: force_unlock !== undefined ? force_unlock : 'false',
        hasAuthToken: !!auth_token,
        timestamp
      },
      headers: {
        'X-Privy-User-Id': privyUserId,
        'X-Wallet-Address': walletAddress,
        'Authorization': authorizationHeader ? 'Bearer [TOKEN]' : 'none'
      }
    });

    // Validate required fields
    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'wallet_address is required'
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'amount is required'
      });
    }

    if (force_unlock === undefined || force_unlock === null) {
      return res.status(400).json({
        success: false,
        error: 'force unlock is required'
      });
    }

    if (!privyUserId) {
      return res.status(400).json({
        success: false,
        error: 'X-Privy-User-Id header is required'
      });
    }

    // Prepare request body for backend API - INCLUDE duration_days
    const requestBody = {
      wallet_address,
      amount,
      force_unlock: force_unlock // This is required by the API
    };

    // Add auth token if provided
    if (auth_token) {
      requestBody.auth_token = auth_token;
    }
    if (timestamp) {
      requestBody.timestamp = timestamp;
    }

    // Prepare headers for backend API
    const backendHeaders = {
      'Accept': 'application/json',
      'X-Privy-User-Id': privyUserId, // Supabase user ID
      'Content-Type': 'application/json'
    };

    // Add wallet address header if provided
    if (walletAddress) {
      backendHeaders['X-Wallet-Address'] = walletAddress;
    }

    // Add authorization header if provided
    if (authorizationHeader) {
      backendHeaders['Authorization'] = authorizationHeader;
    }

    console.log('🚀 Forwarding request to backend with duration_days:', {
      url: `${BASE_URL}api/unstake`,
      headers: {
        ...backendHeaders,
        'Authorization': backendHeaders['Authorization'] ? 'Bearer [TOKEN]' : 'none'
      },
      body: {
        ...requestBody,
        auth_token: requestBody.auth_token ? '[HIDDEN]' : 'none'
      }
    });

    // Make request to actual backend API
    const response = await fetch(`${BASE_URL}api/unstake`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(requestBody)
    });

    // Get response data
    const responseData = await response.json();

    console.log('📤 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      success: responseData?.success,
      error: responseData?.error?.code || responseData?.error?.message || null,
      detail: responseData?.detail || null
    });

    // Forward the response status and data
    if (response.ok) {
      res.status(200).json(responseData);
    } else {
      // Handle error responses from backend
      res.status(response.status).json(responseData);
    }

  } catch (error) {
    console.error('💥 Error in /api/unstake:', error);

    // Handle network errors or other exceptions
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});


app.post('/api/points/buy', async (req, res) => {
  try {
    // Extract required data from request body
    const { wallet_address, usdl_amount, expected_points, max_slippage, auth_token, timestamp } = req.body;

    // Get headers from the request
    const privyUserId = req.headers['x-privy-user-id']; // This is actually Supabase user ID
    const walletAddress = req.headers['x-wallet-address'];
    const authorizationHeader = req.headers['authorization'];

    console.log('📥 Received stake request:', {
      body: {
        wallet_address,
        usdl_amount,
        expected_points: expected_points !== undefined ? expected_points : 'not provided',
        max_slippage: max_slippage,
        hasAuthToken: !!auth_token,
        timestamp
      },
      headers: {
        'X-Privy-User-Id': privyUserId,
        'X-Wallet-Address': walletAddress,
        'Authorization': authorizationHeader ? 'Bearer [TOKEN]' : 'none'
      }
    });

    // Validate required fields
    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'wallet_address is required'
      });
    }

    if (!usdl_amount) {
      return res.status(400).json({
        success: false,
        error: 'amount is required'
      });
    }

    if (!privyUserId) {
      return res.status(400).json({
        success: false,
        error: 'X-Privy-User-Id header is required'
      });
    }

    // Prepare request body for backend API - INCLUDE duration_days
    const requestBody = {
      wallet_address,
      usdl_amount,
      expected_points: expected_points, // This is required by the API
      max_slippage: 0
    };

    // Add auth token if provided
    if (auth_token) {
      requestBody.auth_token = auth_token;
    }
    if (timestamp) {
      requestBody.timestamp = timestamp;
    }

    // Prepare headers for backend API
    const backendHeaders = {
      'Accept': 'application/json',
      'X-Privy-User-Id': privyUserId, // Supabase user ID
      'Content-Type': 'application/json'
    };

    // Add wallet address header if provided
    if (walletAddress) {
      backendHeaders['X-Wallet-Address'] = walletAddress;
    }

    // Add authorization header if provided
    if (authorizationHeader) {
      backendHeaders['Authorization'] = authorizationHeader;
    }

    console.log('🚀 Forwarding request to backend with duration_days:', {
      url: `${BASE_URL}api/points/buy`,
      headers: {
        ...backendHeaders,
        'Authorization': backendHeaders['Authorization'] ? 'Bearer [TOKEN]' : 'none'
      },
      body: {
        ...requestBody,
        auth_token: requestBody.auth_token ? '[HIDDEN]' : 'none'
      }
    });

    // Make request to actual backend API
    const response = await fetch(`${BASE_URL}api/points/buy`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(requestBody)
    });

    // Get response data
    const responseData = await response.json();

    console.log('📤 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      success: responseData?.success,
      error: responseData?.error?.code || responseData?.error?.message || null,
      detail: responseData?.detail || null
    });

    // Forward the response status and data
    if (response.ok) {
      res.status(200).json(responseData);
    } else {
      // Handle error responses from backend
      res.status(response.status).json(responseData);
    }

  } catch (error) {
    console.error('💥 Error in /api/points/buy:', error);

    // Handle network errors or other exceptions
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});


app.post('/api/points/sell', async (req, res) => {
  try {
    // Extract required data from request body
    const { wallet_address, points_amount, expected_usdl, min_slippage, auth_token, timestamp } = req.body;

    // Get headers from the request
    const privyUserId = req.headers['x-privy-user-id']; // This is actually Supabase user ID
    const walletAddress = req.headers['x-wallet-address'];
    const authorizationHeader = req.headers['authorization'];

    console.log('📥 Received stake request:', {
      body: {
        wallet_address,
        points_amount,
        expected_usdl: expected_usdl !== undefined ? expected_usdl : 'not provided',
        min_slippage: min_slippage,
        hasAuthToken: !!auth_token,
        timestamp
      },
      headers: {
        'X-Privy-User-Id': privyUserId,
        'X-Wallet-Address': walletAddress,
        'Authorization': authorizationHeader ? 'Bearer [TOKEN]' : 'none'
      }
    });

    // Validate required fields
    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: 'wallet_address is required'
      });
    }

    if (!points_amount) {
      return res.status(400).json({
        success: false,
        error: 'amount is required'
      });
    }

    if (!privyUserId) {
      return res.status(400).json({
        success: false,
        error: 'X-Privy-User-Id header is required'
      });
    }

    // Prepare request body for backend API - INCLUDE duration_days
    const requestBody = {
      wallet_address,
      points_amount,
      expected_usdl: expected_usdl, // This is required by the API
      min_slippage: 0
    };

    // Add auth token if provided
    if (auth_token) {
      requestBody.auth_token = auth_token;
    }
    if (timestamp) {
      requestBody.timestamp = timestamp;
    }

    // Prepare headers for backend API
    const backendHeaders = {
      'Accept': 'application/json',
      'X-Privy-User-Id': privyUserId, // Supabase user ID
      'Content-Type': 'application/json'
    };

    // Add wallet address header if provided
    if (walletAddress) {
      backendHeaders['X-Wallet-Address'] = walletAddress;
    }

    // Add authorization header if provided
    if (authorizationHeader) {
      backendHeaders['Authorization'] = authorizationHeader;
    }

    console.log('🚀 Forwarding request to backend with duration_days:', {
      url: `${BASE_URL}api/points/sell`,
      headers: {
        ...backendHeaders,
        'Authorization': backendHeaders['Authorization'] ? 'Bearer [TOKEN]' : 'none'
      },
      body: {
        ...requestBody,
        auth_token: requestBody.auth_token ? '[HIDDEN]' : 'none'
      }
    });

    // Make request to actual backend API
    const response = await fetch(`${BASE_URL}api/points/sell`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(requestBody)
    });

    // Get response data
    const responseData = await response.json();

    console.log('📤 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      success: responseData?.success,
      error: responseData?.error?.code || responseData?.error?.message || null,
      detail: responseData?.detail || null
    });

    // Forward the response status and data
    if (response.ok) {
      res.status(200).json(responseData);
    } else {
      // Handle error responses from backend
      res.status(response.status).json(responseData);
    }

  } catch (error) {
    console.error('💥 Error in /api/points/sell:', error);

    // Handle network errors or other exceptions
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});



// POST /api/check_user_exist
app.post('/api/check_user_exist', async (req, res) => {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      return res.status(400).json({ success: false, error: 'wallet_address is required' });
    }
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Supabase client not configured' });
    }
    const { data, error } = await supabase
      .from('lighter_farm_user')
      .select('wallet_address')
      .eq('wallet_address', wallet_address)
      .maybeSingle();
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    if (data && data.wallet_address) {
      return res.json({ exists: 'yes' });
    } else {
      return res.json({ exists: 'no' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



app.post('/api/get_referal_code', async (req, res) => {
  try {
    const { wallet_address } = req.body;

    if (!wallet_address) {
      return res.status(400).json({ success: false, error: 'wallet_address is required' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Supabase client not configured' });
    }

    // Fetch referral code for given wallet
    const { data, error } = await supabase
      .from('lighter_farm_user')
      .select('id, referral_code, wallet_address, usdl_balance, points_balance, staked_amount, total_points')
      .eq('wallet_address', wallet_address);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (data && data.length > 0) {
      return res.json({
        id: data[0].id,
        referral_code: data[0].referral_code,
        wallet_address: data[0].wallet_address,
        usdl_balance: data[0].usdl_balance,
        points_balance: data[0].points_balance,
        staked_amount: data[0].staked_amount,
        total_points: data[0].total_points
      });
    } else {
      return res.status(404).json({ success: false, error: 'Referral code not found' });
    }

  } catch (err) {
    console.error('Error in /api/get_referal_code:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend_url: BASE_URL
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't match an API route, send back React's index.html
app.get('*', (req, res, next) => {
  if (req.path.includes('/:')) {
    return res.status(400).send('Malformed URL');
  }

  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LighterFarm server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Register user: POST http://localhost:${port}/api/referral/register-user`);
  console.log(`Backend URL: ${BASE_URL}`);
});