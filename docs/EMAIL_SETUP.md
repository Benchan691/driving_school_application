# Email Setup Guide

## Problem: Email Authentication Failed

If you're seeing the error: **"Failed to send reply: Failed to send reply"** or **"Invalid login: 535-5.7.8 Username and Password not accepted"**, this means your Gmail credentials are not properly configured.

## Solution: Set Up Gmail App Password

Gmail requires an **App Password** (not your regular password) when using SMTP authentication. Follow these steps:

### Step 1: Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable 2-Step Verification

### Step 2: Generate an App Password

1. Still in **Security** settings, scroll down to **Signing in to Google**
2. Click on **App passwords** (you'll only see this after enabling 2-Step Verification)
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter a name like "Driving School App"
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables

Update your `.env.development` file with the correct credentials:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com          # Your full Gmail address
EMAIL_PASS=abcdefghijklmnop              # The 16-character App Password (no spaces)
EMAIL_FROM=your-email@gmail.com          # Usually same as EMAIL_USER
EMAIL_HOST=smtp.gmail.com                # Gmail SMTP server
EMAIL_PORT=587                           # Gmail SMTP port
```

**Important Notes:**
- `EMAIL_USER` should be your **full Gmail address** (e.g., `thetruthdrivingschool@gmail.com`)
- `EMAIL_PASS` should be the **16-character App Password** (remove spaces if copied with spaces)
- Do NOT use your regular Gmail password - it won't work!

### Step 4: Restart Services

After updating the environment variables, restart the backend service:

```bash
docker-compose restart backend
```

Or restart all services:

```bash
docker-compose down
docker-compose up -d
```

### Step 5: Test Email

Try sending a reply to a contact message again. The email should now send successfully.

## Troubleshooting

### Still Getting Authentication Errors?

1. **Verify App Password**: Make sure you copied the App Password correctly (16 characters, no spaces)
2. **Check 2FA**: Ensure 2-Step Verification is enabled on your Google Account
3. **Verify Email Address**: Make sure `EMAIL_USER` matches the Gmail account where you generated the App Password
4. **Check Logs**: View backend logs for detailed error messages:
   ```bash
   docker-compose logs backend | grep -i email
   ```

### Alternative: Use a Different Email Service

If you prefer not to use Gmail, you can configure other email services:

#### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-access-key
EMAIL_PASS=your-aws-secret-key
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate App Passwords** periodically
4. **Use different App Passwords** for different applications
5. **Monitor email activity** in your Google Account security settings

## Need Help?

If you continue to have issues:
1. Check the backend logs: `docker-compose logs backend`
2. Verify your Google Account security settings
3. Try generating a new App Password
4. Ensure your Gmail account is not locked or restricted

