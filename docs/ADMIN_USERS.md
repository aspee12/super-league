# Creating Users & Super Admin (Payload)

## Troubleshooting: "Email or password incorrect" in Admin

If you see this with correct credentials:

1. **Use lowercase email** – Login looks up by lowercase email. Enter your email in lowercase (e.g. `admin@example.com`).
2. **Normalize existing emails** – If the user was created with mixed case, run:
   ```bash
   npm run normalize:user-emails
   ```
   Then try logging in again with the **lowercase** email.
3. **Create first user** – If you have no users, go to `/admin` and use the **Create First User** form. Use a simple password and **lowercase** email.
4. **Forgot password** – Use the "Forgot password?" link on the admin login page to reset.

---

## Option 1: Create user in Payload Admin (recommended)

1. **Open Payload Admin**  
   Go to `/admin` in your app (e.g. `http://localhost:3000/admin`).

2. **First user (empty database)**  
   If there are no users, Payload shows a **Create First User** screen. Enter:
   - Email
   - Password  

   That user is created with default **Role: Admin**.

3. **Make the first user Super Admin**  
   After logging in to the admin panel:
   - Open **Users** in the sidebar.
   - Click the user you just created.
   - Set **Role** to **Super Admin**.
   - Enable **Can Add Team** under Permissions.
   - Save.

   You can now use this account to log in at `/login` and get the “Add Team” permission in the client app.

4. **Add more users**  
   As a **Super Admin** you can create and edit other users from **Users** in the admin panel. Only Super Admins can delete users or change other users’ roles/permissions.

---

## Option 2: Seed Super Admin (after first user exists)

If you already created one user via the admin panel but they still have role **Admin**, you can promote them to **Super Admin** with the seed script:

```bash
npm run seed:super-admin
```

This script:

- Connects to your database using `DATABASE_URL` from `.env`.
- Finds the first user (by creation date).
- Sets `role` to `super_admin` and `permissions.canAddTeam` to `true`.

**Requirements:**

- At least one user must already exist (create them in `/admin` first).
- `.env` must contain a valid `DATABASE_URL` (MongoDB connection string).

After running the script, log in at `/login` with that user’s email and password; they will have Super Admin and “Add Team” permissions.
