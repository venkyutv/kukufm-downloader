import fs from 'fs';
import path from 'path';

/**
 * Reads cookies from cookies.json and formats as a single Cookie header string.
 * @param cookiesPath Path to cookies.json
 */
export function getCookieHeaderString(cookiesPath: string): string {
  const cookiesRaw = fs.readFileSync(cookiesPath, 'utf-8');
  const cookies = JSON.parse(cookiesRaw);
  // Only use cookies with a value and name
  const cookiePairs = cookies
    .filter((c: any) => c.name && c.value)
    .map((c: any) => `${c.name}=${c.value}`);
  return cookiePairs.join('; ');
}
