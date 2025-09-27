# TODO: Modify Login Page for Role Selection

## Tasks

- [x] Modify login.html: Add radio buttons for role selection (User/Admin), update styling for modern look.
- [x] Modify backend/routes/auth.js: Update login endpoint to accept 'role' in request body, check if user.role matches the requested role, return error if not.
- [x] Modify login.html JS: Send selected role in login request, on success redirect based on user.role (admin to admin.html, user to dashboard.html).
- [ ] Test login as user and admin with appropriate accounts.
- [ ] Ensure error handling for invalid role selection.
