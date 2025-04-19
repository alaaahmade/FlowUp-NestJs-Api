import { EmailTemplate } from '../types/email.types';

export interface PasswordResetEmailData {
  resetLink: string;
  expiresInMinutes: number;
}

export const passwordResetTemplate: EmailTemplate<PasswordResetEmailData> = {
  subject: 'Password Reset Request',
  generateContent: (data) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2980b9;
          }
          .warning {
            color: #e74c3c;
            font-size: 0.9em;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to create a new password:</p>
        <a href="${data.resetLink}" class="button">Reset Password</a>
        <p class="warning">This link will expire in ${data.expiresInMinutes} minutes.</p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${data.resetLink}</p>
        <div class="footer">
          <p><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account's security.</p>
          <p>Best regards,<br>The FlowUp Team</p>
        </div>
      </body>
    </html>
  `,
};
