/**
 * Frontend wrapper for the existing auth_generator.js
 * This imports the server's auth generator to ensure consistency
 */

// Import the existing auth generator from server
import { generateAuthToken as serverGenerateAuthToken } from '../../server/auth_generator.js';

/**
 * Generate authentication token for API endpoint
 * Uses the existing server auth_generator.js to ensure consistency
 * @param endpoint - The API endpoint (e.g., "/api/balance/123")
 * @returns string - The generated auth token
 */
export function generateAuthToken(endpoint: string): string {
  try {
    // Use the existing server auth generator
    return serverGenerateAuthToken(endpoint);
  } catch (error) {
    console.error('❌ Auth token generation error:', error);
    throw new Error(`Failed to generate auth token: ${error.message}`);
  }
}

export default {
  generateAuthToken
};
