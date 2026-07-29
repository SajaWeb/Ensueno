/**
 * Centralized JWT environment variable handler.
 * Ensures JWT_SECRET is loaded strictly from environment variables without exposing fallback keys.
 */

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Security Error: JWT_SECRET environment variable is missing.');
  }
  return secret;
}

export function getJwtSecretEncoded(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}
