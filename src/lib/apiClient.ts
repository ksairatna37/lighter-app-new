/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Fernet encryption for token generation
// Note: You'll need to install: npm install fernet
declare const Buffer: any;

// Configuration - must match backend
const CONSTANT_WORDS = "LighterFarmSecureAPI";
const ENCRYPTION_BASE_KEY = 'your-secret-encryption-key-here';
const DEFAULT_REFERRAL_CODE = 'LighterFarmSecureAPI';

// Determine API base URL
const getBaseURL = (): string => {
  if (window.location.hostname === 'app.lighter.farm') {
    return 'https://app.lighter.farm';
  }
  
  if (window.location.hostname === 'app-lighterfarm-hxgcccdkf8c5h9gw.centralindia-01.azurewebsites.net') {
    return 'https://app-lighterfarm-hxgcccdkf8c5h9gw.centralindia-01.azurewebsites.net';
  }
  
  return 'http://localhost:8080';
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Create safely padded base64
 */
function createSafeBase64(str: string): string {
  const buffer = Buffer.from(str, 'utf8');
  let base64 = buffer.toString('base64');
  
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  
  return base64;
}

/**
 * Import and use Fernet (will be loaded dynamically)
 */
let Fernet: any = null;

// Dynamically import fernet
const loadFernet = async () => {
  if (!Fernet) {
    Fernet = (await import('fernet')).default;
  }
  return Fernet;
};

/**
 * Fernet encryption helper
 */
async function fernetEncrypt(data: string, key: string): Promise<string> {
  const FernetLib = await loadFernet();
  const secret = new FernetLib.Secret(key);
  const token = new FernetLib.Token({
    secret: secret,
    ttl: 0
  });
  return token.encode(data);
}

/**
 * Encrypt wallet data using Fernet
 */
async function encryptWallet(walletData: any, referralCode: string = DEFAULT_REFERRAL_CODE): Promise<string> {
  try {
    // Import crypto-browserify for browser environment
    const crypto = (await import('crypto-browserify')).default;
    
    // Create encryption key
    const keyMaterial = `${ENCRYPTION_BASE_KEY}${referralCode}`;
    const key = crypto.createHash('sha256').update(keyMaterial).digest();
    const keyB64 = key.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const walletJson = JSON.stringify(walletData);
    
    // Encrypt using Fernet
    const encryptedB64 = await fernetEncrypt(walletJson, keyB64);
    
    return encryptedB64;
  } catch (error: any) {
    console.error('❌ Encryption error:', error);
    throw new Error(`Failed to encrypt: ${error.message}`);
  }
}

/**
 * Generate authentication token for API endpoint
 */
export async function generateAuthToken(endpoint: string, referralCode: string = DEFAULT_REFERRAL_CODE): Promise<string> {
  try {
    console.log('🎫 Generating auth token for:', endpoint);
    
    // Get current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create token string
    const tokenString = `${endpoint}${currentTimestamp}${CONSTANT_WORDS}`;
    
    // Encode to base64
    const authToken = createSafeBase64(tokenString);
    
    // Wrap in object
    const authTokenObj = { auth_token: authToken };
    
    // Encrypt the entire object
    const encryptedToken = await encryptWallet(authTokenObj, referralCode);
    
    // Wrap in base64
    const finalToken = Buffer.from(encryptedToken).toString('base64');
    
    console.log('✅ Auth token generated');
    
    return finalToken;
  } catch (error: any) {
    console.error('❌ Auth token generation error:', error);
    throw new Error(`Failed to generate auth token: ${error.message}`);
  }
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
const TOKEN_VALIDITY = 4 * 60 * 1000; // 4 minutes (less than 5-minute server window)

/**
 * Get or generate auth token for endpoint
 */
const getAuthTokenForEndpoint = async (endpoint: string): Promise<string> => {
  // Check if cached token is still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🎫 Using cached token');
    return cachedToken;
  }
  
  console.log('🔄 Generating new auth token...');
  
  // Generate new token
  const token = await generateAuthToken(endpoint);
  
  // Cache it
  cachedToken = token;
  tokenExpiry = Date.now() + TOKEN_VALIDITY;
  
  return token;
};

/**
 * Clear cached token
 */
export const clearAuthToken = () => {
  cachedToken = null;
  tokenExpiry = null;
  console.log('🗑️ Auth token cleared');
};

// ============================================
// REQUEST INTERCEPTOR - Add auth token
// ============================================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token for public endpoints
    const publicEndpoints = ['/api/health'];
    const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (isPublic) {
      return config;
    }
    
    try {
      // Generate token for this specific endpoint
      const endpoint = config.url || '/api/unknown';
      const token = await getAuthTokenForEndpoint(endpoint);
      
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      
      console.log('📤 Request with auth:', config.method?.toUpperCase(), config.url);
    } catch (error) {
      console.error('❌ Failed to add auth token:', error);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Handle token expiration
// ============================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Token expired, refreshing...');
      
      originalRequest._retry = true;
      
      try {
        // Clear expired token
        clearAuthToken();
        
        // Generate new token
        const endpoint = originalRequest.url || '/api/unknown';
        const newToken = await getAuthTokenForEndpoint(endpoint);
        
        // Update request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry request
        console.log('🔁 Retrying request with new token...');
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    // Log errors
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
    } else {
      console.error('❌ Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
