import { EmailTemplate } from '../types/email.types';

export interface WelcomeEmailData {
  name: string;
}

export const welcomeTemplate: EmailTemplate<WelcomeEmailData> = {
  subject: 'Welcome to YourPassJo - Your Digital Passport is Ready',
  generateContent: (data) => {
    // Ensure the name is properly escaped for HTML
    const escapedName = data.name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to YourPassJo</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #2c3e50;
        margin: 0;
        padding: 0;
        background-color: #f5f6fa;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
      }
      .header {
        text-align: center;
        padding: 30px 0;
        background-color: #ffffff;
        border-bottom: 1px solid #e1e8ed;
      }
      .logo {
        max-width: 150px;
        height: auto;
        margin-bottom: 20px;
      }
      h1 { 
        color: #2c3e50;
        font-size: 24px;
        font-weight: 600;
        margin: 0;
        padding: 0;
      }
      .content {
        padding: 30px 20px;
      }
      .welcome-text {
        font-size: 18px;
        color: #2c3e50;
        margin-bottom: 25px;
      }
      .features {
        background-color: #f8fafc;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }
      .features h2 {
        color: #2c3e50;
        font-size: 18px;
        margin-top: 0;
        margin-bottom: 15px;
      }
      .features ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .features li {
        padding: 8px 0;
        color: #4a5568;
        display: flex;
        align-items: center;
      }
      .features li:before {
        content: "•";
        color: #3498db;
        font-weight: bold;
        margin-right: 10px;
      }
      .support {
        background-color: #ebf8ff;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }
      .support h2 {
        color: #2c3e50;
        font-size: 18px;
        margin-top: 0;
        margin-bottom: 15px;
      }
      .support p {
        color: #4a5568;
        margin: 0;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #718096;
        font-size: 14px;
        border-top: 1px solid #e1e8ed;
      }
      .social-links {
        margin: 20px 0;
      }
      .social-links a {
        color: #3498db;
        text-decoration: none;
        margin: 0 10px;
      }
      .social-links a:hover {
        text-decoration: underline;
      }
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          padding: 10px !important;
        }
        .content {
          padding: 20px 15px !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="[YourPassJo Logo URL]" alt="YourPassJo Logo" class="logo">
        <h1>Welcome to YourPassJo</h1>
      </div>
      
      <div class="content">
        <div class="welcome-text">
          Dear ${escapedName},
        </div>
        
        <p>Welcome to YourPassJo, your trusted digital passport platform! We're excited to have you join our community. Your account has been successfully created and is ready to use.</p>
        
        <div class="features">
          <h2>Your Digital Passport Features</h2>
          <ul>
            <li>Secure document storage and management</li>
            <li>Easy access to your important information</li>
            <li>Real-time updates and notifications</li>
            <li>24/7 secure access to your digital identity</li>
          </ul>
        </div>
        
        <div class="support">
          <h2>Need Help?</h2>
          <p>Our dedicated support team is here to assist you with any questions about your digital passport. You can reach us through our support portal or contact us directly.</p>
        </div>
      </div>
      
      <div class="footer">
        <div class="social-links">
          <a href="[LinkedIn URL]">LinkedIn</a> |
          <a href="[Twitter URL]">Twitter</a> |
          <a href="[Facebook URL]">Facebook</a>
        </div>
        <p>© ${new Date().getFullYear()} YourPassJo. All rights reserved.</p>
        <p>This email was sent to you as part of your YourPassJo account registration.</p>
      </div>
    </div>
  </body>
</html>`;
  },
};
