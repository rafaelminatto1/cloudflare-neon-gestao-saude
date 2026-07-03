import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthVanillaAdapter } from '@neondatabase/neon-js';
const authClient = createAuthClient("https://ep-wandering-bonus-acj4zwvo.neonauth.sa-east-1.aws.neon.tech/neondb/auth", {
  adapter: BetterAuthVanillaAdapter(),
});
const t = await authClient.getJWTToken();
console.log("Token:", t);
