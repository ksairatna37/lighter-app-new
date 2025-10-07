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
      .select('referral_code')
      .eq('wallet_address', wallet_address);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (data && data.length > 0 && data[0].referral_code) {
      return res.json({ referral_code: data[0].referral_code });
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