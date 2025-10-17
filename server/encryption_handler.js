/**
 * Encryption Handler for LighterFarm - FIXED WITH API CALLS
 * Based on backend team's reference implementation
 */

import apiClient from '../src/lib/apiClient';  // ✅ Import apiClient for authenticated requests
import fernet from 'fernet';
import { Buffer } from 'buffer';

// Make Buffer globally available for fernet package
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  globalThis.Buffer = Buffer;
}

// ✅ CRITICAL: This must match your backend's encryption key
const ENCRYPTION_BASE_KEY = 'your-secret-encryption-key-here';
//this key value is not placeholder, it should be as it is "your-secret-encryption-key-here"

// ============================================================================
// UTILITY FUNCTIONS - MATCHING BACKEND IMPLEMENTATION
// ============================================================================

function encodeJsonToBase64(jsonData) {
  const encryptText = `'id':${jsonData.id},'privy_id':${jsonData.privy_id},'wallet_address':${jsonData.wallet_address},'usdl_balance':${jsonData.usdl_balance},'points_balance':${jsonData.points_balance},'staked_amount':${jsonData.staked_amount},'referral_code':${jsonData.referral_code},'referrer_id':${jsonData.referrer_id},'referral_count':${jsonData.referral_count},'total_points':${jsonData.total_points},'bonus_points':${jsonData.bonus_points},'total_referral_rewards':${jsonData.total_referral_rewards},'referral_rewards_earned':${jsonData.referral_rewards_earned},'created_at':${jsonData.created_at}`;
  return btoa(encryptText);
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToUrlSafeBase64(bytes) {
  const standardBase64 = btoa(String.fromCharCode.apply(null, bytes));
  return standardBase64.replace(/\+/g, '-').replace(/\//g, '_');
}

async function deriveFernetKey(encodedText) {
  const keyMaterial = `${ENCRYPTION_BASE_KEY}${encodedText}`;
  const keyHash = await sha256(keyMaterial);
  const keyBytes = hexToBytes(keyHash);
  return bytesToUrlSafeBase64(keyBytes);
}

function fernetDecrypt(encryptedData, fernetKey) {
  try {
    const secret = new fernet.Secret(fernetKey);
    const token = new fernet.Token({ secret, token: encryptedData, ttl: 0 });
    const decryptedData = token.decode();

    try {
      return JSON.parse(decryptedData);
    } catch {
      return eval('(' + decryptedData + ')');
    }
  } catch (error) {
    throw new Error(`Fernet decryption error: ${error.message}`);
  }
}

async function decryptWallet(encryptedData, encodedText) {
  const fernetKey = await deriveFernetKey(encodedText);
  return fernetDecrypt(encryptedData, fernetKey);
}

// ============================================================================
// TWO-LAYER DECRYPTION - MATCHING BACKEND FLOW
// ============================================================================

async function decryptData(encryptedDataString, encodedText) {
  try {
    const decodedEncryptedData = atob(encryptedDataString);
    const decryptedData = await decryptWallet(decodedEncryptedData, encodedText);

    if (!decryptedData.encrypted_data)
      throw new Error('No encrypted_data field in layer 1 result');

    if (!decryptedData.referral_code)
      throw new Error('No referral_code field in layer 1 result');

    const decodedKeys = atob(decryptedData.encrypted_data);
    const decryptedKeys = await decryptWallet(decodedKeys, decryptedData.referral_code);

    return {
      success: true,
      private_key: decryptedKeys.private_key,
      decryptionMethod: 'decrypted_data'
    };
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// ============================================================================
// API INTERACTION - ✅ FIXED WITH ACTUAL API CALLS
// ============================================================================

/**
 * Fetches account data for a specific user
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Account data object
 */
async function getAccountData(userId) {
  try {
    
    // ✅ Call endpoint GET /api/account/{id} using apiClient (auto-authenticated)
    const response = await apiClient.get(`/api/account/${userId}`);
    
    
    // Extract account data from response
    const accountData = response.data.data || response.data;
    
    if (!accountData) {
      throw new Error('Account data not found in API response');
    }
    
    // Validate required fields for encryption
    const requiredFields = [
      'id', 'privy_id', 'wallet_address', 'referral_code'
    ];
    
    for (const field of requiredFields) {
      if (accountData[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    
    return accountData;
    
  } catch (error) {
    console.error('❌ Failed to retrieve account data:', {
      userId,
      error: error.message,
      response: error.response?.data
    });
    
    throw new Error(`Failed to retrieve account information: ${error.message}`);
  }
}

/**
 * Fetches encrypted private key for a specific user
 * @param {string|number} userId - User ID
 * @returns {Promise<string>} Encrypted private key (base64 encoded)
 */
async function getEncryptedPrivateKey(userId) {
  try {

    
    // ✅ Call endpoint GET /api/account/{id}/encrypted using apiClient (auto-authenticated)
    const response = await apiClient.get(`/api/account/${userId}/encrypted`);
    
    
    // Extract encrypted data from response
    // Try multiple possible response structures
    const encryptedData = 
      response.data.data || 
      response.data.encrypted_private_key || 
      response.data.encrypted_data;
    
    if (!encryptedData) {
      console.error('❌ Response structure:', response.data);
      throw new Error('Encrypted private key not found in API response');
    }
    
    // Validate it's a non-empty string
    if (typeof encryptedData !== 'string' || encryptedData.length === 0) {
      throw new Error('Encrypted private key is invalid or empty');
    }
    

    
    return encryptedData;
    
  } catch (error) {
    console.error('❌ Failed to retrieve encrypted private key:', {
      userId,
      error: error.message,
      response: error.response?.data
    });
    
    throw new Error(`Failed to retrieve encrypted private key: ${error.message}`);
  }
}

// ============================================================================
// MAIN EXPORT FUNCTION - MATCHING BACKEND executeCompleteFlow
// ============================================================================

/**
 * Retrieves and decrypts the private key for a user
 * 
 * Process:
 * 1. Fetch account data (GET /api/account/{id})
 * 2. Encode account data to base64 (for key derivation)
 * 3. Fetch encrypted private key (GET /api/account/{id}/encrypted)
 * 4. Decrypt private key using two-layer Fernet decryption
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Result object with success/error
 */
export async function retrievePrivateKey(userId) {
  try {

    
    // Step 1: Get account data
    const accountData = await getAccountData(userId);
    
    // Step 2: Encode account data for key derivation

    const encodedText = encodeJsonToBase64(accountData);

    
    // Step 3: Get encrypted private key
    const encryptedDataString = await getEncryptedPrivateKey(userId);
    
    // Step 4: Decrypt private key (two-layer decryption)
    const decryptedData = await decryptData(encryptedDataString, encodedText);


    return {
      success: true,
      privateKey: decryptedData.private_key,
      warning: '⚠️ NEVER share your private key with anyone! Anyone with this key has FULL ACCESS to your wallet!'
    };
    
  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('   PRIVATE KEY RETRIEVAL FAILED');
    console.error('   ========================================');
    console.error('   User ID:', userId);
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   ========================================\n');
    
    return {
      success: false,
      error: error.message || 'Failed to retrieve private key. Please try again.',
      details: error.stack
    };
  }
}

export default { retrievePrivateKey };
