# 📧 Email Not Arriving? - Troubleshooting Guide

## Common Issues with Supabase Email

Supabase has email sending limitations, especially on the free tier. Here's how to fix it.

---

## ✅ **Quick Fixes (Try These First)**

### **1. Check Spam/Promotions Folder**
- Look in your email's **Spam**, **Promotions**, **Updates** folders
- Add `noreply@...supabase.co` to safe senders list

### **2. Check Email Verification Requirements**
In Supabase Dashboard:
1. Go to **Authentication** → **Email**
2. Look for **"Confirm email before signing in"** setting
3. If email confirmations are **disabled**, users can sign up without confirming email
4. If **enabled**, email confirmation is required

### **3. Verify Email in Settings**
1. Go to **Authentication** → **Providers**
2. Check if **Email** provider is toggled ON
3. Verify email configuration status

---

## 🔧 **Solution 1: Enable Custom SMTP (Best for Production)**

Using custom SMTP ensures reliable email delivery.

### **Setup with SendGrid (Recommended)**

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up (free tier has 100 emails/day)

2. **Generate API Key**
   - In SendGrid dashboard, go to **Settings** → **API Keys**
   - Create new key with **Mail Send** permissions
   - Copy the API key

3. **Configure Supabase**
   - Go to your Supabase project
   - Navigate to **Authentication** → **Email**
   - Toggle **"Custom SMTP"** ON
   - Fill in:
     - **Sender Email**: `noreply@yourdomain.com` (or your email)
     - **Sender Name**: Your App Name
     - **SMTP Host**: `smtp.sendgrid.net`
     - **SMTP Port**: `587`
     - **SMTP User**: `apikey`
     - **SMTP Password**: `[Your SendGrid API Key]`
   - Click **Save**

---

## 🔧 **Solution 2: Use Gmail SMTP**

### **Setup Gmail as Email Provider**

1. **Enable 2-Factor Authentication**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - In Google Account, go to **Security** → **App passwords**
   - Select **Mail** and **Windows Computer** (or your device)
   - Google will generate a 16-character password
   - Copy it

3. **Configure Supabase**
   - Go to Supabase → **Authentication** → **Email**
   - Toggle **"Custom SMTP"** ON
   - Fill in:
     - **Sender Email**: `your_gmail@gmail.com`
     - **Sender Name**: Your App Name
     - **SMTP Host**: `smtp.gmail.com`
     - **SMTP Port**: `587`
     - **SMTP User**: `your_gmail@gmail.com`
     - **SMTP Password**: `[16-char app password from Google]`
   - Click **Save**

---

## 🧪 **Solution 3: Test if Emails Are Being Sent**

### **Check Supabase Audit Logs**

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Audit Logs**
3. Look for your password reset request
4. Check if it shows "Success" or "Error"

### **Check Email Templates**

1. Go to **Authentication** → **Email Templates**
2. Select **Password Reset** template
3. Verify the email template content is not empty
4. Check that **"Enable"** is toggled ON

---

## 🚀 **Solution 4: Disable Email Confirmation (Temporary)**

For development/testing, you can disable email confirmations:

1. Go to Supabase → **Authentication** → **Email**
2. Toggle **"Confirm email before signing in"** OFF
3. Users can now sign up and log in immediately without email verification

⚠️ **Note**: This is NOT recommended for production.

---

## 📋 **Email Settings Checklist**

- [ ] Email provider is enabled
- [ ] Custom SMTP is configured (if needed)
- [ ] Email templates are enabled
- [ ] Sender email is valid
- [ ] SMTP credentials are correct
- [ ] Check spam folder
- [ ] Test email sending via Audit Logs
- [ ] Verified email address in test account

---

## 🆘 **Still Not Working?**

### **Option A: Use Auth Without Email Confirmation**
Update `src/lib/database.ts`:
```typescript
export async function resetPassword(email: string): Promise<{
  error: string | null;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    // If no SMTP configured, show manual reset option
    if (error?.message.includes("email")) {
      console.warn("Email sending failed. Please contact support.");
      return { error: "Email service temporarily unavailable. Please try again later." };
    }

    return { error: error?.message || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Password reset failed",
    };
  }
}
```

### **Option B: Add Alternative Login Methods**
- Implement phone number verification
- Add social login (Google, GitHub)
- Use magic links without email

---

## 📞 **Supabase Support**

If none of these work:
1. Check [Supabase Status Page](https://status.supabase.com)
2. Visit [Supabase Discord](https://discord.supabase.com)
3. Check [GitHub Issues](https://github.com/supabase/supabase/issues)

---

## 💡 **Pro Tips**

1. **Use SendGrid**: Most reliable and scalable
2. **Test with Test Account**: Create a test email to verify
3. **Check Logs**: Always check Supabase Audit Logs first
4. **Monitor Emails**: Keep track of email delivery in Supabase dashboard
5. **Set Reply-To Address**: Configure reply-to for better UX

---

## ✨ **Next Steps**

1. Choose a solution above
2. Configure in Supabase
3. Test with a fresh password reset
4. Check email within 2-3 minutes
5. Verify email in spam folder if not found in inbox

**Recommended**: Use SendGrid for best reliability! 🚀
