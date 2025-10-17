import crypto from 'crypto';
import Fernet from 'fernet';

// Configuration - must match your backend
const CONSTANT_WORDS = "LighterFarmSecureAPI";
const ENCRYPTION_BASE_KEY = 'your-secret-encryption-key-here';
const TOKEN_VALIDITY_WINDOW = 300; // 5 minutes (300 seconds)

/**
 * Safely decode base64 string
 */
function decodeSafeBase64(base64Str) {
  try {
    let paddedBase64 = base64Str;
    while (paddedBase64.length % 4 !== 0) {
      paddedBase64 += '=';
    }
    const buffer = Buffer.from(paddedBase64, 'base64');
    return buffer.toString('utf8');
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`);
  }
}

/**
 * Decrypt wallet data using Fernet
 */
function fernetDecrypt(encryptedData, key) {
  try {
    const secret = new Fernet.Secret(key);
    const token = new Fernet.Token({
      secret: secret,
      token: encryptedData,
      ttl: 0
    });
    const decryptedText = token.decode();
    
    try {
      return JSON.parse(decryptedText);
    } catch (jsonError) {
      return { raw_data: decryptedText };
    }
  } catch (error) {
    throw new Error('Fernet decryption failed');
  }
}

/**
 * Decrypt the authentication token
 */
function decryptAuthToken(encryptedToken, referralCode = 'LighterFarmSecureAPI') {
  try {
    // Decode from base64 wrapper
    const fernetToken = Buffer.from(encryptedToken, 'base64').toString('utf8');
    
    // Create decryption key
    const keyMaterial = `${ENCRYPTION_BASE_KEY}${referralCode}`;
    const key = crypto.createHash('sha256').update(keyMaterial).digest();
    const keyB64 = key.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    
    // Decrypt using Fernet
    const decrypted = fernetDecrypt(fernetToken, keyB64);
    
    return decrypted;
  } catch (error) {
    throw new Error(`Token decryption failed: ${error.message}`);
  }
}

/**
 * Verify authentication token middleware
 */
export const verifyAuthToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }

    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Token is empty.'
      });
    }

    // Decrypt token
    const decrypted = decryptAuthToken(token);
    
    if (!decrypted.auth_token) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token format',
        message: 'Token does not contain auth_token field'
      });
    }

    // Decode the auth_token to get endpoint, timestamp, and constant words
    const decodedToken = decodeSafeBase64(decrypted.auth_token);
    
    // Extract timestamp (it's at the end before CONSTANT_WORDS)
    // Format: endpoint + timestamp + CONSTANT_WORDS
    const constantWordsIndex = decodedToken.lastIndexOf(CONSTANT_WORDS);
    
    if (constantWordsIndex === -1) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'Token does not contain valid signature'
      });
    }

    // Extract timestamp (between endpoint and CONSTANT_WORDS)
    const beforeConstant = decodedToken.substring(0, constantWordsIndex);
    
    // Find where timestamp starts (last 10 digits before CONSTANT_WORDS)
    const timestampMatch = beforeConstant.match(/(\d{10})$/);
    
    if (!timestampMatch) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'Token does not contain valid timestamp'
      });
    }

    const tokenTimestamp = parseInt(timestampMatch[1]);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTimestamp - tokenTimestamp);

    // Check if token is within validity window
    if (timeDiff > TOKEN_VALIDITY_WINDOW) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: `Token is ${timeDiff} seconds old. Maximum allowed is ${TOKEN_VALIDITY_WINDOW} seconds.`,
        expired: true
      });
    }

    // Extract endpoint
    const endpoint = beforeConstant.substring(0, beforeConstant.length - 10);
    
    // Attach decoded info to request
    req.auth = {
      endpoint,
      timestamp: tokenTimestamp,
      verified: true
    };
    
    console.log('✅ Token verified:', {
      endpoint,
      age: timeDiff + 's'
    });
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    return res.status(403).json({
      success: false,
      error: 'Token verification failed',
      message: error.message
    });
  }
};

/**
 * Optional auth middleware (doesn't reject if token is invalid)
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decrypted = decryptAuthToken(token);
      const decodedToken = decodeSafeBase64(decrypted.auth_token);
      req.auth = { verified: true, token: decodedToken };
    }
    
    next();
  } catch (error) {
    next();
  }
};
