# Turnstile integration
- [x] Add existing widget to public forms and payment initiation.
- [x] Enforce server verification, action and hostname checks without changing callbacks.
- [x] Test rejection rules and inspect the live forms (15 automated checks, seven live missing-token rejections, desktop/mobile checks).
- [ ] Confirm a fresh real token succeeds and replay fails against the deployed backend; blocked by the hosted preview sign-in wall and Cloudflare not completing a challenge in the automated local browser. Requires a visitor completing verification on the preview or published site.