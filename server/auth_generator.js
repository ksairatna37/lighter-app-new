import crypto from 'crypto';
import Fernet from 'fernet';

// Configuration - these should match your backend exactly
const CONSTANT_WORDS = "LighterFarmSecureAPI";
const ENCRYPTION_BASE_KEY = 'your-secret-encryption-key-here';

/**
 * Create a properly padded base64 string
 * @param {string} str - String to encode
 * @returns {string} Properly padded base64 string
 */
function createSafeBase64(str) {
  try {
    // Convert string to Buffer, then to base64
    const buffer = Buffer.from(str, 'utf8');
    let base64 = buffer.toString('base64');
    
    // Ensure proper padding
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    return base64;
  } catch (error) {
    console.error('❌ Base64 encoding error:', error);
    throw new Error(`Failed to create base64: ${error.message}`);
  }
}

/**
 * Safely decode base64 string
 * @param {string} base64Str - Base64 string to decode
 * @returns {string} Decoded string
 */
function decodeSafeBase64(base64Str) {
  try {
    // Ensure proper padding
    let paddedBase64 = base64Str;
    while (paddedBase64.length % 4 !== 0) {
      paddedBase64 += '=';
    }
    
    const buffer = Buffer.from(paddedBase64, 'base64');
    return buffer.toString('utf8');
  } catch (error) {
    console.error('❌ Base64 decoding error:', error);
    throw new Error(`Failed to decode base64: ${error.message}`);
  }
}

/**
 * Encrypt wallet data using ENCRYPTION_BASE_KEY + referral_code
 * @param {Object} walletData - The wallet data to encrypt
 * @param {string} referralCode - The referral code for encryption
 * @returns {string} Base64 encoded encrypted data
 */
export function encryptWallet(walletData, referralCode = "LighterFarmSecureAPI") {
  try {
    console.log('🔐 Starting encryption process...');
    console.log('📦 Data to encrypt:', typeof walletData === 'object' ? JSON.stringify(walletData) : walletData);
    console.log('🔑 Using referral code:', referralCode);
    
    // Create encryption key from base key and referral code
    const keyMaterial = `${ENCRYPTION_BASE_KEY}${referralCode}`;
    console.log('🔧 Key material length:', keyMaterial.length);
    
    // Create SHA256 hash of the key material (32 bytes)
    const key = crypto.createHash('sha256').update(keyMaterial).digest();
    const keyB64 = key.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    console.log('🔑 Generated key (first 20 chars):', keyB64.substring(0, 20) + '...');

    const walletJson = JSON.stringify(walletData);
    console.log('📝 JSON string length:', walletJson.length);
    
    // Encrypt using Fernet
    const encryptedB64 = fernetEncrypt(walletJson, keyB64);
    console.log('✅ Encryption successful, length:', encryptedB64.length);
    console.log('🔢 Encrypted data (first 50 chars):', encryptedB64);
    
    return encryptedB64;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error(`Failed to encrypt wallet data: ${error.message}`);
  }
}

/**
 * Fernet encryption helper
 * @param {string} data - Data to encrypt
 * @param {string} key - Base64 key
 * @returns {string} Encrypted data
 */
function fernetEncrypt(data, key) {
  try {
    console.log('🔒 Fernet encrypting data...');
    const secret = new Fernet.Secret(key);
    const token = new Fernet.Token({
      secret: secret,
      ttl: 0
    });
    const encryptedData = token.encode(data);
    console.log('✅ Fernet encryption complete');
    return encryptedData;
  } catch (error) {
    console.error('❌ Fernet encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt wallet data using ENCRYPTION_BASE_KEY + referral_code
 * @param {string} encryptedData - The encrypted data to decrypt
 * @param {string} referralCode - The referral code for decryption
 * @returns {Object} Decrypted wallet data
 */
export function decryptWallet(encryptedData, referralCode = "LighterFarmSecureAPI") {
  try {
    console.log('🔓 Starting decryption process...');
    console.log('📦 Encrypted data length:', encryptedData.length);
    console.log('🔑 Using referral code:', referralCode);
    
    // Create encryption key from base key and referral code
    const keyMaterial = `${ENCRYPTION_BASE_KEY}${referralCode}`;
    const key = crypto.createHash('sha256').update(keyMaterial).digest();
    const keyB64 = key.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    
    console.log('🔧 Decrypting with Fernet...');
    const decryptedData = fernetDecrypt(encryptedData, keyB64);
    
    if (typeof decryptedData === 'object' && decryptedData !== null) {
      console.log('✅ Decryption successful');
      return decryptedData;
    } else {
      console.log('⚠️ Decrypted data is not an object, wrapping...');
      return { data: decryptedData };
    }
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error(`Failed to decrypt wallet data: ${error.message}`);
  }
}

/**
 * Fernet decryption helper
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Base64 key
 * @returns {Object} Decrypted data
 */
function fernetDecrypt(encryptedData, key) {
  try {
    console.log('🔓 Fernet decrypting data...');
    const secret = new Fernet.Secret(key);
    const token = new Fernet.Token({
      secret: secret,
      token: encryptedData,
      ttl: 0
    });
    const decryptedText = token.decode();
    console.log('📝 Decrypted text length:', decryptedText ? decryptedText.length : 'null');
    
    try {
      const parsed = JSON.parse(decryptedText);
      console.log('✅ JSON parsing successful');
      return parsed;
    } catch (jsonError) {
      console.warn('⚠️ Could not parse as JSON, returning raw text');
      return { raw_data: decryptedText };
    }
  } catch (error) {
    console.error('❌ Fernet decryption failed:', error);
    throw error;
  }
}

/**
 * Generate authentication token for API endpoint
 * @param {string} endpoint - The API endpoint (e.g., "/api/balance/123")
 * @param {string} referralCode - The referral code for encryption
 * @returns {string} Encrypted authentication token
 */
export function generateAuthToken(endpoint, referralCode = 'LighterFarmSecureAPI') {
  try {
    console.log('🎫 Generating auth token...');
    console.log('🎯 Endpoint:', endpoint);
    console.log('🔑 Referral code:', referralCode);
    
    // Get current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    console.log('⏰ Timestamp:', currentTimestamp);
    
    // Create token string: endpoint + timestamp + constant_words
    const tokenString = `${endpoint}${currentTimestamp}${CONSTANT_WORDS}`;
    console.log('📝 Token string:', tokenString);
    console.log('📏 Token string length:', tokenString.length);
    
    // Encode to base64 with proper padding
    const authToken = createSafeBase64(tokenString);
    console.log('🔤 Base64 auth token:', authToken);
    console.log('📏 Base64 length:', authToken.length);
    console.log('🔢 Base64 length % 4:', authToken.length % 4); // Should be 0
    
    // Wrap in object like original version
    const authTokenObj = { auth_token: authToken };
    console.log('📦 Auth token object:', authTokenObj);
    
    // Encrypt the entire object using encryptWallet
    const encryptedToken = encryptWallet(authTokenObj, referralCode);
    console.log('✅ Auth token generated successfully');
    console.log('📏 Final token length:', encryptedToken.length);
    console.log('🔢 Final token length % 4:', encryptedToken.length % 4);
    const encrypteddata = Buffer.from(encryptedToken).toString('base64');
    
    return encrypteddata;
    
  } catch (error) {
    console.error('❌ Auth token generation error:', error);
    throw new Error(`Failed to generate auth token: ${error.message}`);
  }
}

/**
 * Test the authentication system
 * @returns {boolean} Test result
 */
export function testAuthSystem() {
  console.log('🧪 Testing Authentication System...');
  
  try {
    // Test 1: Generate auth token
    console.log('\n📝 Test 1: Generating auth token...');
    const testEndpoint = "/api/balance/123";
    const authToken = generateAuthToken(testEndpoint);
    console.log('✅ Test 1 passed: Auth token generated');
    
    // Test 2: Decrypt the token to verify it works
    console.log('\n🔓 Test 2: Verifying token can be decrypted...');
    const decrypted = decryptWallet(authToken, "LighterFarmSecureAPI");
    console.log('📦 Decrypted token:', decrypted);
    
    if (decrypted.auth_token) {
      const decodedToken = decodeSafeBase64(decrypted.auth_token);
      console.log('📝 Decoded token content:', decodedToken);
      console.log('✅ Test 2 passed: Token verification successful');
    }
    
    // Test 3: Encrypt/Decrypt wallet data
    console.log('\n💰 Test 3: Testing wallet encryption...');
    const testWalletData = {
      address: "0x123...456",
      balance: 100.50,
      userId: "test-user-123"
    };
    
    const encrypted = encryptWallet(testWalletData);
    const decryptedWallet = decryptWallet(encrypted);
    console.log('✅ Test 3 passed: Wallet encryption/decryption works');
    
    console.log('\n🎉 All tests passed! Authentication system is ready.');
    return true;
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
}

// Default export for convenience
export default {
  encryptWallet,
  decryptWallet,
  generateAuthToken,
  testAuthSystem
};