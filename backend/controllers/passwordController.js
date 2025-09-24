const sendEmail = require('../utils/sendEmail');

const sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    // Enhanced email template for password reset
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Lead Magnet</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${user.name || 'User'},</h2>
          
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password for your Lead Magnet account. 
            If you made this request, please click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px; line-height: 1.6;">
            <strong>Security Notice:</strong> This link will expire in 10 minutes for your security. 
            If you did not request this password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This email was sent from Lead Magnet. If you have any questions, please contact our support team.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Lead Magnet. All rights reserved.</p>
        </div>
      </div>
    `;

    const plainTextMessage = `
Hello ${user.name || 'User'},

We received a request to reset your password for your Lead Magnet account.

To reset your password, please click the following link:
${resetUrl}

This link will expire in 10 minutes for your security.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
The Lead Magnet Team
    `.trim();

    await sendEmail({
      email: user.email,
      subject: '🔐 Lead Magnet - Password Reset Request',
      message: plainTextMessage,
      html: htmlTemplate
    });

    console.log(`✅ Password reset email sent successfully to ${user.email}`);
  } catch (err) {
    console.error('❌ Error sending password reset email:', err);
    throw new Error('Email could not be sent. Please try again later.');
  }
};

module.exports = sendPasswordResetEmail;