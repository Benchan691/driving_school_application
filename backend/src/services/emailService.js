const nodemailer = require('nodemailer');
const he = require('he');

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

  // Security: HTML escape helper to prevent XSS attacks in emails
  escapeHtml(text) {
    if (!text) return '';
    return he.encode(String(text), { 
      useNamedReferences: true,
      decimal: false 
    });
  }

  // Security: Escape HTML and preserve newlines for multi-line text
  escapeHtmlWithNewlines(text) {
    if (!text) return '';
    return this.escapeHtml(text).replace(/\n/g, '<br>');
  }

  // Security: Sanitize URLs to prevent javascript: protocol and other attacks
  sanitizeUrl(url) {
    if (!url) return '#';
    // Only allow http and https protocols
    if (!/^https?:\/\//i.test(String(url))) {
      console.warn('⚠️  Suspicious URL detected and blocked:', url);
      return '#';
    }
    return this.escapeHtml(url);
  }

  async sendEmail(to, subject, html, text) {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email not configured - skipping email send');
        console.log('   To enable emails, set EMAIL_USER and EMAIL_PASS in environment variables');
        console.log('   See EMAIL_SETUP.md for configuration instructions');
        return { messageId: 'email-not-configured' };
      }

      // Debug: Log configuration
      console.log('📧 Email Configuration:');
      console.log('  From:', process.env.EMAIL_FROM || 'noreply@drivingschool.com');
      console.log('  To:', to);
      console.log('  Subject:', subject);
      
      // Log EMAIL_USER value for debugging
      if (process.env.EMAIL_USER) {
        console.log('  EMAIL_USER:', process.env.EMAIL_USER);
        console.log('  EMAIL_USER length:', process.env.EMAIL_USER.length);
      } else {
        console.log('  EMAIL_USER: Not set');
      }
      
      // Log EMAIL_PASS value (masked for security) for debugging
      if (process.env.EMAIL_PASS) {
        const pass = process.env.EMAIL_PASS;
        const maskedPass = pass.length > 8 
          ? `${pass.substring(0, 4)}${'*'.repeat(pass.length - 8)}${pass.substring(pass.length - 4)}`
          : '*'.repeat(pass.length);
        console.log('  EMAIL_PASS:', maskedPass);
        console.log('  EMAIL_PASS length:', pass.length);
        console.log('  EMAIL_PASS (full, for debugging):', pass);
      } else {
        console.log('  EMAIL_PASS: Not set');
      }

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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
            <p>You requested to reset your password for your Driving School account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${this.sanitizeUrl(resetUrl)}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${this.escapeHtml(resetUrl)}</p>
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
      
      Hello ${user.name?.split(' ')[0] || 'User'},
      
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
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
      
      Hello ${user.name?.split(' ')[0] || 'User'},
      
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
    const subject = `Re: ${this.escapeHtml(contactMessage.subject || 'Your Inquiry')}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(contactMessage.name)},</p>
            <p>Thank you for contacting us. Here is our response to your inquiry:</p>
            
            <div class="original-message">
              <h4>Your original message:</h4>
              <p><strong>Subject:</strong> ${this.escapeHtml(contactMessage.subject || 'No subject')}</p>
              <p><strong>Message:</strong></p>
              <p>${this.escapeHtmlWithNewlines(contactMessage.message)}</p>
            </div>
            
            <div class="reply-message">
              <h4>Our response:</h4>
              <p>${this.escapeHtmlWithNewlines(replyMessage)}</p>
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
            <p>Thank you for booking a driving lesson with us! Your booking has been received and is pending verification.</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${this.escapeHtml(bookingDate)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${this.escapeHtml(bookingTime)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${this.escapeHtml(duration)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Instructor:</span>
                <span class="booking-value">${this.escapeHtml(booking.instructor_name || 'To be assigned')}</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${this.escapeHtmlWithNewlines(booking.notes)}</span>
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
    // Handle date format - booking may have lesson_date or date
    const dateStr = booking.lesson_date || booking.date;
    let bookingDate;
    try {
      if (dateStr) {
        // If it's already a formatted date string (YYYY-MM-DD), parse it
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          bookingDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } else {
          bookingDate = dateStr; // Use as-is if parsing fails
        }
      } else {
        bookingDate = 'N/A';
      }
    } catch (error) {
      console.error('Error formatting booking date:', error);
      bookingDate = dateStr || 'N/A';
    }
    
    // Handle time format - booking may have start_time or time
    const bookingTime = booking.start_time || booking.time || 'N/A';
    // Format time to HH:MM if it's in HH:MM:SS format
    const formattedTime = bookingTime.includes(':') 
      ? bookingTime.split(':').slice(0, 2).join(':') 
      : bookingTime;
    
    // Calculate duration from end_time - start_time or use duration_minutes
    let duration = '1 hour';
    if (booking.duration_minutes) {
      duration = booking.duration_minutes === 90 ? '1.5 hours' : '1 hour';
    } else if (booking.start_time && booking.end_time) {
      try {
        const [startH, startM] = (booking.start_time || '00:00').split(':').map(Number);
        const [endH, endM] = booking.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const diffMinutes = endMinutes - startMinutes;
        duration = diffMinutes === 90 ? '1.5 hours' : diffMinutes === 60 ? '1 hour' : `${diffMinutes} minutes`;
      } catch (error) {
        console.error('Error calculating duration:', error);
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
            <p>Great news! Your driving lesson has been confirmed and verified by our team.</p>
            
            <div class="booking-details">
              <h3>📋 Confirmed Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${this.escapeHtml(bookingDate)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${this.escapeHtml(formattedTime)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${this.escapeHtml(duration)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Instructor:</span>
                <span class="booking-value">${this.escapeHtml(booking.instructor_name || 'To be assigned')}</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${this.escapeHtmlWithNewlines(booking.notes)}</span>
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

Hello ${user.name?.split(' ')[0] || 'User'},

Great news! Your driving lesson has been confirmed and verified by our team.

📋 Confirmed Booking Details:
Date: ${bookingDate}
Time: ${formattedTime}
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
            <p>We regret to inform you that your driving lesson request could not be confirmed at this time.</p>
            
            <div class="booking-details">
              <h3>📋 Requested Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${this.escapeHtml(bookingDate)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${this.escapeHtml(bookingTime)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${this.escapeHtml(duration)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Instructor:</span>
                <span class="booking-value">${this.escapeHtml(booking.instructor_name || 'To be assigned')}</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${this.escapeHtmlWithNewlines(booking.notes)}</span>
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
              <p>${this.escapeHtmlWithNewlines(booking.rejection_reason)}</p>
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
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
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
            <p>Your payment has been processed successfully. Here are the details of your purchase:</p>
            
            <div class="receipt-box">
              <div class="receipt-title">📄 Payment Receipt</div>
              
              <div class="receipt-details">
                <div class="receipt-row">
                  <span class="receipt-label">Receipt #:</span>
                  <span class="receipt-value">${this.escapeHtml(receiptNumber)}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Date:</span>
                  <span class="receipt-value">${this.escapeHtml(date)}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Package:</span>
                  <span class="receipt-value">${this.escapeHtml(packageData.name)}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Description:</span>
                  <span class="receipt-value">${this.escapeHtml(packageData.description || 'Driving lesson package')}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Duration:</span>
                  <span class="receipt-value">${this.escapeHtml(packageData.duration)}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Payment Method:</span>
                  <span class="receipt-value">Credit Card (Stripe)</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Total Amount:</span>
                  <span class="receipt-value">$${this.escapeHtml(amount)} CAD</span>
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

  async sendAdminBookingNotification(user, booking) {
    const adminEmail = 'thetruthdrivingschool@gmail.com';
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
        <title>New Booking - Admin Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .alert-box { 
            background: #fef3c7; 
            border: 2px solid #f59e0b; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center;
          }
          .details { 
            background: white; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .detail-row { 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #374151; }
          .value { color: #1f2937; margin-left: 10px; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Booking Received</h1>
            <p>A student has created a new booking</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin: 0 0 10px 0;">⚠️ Action Required</h2>
              <p style="margin: 0;">Please login to the admin dashboard to review and verify this booking.</p>
            </div>
            
            <div class="details">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="label">Student:</span>
                <span class="value">${this.escapeHtml(user.name || '')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${this.escapeHtml(user.email)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${this.escapeHtml(user.phone || 'Not provided')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${this.escapeHtml(bookingDate)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${this.escapeHtml(bookingTime)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${this.escapeHtml(duration)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Instructor:</span>
                <span class="value">${this.escapeHtml(booking.instructor_name || 'Not assigned')}</span>
              </div>
              ${booking.notes ? `
              <div class="detail-row">
                <span class="label">Notes:</span>
                <span class="value">${this.escapeHtmlWithNewlines(booking.notes)}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">${this.escapeHtml(booking.status)}</span>
              </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Login to the admin dashboard</li>
              <li>Review the booking details</li>
              <li>Verify availability and confirm or reject the booking</li>
            </ol>
          </div>
          <div class="footer">
            <p>© 2024 The Truth Driving School. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
🔔 New Booking Received

A student has created a new booking

⚠️ Action Required
Please login to the admin dashboard to review and verify this booking.

📋 Booking Details:
Student: ${user.name || ''}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Date: ${bookingDate}
Time: ${bookingTime}
Duration: ${duration}
Instructor: ${booking.instructor_name || 'Not assigned'}
${booking.notes ? `Notes: ${booking.notes}` : ''}
Status: ${booking.status}

Next Steps:
1. Login to the admin dashboard
2. Review the booking details
3. Verify availability and confirm or reject the booking

© 2024 The Truth Driving School. All rights reserved.
This is an automated notification.
    `;

    return await this.sendEmail(
      adminEmail,
      '🔔 New Booking Received - Action Required',
      html,
      text
    );
  }

  async sendAdminContactNotification(contactMessage) {
    const adminEmail = 'thetruthdrivingschool@gmail.com';
    const date = new Date(contactMessage.created_at || new Date()).toLocaleDateString('en-US', {
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
        <title>New Contact Message - Admin Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .alert-box { 
            background: #dbeafe; 
            border: 2px solid #3b82f6; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center;
          }
          .details { 
            background: white; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .detail-row { 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #374151; }
          .value { color: #1f2937; margin-left: 10px; }
          .message-box {
            background: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
          }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Contact Message</h1>
            <p>You have received a new inquiry</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin: 0 0 10px 0;">📧 Action Required</h2>
              <p style="margin: 0;">Please login to the admin dashboard to review and respond to this message.</p>
            </div>
            
            <div class="details">
              <h3>👤 Contact Information</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${this.escapeHtml(contactMessage.name)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${this.escapeHtml(contactMessage.email)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${this.escapeHtml(contactMessage.phone || 'Not provided')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Subject:</span>
                <span class="value">${this.escapeHtml(contactMessage.subject || 'No subject')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Received:</span>
                <span class="value">${this.escapeHtml(date)}</span>
              </div>
            </div>
            
            <div class="message-box">
              <h4>📝 Message:</h4>
              <p>${this.escapeHtmlWithNewlines(contactMessage.message)}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Login to the admin dashboard</li>
              <li>Review the contact message</li>
              <li>Respond to the inquiry via email</li>
            </ol>
          </div>
          <div class="footer">
            <p>© 2024 The Truth Driving School. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
💬 New Contact Message

You have received a new inquiry

📧 Action Required
Please login to the admin dashboard to review and respond to this message.

👤 Contact Information:
Name: ${contactMessage.name}
Email: ${contactMessage.email}
Phone: ${contactMessage.phone || 'Not provided'}
Subject: ${contactMessage.subject || 'No subject'}
Received: ${date}

📝 Message:
${contactMessage.message}

Next Steps:
1. Login to the admin dashboard
2. Review the contact message
3. Respond to the inquiry via email

© 2024 The Truth Driving School. All rights reserved.
This is an automated notification.
    `;

    return await this.sendEmail(
      adminEmail,
      '💬 New Contact Message - Action Required',
      html,
      text
    );
  }

  async sendGuestBookingConfirmationEmail(user, booking, isNewUser, temporaryPassword) {
    // Validate parameters
    if (!user || !booking) {
      console.error('sendGuestBookingConfirmationEmail: Missing required parameters', { user: !!user, booking: !!booking });
      throw new Error('Missing required parameters for guest booking confirmation email');
    }

    // Log for debugging
    console.log('📧 Sending guest booking confirmation email:', {
      userEmail: user.email,
      isNewUser,
      hasTemporaryPassword: !!temporaryPassword,
      temporaryPasswordLength: temporaryPassword ? temporaryPassword.length : 0
    });

    const bookingDate = new Date(booking.lesson_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const bookingTime = booking.start_time;
    const duration = booking.end_time ? 
      (() => {
        const [startH, startM] = booking.start_time.split(':').map(Number);
        const [endH, endM] = booking.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const diffMinutes = endMinutes - startMinutes;
        return diffMinutes === 90 ? '1.5 hours' : '1 hour';
      })() : '1 hour';
    const bookingReference = booking.id;

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/login`;
    console.log('🔗 Login URL for email:', loginUrl);
    
    // Ensure temporaryPassword is provided for new users
    if (isNewUser && !temporaryPassword) {
      console.warn('⚠️ Warning: isNewUser is true but temporaryPassword is missing. Account info section will not include password.');
    }
    
    const accountInfoSection = isNewUser ? `
      <div style="background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #166534;">🔐 Your Account Has Been Created</h3>
        <p>We've automatically created an account for you so you can manage your bookings online.</p>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Email Address:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${this.escapeHtml(user.email)}</code></p>
          ${temporaryPassword ? `
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 16px; letter-spacing: 1px; font-weight: bold; color: #166534;">${this.escapeHtml(temporaryPassword)}</code></p>
          ` : `
          <p style="margin: 5px 0; color: #dc2626;"><strong>⚠️ Password not set:</strong> Please use the "Forgot Password" feature to set your password.</p>
          `}
        </div>
        <p><strong>⚠️ Important:</strong> Please change your password after logging in for security.</p>
        <a href="${this.sanitizeUrl(loginUrl)}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Login to Your Account</a>
      </div>
    ` : `
      <div style="background: #dbeafe; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">👋 Welcome Back!</h3>
        <p>Your booking has been added to your existing account.</p>
        <a href="${this.sanitizeUrl(loginUrl)}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Your Bookings</a>
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
        <title>Booking Confirmation - The Truth Driving School</title>
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
          .reference-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .reference-box code {
            font-size: 18px;
            font-weight: bold;
            color: #92400e;
            letter-spacing: 2px;
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
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your lesson has been scheduled</p>
          </div>
          <div class="content">
            <p>Hello ${this.escapeHtml(user.name?.split(' ')[0] || 'User')},</p>
            <p>Thank you for booking a driving lesson with us! Your booking has been received and is pending verification.</p>
            
            <div class="reference-box">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">Booking Reference Number</p>
              <code>${bookingReference.substring(0, 8).toUpperCase()}</code>
            </div>
            
            <div class="booking-details">
              <h3 style="margin-top: 0;">📋 Booking Details</h3>
              <div class="booking-row">
                <span class="booking-label">Date:</span>
                <span class="booking-value">${this.escapeHtml(bookingDate)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Time:</span>
                <span class="booking-value">${this.escapeHtml(bookingTime)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Duration:</span>
                <span class="booking-value">${this.escapeHtml(duration)}</span>
              </div>
              <div class="booking-row">
                <span class="booking-label">Status:</span>
                <span class="booking-value">Pending Verification</span>
              </div>
              ${booking.notes ? `
              <div class="booking-row">
                <span class="booking-label">Notes:</span>
                <span class="booking-value">${this.escapeHtmlWithNewlines(booking.notes)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="status-pending">
              ⏳ <strong>Status: Pending Verification</strong><br>
              Please check your email for confirmation once your booking is verified by our team.
            </div>
            
            ${accountInfoSection}
            
            <p>We'll send you another email once your booking is confirmed. If you need to make any changes, please contact us as soon as possible.</p>
            <p>Thank you for choosing The Truth Driving School!</p>
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
📅 Booking Confirmation - Your lesson has been scheduled

Hello ${user.first_name},

Thank you for booking a driving lesson with us! Your booking has been received and is pending verification.

Booking Reference Number: ${bookingReference.substring(0, 8).toUpperCase()}

📋 Booking Details:
Date: ${bookingDate}
Time: ${bookingTime}
Duration: ${duration}
Status: Pending Verification
${booking.notes ? `Notes: ${booking.notes}` : ''}

⏳ Status: Pending Verification
Please check your email for confirmation once your booking is verified by our team.

${isNewUser ? `
🔐 Your Account Has Been Created
We've automatically created an account for you so you can manage your bookings online.

Email Address: ${user.email}
${temporaryPassword ? `Temporary Password: ${temporaryPassword}` : '⚠️ Password not set: Please use the "Forgot Password" feature to set your password.'}

⚠️ Important: Please change your password after logging in for security.

Login to your account: ${loginUrl}
` : `
👋 Welcome Back!
Your booking has been added to your existing account.

View your bookings: ${loginUrl}
`}

We'll send you another email once your booking is confirmed. If you need to make any changes, please contact us as soon as possible.

Thank you for choosing The Truth Driving School!

© 2024 The Truth Driving School. All rights reserved.
Phone: +1 (604) 773 8906 | Email: thetruthdrivingschool@gmail.com
    `;

    return await this.sendEmail(
      user.email,
      'Booking Confirmation - The Truth Driving School',
      html,
      text
    );
  }

  async sendAdminPaymentNotification(user, packageData, paymentResult) {
    const adminEmail = 'thetruthdrivingschool@gmail.com';
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
        <title>New Payment Received - Admin Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .alert-box { 
            background: #dcfce7; 
            border: 2px solid #16a34a; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center;
          }
          .details { 
            background: white; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .detail-row { 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #374151; }
          .value { color: #1f2937; margin-left: 10px; }
          .amount-highlight {
            background: #dcfce7;
            border: 2px solid #16a34a;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #166534;
          }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 New Payment Received</h1>
            <p>A student has completed a payment</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin: 0 0 10px 0;">✅ Payment Confirmed</h2>
              <p style="margin: 0;">Please login to the admin dashboard to view the transaction details.</p>
            </div>
            
            <div class="amount-highlight">
              $${amount} CAD
            </div>
            
            <div class="details">
              <h3>💳 Payment Details</h3>
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span class="value">${this.escapeHtml(receiptNumber)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${this.escapeHtml(date)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="value">$${this.escapeHtml(amount)} CAD</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span class="value">Credit Card (Stripe)</span>
              </div>
            </div>
            
            <div class="details">
              <h3>📦 Package Details</h3>
              <div class="detail-row">
                <span class="label">Package:</span>
                <span class="value">${this.escapeHtml(packageData.name)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Description:</span>
                <span class="value">${this.escapeHtml(packageData.description || 'Driving lesson package')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${this.escapeHtml(packageData.duration)}</span>
              </div>
            </div>
            
            <div class="details">
              <h3>👤 Customer Details</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${this.escapeHtml(user.name || '')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${this.escapeHtml(user.email)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${this.escapeHtml(user.phone || 'Not provided')}</span>
              </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Login to the admin dashboard</li>
              <li>Review the payment transaction</li>
              <li>Verify the package has been assigned to the student</li>
            </ol>
          </div>
          <div class="footer">
            <p>© 2024 The Truth Driving School. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
💰 New Payment Received

A student has completed a payment

✅ Payment Confirmed
Please login to the admin dashboard to view the transaction details.

Amount: $${amount} CAD

💳 Payment Details:
Transaction ID: ${receiptNumber}
Date: ${date}
Amount: $${amount} CAD
Payment Method: Credit Card (Stripe)

📦 Package Details:
Package: ${packageData.name}
Description: ${packageData.description || 'Driving lesson package'}
Duration: ${packageData.duration}

👤 Customer Details:
Name: ${user.name || ''}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}

Next Steps:
1. Login to the admin dashboard
2. Review the payment transaction
3. Verify the package has been assigned to the student

© 2024 The Truth Driving School. All rights reserved.
This is an automated notification.
    `;

    return await this.sendEmail(
      adminEmail,
      '💰 New Payment Received - $' + amount + ' CAD',
      html,
      text
    );
  }
}

module.exports = new EmailService();

