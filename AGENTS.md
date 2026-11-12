# Architecture rules
- Use a shared Turnstile frontend hook and edge verification module for public submissions; verify each token exactly once before side effects and leave payment reconciliation unchallenged.
- Initiate membership and its payment in the Pesapal handler using one membership-scoped verification token, so a single-use token never travels to two endpoints.