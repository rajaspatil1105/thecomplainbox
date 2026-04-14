require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails via SMTP
 */

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: parseInt(process.env.SMTP_PORT) === 465, // TLS for 587, SSL for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailService {
  /**
   * Send email
   */
  static async sendEmail(to, subject, htmlContent) {
    try {
      const info = await transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html: htmlContent
      });

      console.log('Email sent:', info.messageId);
      return info.messageId;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send complaint submitted notification to student
   */
  static async sendComplaintSubmittedEmail(studentEmail, complaintId, isAnonymous, token) {
    const trackingUrl = isAnonymous 
      ? `${process.env.FRONTEND_URL}/track?token=${token}`
      : `${process.env.FRONTEND_URL}/complaints/${complaintId}`;

    const html = `
      <h2>Complaint Submitted</h2>
      <p>Your complaint has been submitted successfully.</p>
      <p><strong>Complaint ID:</strong> ${complaintId}</p>
      ${isAnonymous ? `
        <p><strong>Tracking Token:</strong> ${token}</p>
        <p>Save this token to track your complaint status.</p>
      ` : ''}
      <p><a href="${trackingUrl}">View Complaint Status</a></p>
    `;

    return this.sendEmail(studentEmail, 'Complaint Submitted Successfully', html);
  }

  /**
   * Send complaint assigned notification to committee
   */
  static async sendComplaintAssignedEmail(committeeEmail, complaintTitle, committeeHead) {
    const html = `
      <h2>New Complaint Assigned</h2>
      <p>A new complaint has been assigned to your committee:</p>
      <p><strong>Title:</strong> ${complaintTitle}</p>
      <p>Please review and take necessary action.</p>
      <p><a href="${process.env.FRONTEND_URL}/authority/inbox">View Inbox</a></p>
    `;

    return this.sendEmail(committeeEmail, 'New Complaint Assigned', html);
  }

  /**
   * Send status update notification
   */
  static async sendStatusUpdateEmail(studentEmail, complaintTitle, newStatus) {
    const html = `
      <h2>Complaint Status Updated</h2>
      <p>Your complaint status has been updated.</p>
      <p><strong>Complaint:</strong> ${complaintTitle}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p><a href="${process.env.FRONTEND_URL}/track">View Details</a></p>
    `;

    return this.sendEmail(studentEmail, 'Complaint Status Updated', html);
  }

  /**
   * Send escalation notification
   */
  static async sendEscalationEmail(recipients, complaintTitle, priority) {
    const html = `
      <h2>Complaint Escalated</h2>
      <p>The following complaint has been escalated:</p>
      <p><strong>Title:</strong> ${complaintTitle}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p>Immediate action required.</p>
      <p><a href="${process.env.FRONTEND_URL}/authority/inbox">View Complaint</a></p>
    `;

    for (const recipient of recipients) {
      await this.sendEmail(recipient, `Complaint Escalated - ${priority}`, html);
    }
  }

  /**
   * Send feedback request email
   */
  static async sendFeedbackRequestEmail(studentEmail, complaintId) {
    const html = `
      <h2>Feedback Requested</h2>
      <p>Your complaint has been resolved. Please provide feedback on our response.</p>
      <p><a href="${process.env.FRONTEND_URL}/feedback/${complaintId}">Submit Feedback</a></p>
    `;

    return this.sendEmail(studentEmail, 'Please Rate Your Experience', html);
  }
}

module.exports = EmailService;
