const sendEmail = require('../utils/sendEmail'); // 

const sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: `Click the link below to reset your password:\n\n${resetUrl}`,
      html: `
        <p>Hello ${user.name || ''},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    console.log(`Password reset email sent to ${user.email}`);
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw new Error('Email could not be sent. Please try again later.');
  }
};

module.exports = sendPasswordResetEmail;