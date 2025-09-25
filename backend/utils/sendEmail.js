const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Log configuration (with masked credentials for security)
    console.log('Hostinger SMTP Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 4) + '***' : 'undefined',
      from: process.env.EMAIL_FROM,
      secure: process.env.EMAIL_PORT === '465'
    });

    // Create transporter with enhanced configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        // Do not fail on invalid certs for development
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      // Connection timeout
      connectionTimeout: 60000,
      // Socket timeout
      socketTimeout: 60000,
      // Greeting timeout
      greetingTimeout: 30000
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('✅ Hostinger SMTP connection verified successfully');

    // Prepare email options with enhanced HTML template
    const mailOptions = {
      from: `"Lead Magnet" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Lead Magnet</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${options.message.replace(/\n/g, '<br>')}
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This email was sent from Lead Magnet. If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    // Send email with retry mechanism
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully on attempt ${attempt}:`, {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected
        });
        return info;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Email sending attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError;

  } catch (error) {
    console.error('❌ Email sending error:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;