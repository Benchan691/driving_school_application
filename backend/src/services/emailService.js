const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter - using Gmail for development
    // In production, you should use a proper email service like SendGrid, AWS SES, etc.
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendEmail(to, subject, html, text) {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email not configured - skipping email send');
        console.log('   To enable emails, set EMAIL_USER and EMAIL_PASS in .env file');
        console.log('   See EMAIL_SETUP.md for configuration instructions');
        return { messageId: 'email-not-configured' };
      }

      // Debug: Log configuration
      console.log('📧 Email Configuration:');
      console.log('  From:', process.env.EMAIL_FROM || 'noreply@drivingschool.com');
      console.log('  To:', to);
      console.log('  Subject:', subject);
      console.log('  Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
      console.log('  Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@drivingschool.com',
        to,
        subject,
        html,
        text
      };

      console.log('📤 Attempting to send email...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      console.log('📧 Email response:', result.response);
      return { messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:');
      console.error('  Error code:', error.code);
      console.error('  Error message:', error.message);
      console.error('  Full error:', error);
      
      // Provide specific error guidance
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Check your email credentials.');
        console.error('   - Make sure EMAIL_USER is your full Gmail address');
        console.error('   - Make sure EMAIL_PASS is an App Password (not your regular password)');
        console.error('   - Enable 2FA and generate App Password in Google Account settings');
      } else if (error.code === 'ECONNECTION') {
        console.error('🌐 Connection failed. Check your internet connection.');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('⏰ Connection timed out. Try again later.');
      }
      
      throw error;
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Driving School</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Driving School</h1>
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hello ${user.first_name},</p>
            <p>You requested to reset your password for your Driving School account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Driving School. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - Driving School
      
      Hello ${user.first_name},
      
      You requested to reset your password for your Driving School account.
      
      Click this link to reset your password: ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      © 2024 Driving School. All rights reserved.
    `;

    return await this.sendEmail(
      user.email,
      'Password Reset - Driving School',
      html,
      text
    );
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome - Driving School</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
          }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Driving School!</h1>
          </div>
          <div class="content">
            <p>Hello ${user.first_name},</p>
            <p>Welcome to our driving school! We're excited to have you join our community.</p>
            <p>Your account has been successfully created and you can now:</p>
            <ul>
              <li>Book driving lessons</li>
              <li>Track your progress</li>
              <li>View your instructor's profile</li>
              <li>Manage your bookings</li>
            </ul>
            <p>If you have any questions, feel free to contact us.</p>
          </div>
          <div class="footer">
            <p>© 2024 Driving School. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Driving School!
      
      Hello ${user.first_name},
      
      Welcome to our driving school! We're excited to have you join our community.
      
      Your account has been successfully created and you can now:
      - Book driving lessons
      - Track your progress
      - View your instructor's profile
      - Manage your bookings
      
      If you have any questions, feel free to contact us.
      
      © 2024 Driving School. All rights reserved.
    `;

    return await this.sendEmail(
      user.email,
      'Welcome to Driving School!',
      html,
      text
    );
  }

  async sendContactReply(contactMessage, replyMessage) {
    const subject = `Re: ${contactMessage.subject || 'Your Inquiry'}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reply from The Truth Driving School</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .original-message { 
            background: #e5e7eb; 
            padding: 15px; 
            border-left: 4px solid #6b7280; 
            margin: 20px 0;
            font-style: italic;
          }
          .reply-message { 
            background: #dbeafe; 
            padding: 15px; 
            border-left: 4px solid #2563eb; 
            margin: 20px 0;
          }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>The Truth Driving School</h1>
            <h2>Reply to Your Inquiry</h2>
          </div>
          <div class="content">
            <p>Hello ${contactMessage.name},</p>
            <p>Thank you for contacting us. Here is our response to your inquiry:</p>
            
            <div class="original-message">
              <h4>Your original message:</h4>
              <p><strong>Subject:</strong> ${contactMessage.subject || 'No subject'}</p>
              <p><strong>Message:</strong></p>
              <p>${contactMessage.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="reply-message">
              <h4>Our response:</h4>
              <p>${replyMessage.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>If you have any further questions, please don't hesitate to contact us again.</p>
            <p>Best regards,<br>The Truth Driving School Team</p>
          </div>
          <div class="footer">
            <p>© 2024 The Truth Driving School. All rights reserved.</p>
            <p>Phone: +1 (604) 773 8906 | Email: thetruthdrivingschool@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Reply from The Truth Driving School
      
      Hello ${contactMessage.name},
      
      Thank you for contacting us. Here is our response to your inquiry:
      
      Your original message:
      Subject: ${contactMessage.subject || 'No subject'}
      Message: ${contactMessage.message}
      
      Our response:
      ${replyMessage}
      
      If you have any further questions, please don't hesitate to contact us again.
      
      Best regards,
      The Truth Driving School Team
      
      © 2024 The Truth Driving School. All rights reserved.
      Phone: +1 (604) 773 8906 | Email: thetruthdrivingschool@gmail.com
    `;

    return await this.sendEmail(
      contactMessage.email,
      subject,
      html,
      text
    );
  }

  async sendBookingConfirmationEmail(user, booking) {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = booking.time;
    const duration = booking.duration_minutes === 90 ? '1.5 hours' : '1 hour';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation - Driving School</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: #2563eb; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold;
          }
          .content { 
            padding: 30px 20px; 
            background: white; 
          }
          .booking-details { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .booking-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .booking-row:last-child { 
            border-bottom: none; 
          }
          .booking-label { 
            font-weight: 600; 
            color: #374151; 
          }
          .booking-value { 
            color: #1f2937; 
          }
          .status-pending { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 6px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #92400e; 
            text-align: center;
          }
          .footer { 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Booking Confirmation</h1>
            <p>Your lesson has been scheduled</p>
          </div>
          <div class="content">
            <p>Hello ${user.first_name},</p>
            <p>Thank you for booking a driving lesson with us! Your booking has been received and is pending verification.</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${bookingDate}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${bookingTime}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${duration}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Instructor:</span>
                <span class="booking-value">${booking.instructor_name || 'To be assigned'}</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${booking.notes}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="status-pending">
              ⏳ <strong>Status: Pending Verification</strong><br>
              Please check your email for confirmation once your booking is verified by our team.
            </div>
            
            <p>We'll send you another email once your booking is confirmed. If you need to make any changes, please contact us as soon as possible.</p>
            <p>Thank you for choosing our driving school!</p>
          </div>
          <div class="footer">
            <p>© 2024 Driving School. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
📅 Booking Confirmation - Your lesson has been scheduled

Hello ${user.first_name},

Thank you for booking a driving lesson with us! Your booking has been received and is pending verification.

📋 Booking Details:
Date: ${bookingDate}
Time: ${bookingTime}
Duration: ${duration}
Instructor: ${booking.instructor_name || 'To be assigned'}
${booking.notes ? `Notes: ${booking.notes}` : ''}

⏳ Status: Pending Verification
Please check your email for confirmation once your booking is verified by our team.

We'll send you another email once your booking is confirmed. If you need to make any changes, please contact us as soon as possible.

Thank you for choosing our driving school!

© 2024 Driving School. All rights reserved.
    `;

    return await this.sendEmail(
      user.email,
      'Booking Confirmation - Driving School',
      html,
      text
    );
  }

  async sendBookingVerifiedEmail(user, booking) {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = booking.time;
    const duration = booking.duration_minutes === 90 ? '1.5 hours' : '1 hour';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Verified - Driving School</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: #16a34a; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold;
          }
          .content { 
            padding: 30px 20px; 
            background: white; 
          }
          .booking-details { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .booking-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .booking-row:last-child { 
            border-bottom: none; 
          }
          .booking-label { 
            font-weight: 600; 
            color: #374151; 
          }
          .booking-value { 
            color: #1f2937; 
          }
          .status-confirmed { 
            background: #dcfce7; 
            border: 1px solid #16a34a; 
            border-radius: 6px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #166534; 
            text-align: center;
          }
          .footer { 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
            <p>Your lesson has been verified</p>
          </div>
          <div class="content">
            <p>Hello ${user.first_name},</p>
            <p>Great news! Your driving lesson has been confirmed and verified by our team.</p>
            
            <div class="booking-details">
              <h3>📋 Confirmed Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${bookingDate}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${bookingTime}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${duration}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Instructor:</span>
                <span class="booking-value">${booking.instructor_name || 'To be assigned'}</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${booking.notes}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="status-confirmed">
              ✅ <strong>Status: Confirmed</strong><br>
              Your lesson is all set! Please arrive 10 minutes early.
            </div>
            
            <p>We're looking forward to seeing you for your lesson. If you need to make any changes, please contact us at least 24 hours in advance.</p>
            <p>Thank you for choosing our driving school!</p>
          </div>
          <div class="footer">
            <p>© 2024 Driving School. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
✅ Booking Confirmed! - Your lesson has been verified

Hello ${user.first_name},

Great news! Your driving lesson has been confirmed and verified by our team.

📋 Confirmed Booking Details:
Date: ${bookingDate}
Time: ${bookingTime}
Duration: ${duration}
Instructor: ${booking.instructor_name || 'To be assigned'}
${booking.notes ? `Notes: ${booking.notes}` : ''}

✅ Status: Confirmed
Your lesson is all set! Please arrive 10 minutes early.

We're looking forward to seeing you for your lesson. If you need to make any changes, please contact us at least 24 hours in advance.

Thank you for choosing our driving school!

© 2024 Driving School. All rights reserved.
    `;

    return await this.sendEmail(
      user.email,
      'Booking Confirmed - Driving School',
      html,
      text
    );
  }

  async sendBookingRejectedEmail(user, booking) {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = booking.time;
    const duration = booking.duration_minutes === 90 ? '1.5 hours' : '1 hour';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Update - Driving School</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: #dc2626; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold;
          }
          .content { 
            padding: 30px 20px; 
            background: white; 
          }
          .booking-details { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .booking-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .booking-row:last-child { 
            border-bottom: none; 
          }
          .booking-label { 
            font-weight: 600; 
            color: #374151; 
          }
          .booking-value { 
            color: #1f2937; 
          }
          .status-rejected { 
            background: #fef2f2; 
            border: 1px solid #dc2626; 
            border-radius: 6px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #991b1b; 
            text-align: center;
          }
          .rejection-reason { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 6px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #92400e; 
          }
          .footer { 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Booking Update</h1>
            <p>Your lesson request could not be confirmed</p>
          </div>
          <div class="content">
            <p>Hello ${user.first_name},</p>
            <p>We regret to inform you that your driving lesson request could not be confirmed at this time.</p>
            
            <div class="booking-details">
              <h3>📋 Requested Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${bookingDate}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${bookingTime}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${duration}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Instructor:</span>
                <span class="booking-value">${booking.instructor_name || 'To be assigned'}</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${booking.notes}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="status-rejected">
              ❌ <strong>Status: Not Available</strong><br>
              This time slot is no longer available.
            </div>
            
            ${booking.rejection_reason ? `
            <div class="rejection-reason">
              <h4>📝 Reason:</h4>
              <p>${booking.rejection_reason}</p>
            </div>
            ` : ''}
            
            <p>We apologize for any inconvenience. Please try booking a different time slot, or contact us directly to discuss available options.</p>
            <p>You can book a new lesson through your dashboard or contact us for assistance.</p>
            <p>Thank you for your understanding.</p>
          </div>
          <div class="footer">
            <p>© 2024 Driving School. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
❌ Booking Update - Your lesson request could not be confirmed

Hello ${user.first_name},

We regret to inform you that your driving lesson request could not be confirmed at this time.

📋 Requested Booking Details:
Date: ${bookingDate}
Time: ${bookingTime}
Duration: ${duration}
Instructor: ${booking.instructor_name || 'To be assigned'}
${booking.notes ? `Notes: ${booking.notes}` : ''}

❌ Status: Not Available
This time slot is no longer available.

${booking.rejection_reason ? `Reason: ${booking.rejection_reason}` : ''}

We apologize for any inconvenience. Please try booking a different time slot, or contact us directly to discuss available options.

You can book a new lesson through your dashboard or contact us for assistance.

Thank you for your understanding.

© 2024 Driving School. All rights reserved.
    `;

    return await this.sendEmail(
      user.email,
      'Booking Update - Driving School',
      html,
      text
    );
  }

  async sendPaymentReceipt(user, packageData, paymentResult) {
    const receiptNumber = paymentResult.paymentIntentId || 'N/A';
    const amount = (paymentResult.amount / 100).toFixed(2);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt - Driving School</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: #16a34a; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold;
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
            background: white; 
          }
          .receipt-box { 
            border: 2px solid #16a34a; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            background: #fafafa;
          }
          .receipt-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            color: #1f2937;
            text-align: center;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 10px;
          }
          .receipt-details { 
            margin: 15px 0; 
          }
          .receipt-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e5e7eb; 
          }
          .receipt-row:last-child { 
            border-bottom: none; 
            font-weight: bold; 
            font-size: 16px; 
            color: #1f2937;
            border-top: 2px solid #16a34a;
            margin-top: 10px;
            padding-top: 15px;
          }
          .receipt-label { 
            font-weight: 600; 
            color: #374151; 
          }
          .receipt-value { 
            color: #1f2937; 
            text-align: right;
          }
          .success-message { 
            background: #dcfce7; 
            border: 1px solid #16a34a; 
            border-radius: 6px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #166534; 
            font-weight: 500;
            text-align: center;
          }
          .footer { 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Successful!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <p>Hello ${user.first_name},</p>
            <p>Your payment has been processed successfully. Here are the details of your purchase:</p>
            
            <div class="receipt-box">
              <div class="receipt-title">📄 Payment Receipt</div>
              
              <div class="receipt-details">
                <div class="receipt-row">
                  <span class="receipt-label">Receipt #:</span>
                  <span class="receipt-value">${receiptNumber}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Date:</span>
                  <span class="receipt-value">${date}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Package:</span>
                  <span class="receipt-value">${packageData.name}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Description:</span>
                  <span class="receipt-value">${packageData.description || 'Driving lesson package'}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Duration:</span>
                  <span class="receipt-value">${packageData.duration}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Payment Method:</span>
                  <span class="receipt-value">Credit Card (Stripe)</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Total Amount:</span>
                  <span class="receipt-value">$${amount} CAD</span>
                </div>
              </div>
            </div>
            
            <div class="success-message">
              ✅ Your payment has been confirmed and your package is now active.
            </div>
            
            <p>You can view your bookings and track your progress in your dashboard.</p>
            <p>If you have any questions about your purchase, please don't hesitate to contact us.</p>
            <p>Thank you for choosing our driving school!</p>
          </div>
          <div class="footer">
            <p>© 2024 Driving School. All rights reserved.</p>
            <p>This is an automated receipt. Please keep this email for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
🎉 Payment Successful!

Thank you for your purchase

Hello ${user.first_name},

Your payment has been processed successfully. Here are the details of your purchase:

📄 Payment Receipt

Receipt #: ${receiptNumber}

Date: ${date}

Package: ${packageData.name}
Description: ${packageData.description || 'Driving lesson package'}
Duration: ${packageData.duration}
Payment Method: Credit Card (Stripe)
Total Amount: $${amount} CAD
✅ Your payment has been confirmed and your package is now active.

You can view your bookings and track your progress in your dashboard.

If you have any questions about your purchase, please don't hesitate to contact us.

Thank you for choosing our driving school!
    `;

    return await this.sendEmail(
      user.email,
      `Payment Receipt - ${packageData.name}`,
      html,
      text
    );
  }
}

module.exports = new EmailService();

