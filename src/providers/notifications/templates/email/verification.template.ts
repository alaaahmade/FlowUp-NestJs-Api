import { EmailTemplate } from '../types/email.types';

export interface VerificationEmailData {
  code: string;
  expiresInMinutes: number;
}

export const verificationTemplate: EmailTemplate<VerificationEmailData> = {
  subject: 'Your Verification Code',
  generateContent: (data) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verification Code</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
            letter-spacing: 5px;
            margin: 20px 0;
          }
          .expires {
            color: #e74c3c;
            text-align: center;
            font-size: 0.9em;
          }
          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h2>Your Verification Code</h2>
        <p>Please use the following code to verify your account:</p>
        <div class="code">${data.code}</div>
        <p class="expires">This code will expire in ${data.expiresInMinutes} minutes</p>
        <div class="footer">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The FlowUp Team</p>
        </div>
      </body>
    </html>
  `,
};
