/**
 * Encryption Handler for LighterFarm - FIXED TO MATCH BACKEND
 * Based on backend team's reference implementation
 */

import axios from 'axios';
import fernet from 'fernet';
import { Buffer } from 'buffer';

// Make Buffer globally available for fernet package
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  globalThis.Buffer = Buffer;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://app-lighterfarm-hxgcccdkf8c5h9gw.centralindia-01.azurewebsites.net';

// ✅ CRITICAL: This must match your backend's encryption key
const ENCRYPTION_BASE_KEY = 'your-secret-encryption-key-here';

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
// API INTERACTION
// ============================================================================

async function getAccountData(userId, token) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/account/${userId}`,
      { headers: { Authorization: token } }
    );
    const accountData = response.data.data || response.data;
    return accountData;
  } catch {
    throw new Error('Failed to retrieve account information');
  }
}

async function getEncryptedPrivateKey(userId, token) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/account/${userId}/encrypted`,
      { headers: { Authorization: token } }
    );
    const encryptedData = response.data.data || response.data.encrypted_private_key;
    if (!encryptedData) throw new Error('Encrypted private key not found in API response');
    return encryptedData;
  } catch {
    throw new Error('Failed to retrieve encrypted private key');
  }
}

// ============================================================================
// MAIN EXPORT FUNCTION - MATCHING BACKEND executeCompleteFlow
// ============================================================================

export async function retrievePrivateKey(userId, token) {
  try {
    const accountData = await getAccountData(userId, token);
    const encodedText = encodeJsonToBase64(accountData);
    const encryptedDataString = await getEncryptedPrivateKey(userId, token);
    const decryptedData = await decryptData(encryptedDataString, encodedText);

    return {
      success: true,
      privateKey: decryptedData.private_key,
      warning: '⚠️ NEVER share your private key with anyone! Anyone with this key has FULL ACCESS to your wallet!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to retrieve private key. Please try again.'
    };
  }
}

export default { retrievePrivateKey };
