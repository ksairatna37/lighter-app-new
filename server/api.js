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
const BASE_URL = process.env.BASE_URL || 'https://lighter-farm-backend.thankfuldesert-772ce932.westus.azurecontainerapps.io';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
// POST /api/referral/register-user
app.post('/api/register_new_user', async (req, res) => {
  try {
    // Extract required data from request body
    const { privy_id, referral_code } = req.body;

    // Validate required fields
    if (!privy_id) {
      return res.status(400).json({
        success: false,
        error: 'privy id is required'
      });
    }

    if (!referral_code) {
      return res.status(400).json({
        success: false,
        error: 'referral code is required'
      });
    }

    // Prepare request body for backend API
    const requestBody = {
      privy_id,
      ...(referral_code && { referral_code }) // Only include referral_code if provided
    };

    console.log('Forwarding request to backend:', {
      url: `${BASE_URL}/register_new_user`,
      headers: {
        'X-Privy-User-Id': privy_id,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: requestBody
    });

    // Make request to actual backend API
    const response = await fetch(`${BASE_URL}/register_new_user`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Privy-User-Id': privy_id,
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
    console.error('Error in /register_new_user:', error);

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


app.get('/api/points/price', async (req, res) => {
  try {
    // Only send application/json header
    const backendHeaders = {
      'Accept': 'application/json'
    };

    console.log('🚀 Forwarding /api/points/price GET request to backend (headers only):', {
      url: `${BASE_URL}/api/points/price`,
      headers: backendHeaders
    });

    // Make GET request to backend
    const response = await fetch(`${BASE_URL}/api/points/price`, {
      method: 'GET',
      headers: backendHeaders
    });

    // Get response data
    const responseData = await response.json();

    console.log('📤 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    // Forward the response status and data
    if (response.statusText === 'OK' && response.status === 200) {
      res.status(200).json(responseData);
    } else {
      res.status(response.status).json(responseData);
    }

  } catch (error) {
    console.error('💥 Error in /api/points/price:', error);
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
    const { privy_id } = req.body;
    if (!privy_id) {
      return res.status(400).json({ success: false, error: 'privy_id is required' });
    }

    const backendHeaders = {
      'Accept': 'application/json',
      'X-Privy-User-Id': privy_id,
      'Content-Type': 'application/json',
    };

    console.log('🔍 Checking if user exists with privy_id:', privy_id);

    const apiUrl = `${BASE_URL}/api/account/privy/${privy_id}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: backendHeaders,
    });

    // Try to parse the JSON response safely
    let respJson;
    try {
      respJson = await response.json();
    } catch (e) {
      console.error('❌ Invalid JSON response from backend:', e);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from backend service',
      });
    }

    console.log('✅ Response from account API:', respJson);

    // Check if user exists
    if (respJson.success==="true") {
      // user exists
      return res.status(200).json({
        success: true,
        exists: 'yes',
        user: respJson.data, // optional, if you want to forward user info
      });
    } else {
      // user not found
      return res.status(200).json({
        success: true,
        exists: 'no',
        message: respJson.message || 'User not found',
      });
    }

  } catch (err) {
    console.error('🔥 Error in check_user_exist:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
});





app.post('/api/get_referal_code', async (req, res) => {
  try {
    const { id, privy_id } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!privy_id) {
      return res.status(400).json({
        success: false,
        error: 'Privy ID is required'
      });
    }

    const backendHeaders = {
      'Accept': 'application/json',
      'X-Privy-User-Id': privy_id,
      'Content-Type': 'application/json',
    };

    console.log('🔍 Fetching balance for:', { userId: id, privyId: privy_id });

    const apiUrl = `${BASE_URL}/api/balance/${id}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: backendHeaders,
    });

    console.log('📡 Backend response status:', response.status);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Backend returned non-JSON response:', contentType);
      return res.status(500).json({
        success: false,
        error: 'Backend returned invalid response format'
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from backend'
      });
    }

    console.log('✅ Backend response data:', data);

    // Handle successful response
    if (response.ok && data.success && data.data) {
      const balanceData = data.data;
      
      // Return the data in the format expected by frontend
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
    // Handle case where data exists but might not have the expected structure (old format)
    else if (data && Array.isArray(data) && data.length > 0) {
      // Legacy support for old response format
      const balanceData = data[0];
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
    // Handle error responses from backend
    else if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Backend error: ${response.status}`;
      console.error('❌ Backend error:', errorMessage);
      
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      } else {
        return res.status(response.status).json({
          success: false,
          error: errorMessage
        });
      }
    }
    // Handle unexpected response structure
    else {
      console.error('❌ Unexpected response structure:', data);
      return res.status(500).json({
        success: false,
        error: 'Unexpected response format from backend'
      });
    }

  } catch (error) {
    console.error('❌ Error in /api/get_referal_code:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle different types of errors
    let errorResponse = {
      success: false,
      error: 'Internal server error',
      message: error.message
    };

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorResponse.error = 'Backend connection failed';
      errorResponse.details = 'Cannot connect to backend server';
    } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      errorResponse.error = 'Backend response parsing error';
      errorResponse.details = 'Invalid JSON response from backend';
    }

    return res.status(500).json(errorResponse);
  }
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