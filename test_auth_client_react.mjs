import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react';
const authClient = createAuthClient("https://ep-wandering-bonus-acj4zwvo.neonauth.sa-east-1.aws.neon.tech/neondb/auth", {
  adapter: BetterAuthReactAdapter(),
});
if (authClient.getJWTToken) {
  console.log("getJWTToken exists on authClient");
} else {
  console.log("getJWTToken DOES NOT EXIST");
}
