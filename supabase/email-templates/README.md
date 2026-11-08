# KHITTA email templates

Branded sign-up and password-reset emails, in English and Arabic in one message
(so they suit every user, whatever language they chose).

Paste them in Supabase: **Authentication → Emails → Templates**.

| Template | Subject | Message body |
|---|---|---|
| Confirm signup | `Confirm your KHITTA account · أكّد حسابك في خِطّة` | `confirm-signup.html` |
| Reset password | `Reset your KHITTA password · إعادة تعيين كلمة المرور في خِطّة` | `reset-password.html` |

Both use Supabase's `{{ .ConfirmationURL }}` link.

Before launch, also connect a sending service (custom SMTP) in
**Authentication → Emails → SMTP Settings**, so emails come from your own
address (for example `hello@khitta.ae`) without the built-in test limits.
