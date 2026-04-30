# Demo Auth Smoke Test Checklist

1. Register with `tj@careindeed.com` on `/register`.
2. Confirm you are redirected to `/check-email`.
3. Verify setup email arrives from `FROM_EMAIL`.
4. Open setup link: `/setup-account?token=...`.
5. Submit first name, last name, password, confirm password.
6. Confirm setup succeeds and redirects to `/login`.
7. Login with email/password and confirm redirect to `/dashboard`.
8. Refresh browser and confirm session persists.
9. Click `Logout` and confirm redirect to `/login`.
10. Register non-careindeed email (e.g., gmail/yahoo).
11. Confirm message: `Registration request received. Administrator approval is required.`
12. Confirm non-careindeed account cannot log in.
13. Use expired token and verify clean invalid/expired message.
14. Reuse a completed token and verify rejection.
15. Use resend on `/check-email` and verify new setup email for pending careindeed user.
