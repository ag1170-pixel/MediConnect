import emailjs from '@emailjs/browser';

// EmailJS configuration - These need to be updated with real values
const SERVICE_ID = 'service_mediconnect';
const TEMPLATE_ID = 'template_welcome';
const PUBLIC_KEY: string = 'your_emailjs_public_key'; // Replace with actual EmailJS public key

export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  // Skip email sending if keys are not configured properly
  if (PUBLIC_KEY === 'your_emailjs_public_key' || !PUBLIC_KEY || PUBLIC_KEY.length < 10) {
    console.log('EmailJS not configured - skipping welcome email');
    return { success: true, skipped: true };
  }

  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'MediConnect Team',
      subject: 'Welcome to MediConnect - Your Health Journey Begins!',
      message: `
        Dear ${userName},

        Welcome to MediConnect! We're thrilled to have you join our healthcare community.

        At MediConnect, we're committed to:
        ✓ Connecting you with the best doctors across India
        ✓ Providing seamless appointment booking
        ✓ Ensuring quality healthcare at your fingertips
        ✓ Supporting your health monitoring journey

        Your trust in us means everything. We're here to make healthcare accessible, convenient, and reliable for you.

        Get started by exploring our features:
        • Find and book appointments with top doctors
        • Track your health metrics with our smart dashboard
        • Access your medical records anytime, anywhere

        If you have any questions or need assistance, our support team is always here to help.

        Thank you for choosing MediConnect. Together, we'll make your health our priority.

        Best regards,
        The MediConnect Team

        ---
        This is an automated message. Please do not reply to this email.
        For support, contact us at: support@mediconnect.in
      `
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('Welcome email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
};

export const initializeEmailJS = () => {
  // Only initialize if we have a valid public key
  if (PUBLIC_KEY !== 'your_emailjs_public_key' && PUBLIC_KEY && PUBLIC_KEY.length >= 10) {
    emailjs.init(PUBLIC_KEY);
  }
};