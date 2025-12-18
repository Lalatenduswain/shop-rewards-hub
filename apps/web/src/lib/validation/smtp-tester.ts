/**
 * SMTP Connection Tester
 *
 * Validates SMTP credentials before saving to the wizard.
 * Uses nodemailer to test connection and authentication.
 */

import 'server-only';
import nodemailer from 'nodemailer';
import type { Integration } from '@shop-rewards/shared';

export interface SMTPTestResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Test SMTP connection with provided credentials
 *
 * @param config - SMTP configuration from wizard
 * @returns Test result with success status and message
 */
export async function testSMTPConnection(
  config: Integration
): Promise<SMTPTestResult> {
  try {
    // Create transporter with provided config
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
      // Timeout after 10 seconds
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    // Verify connection
    await transporter.verify();

    console.log('[SMTP Tester] Connection successful', {
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUsername,
    });

    return {
      success: true,
      message: `Successfully connected to ${config.smtpHost}:${config.smtpPort}`,
    };
  } catch (error) {
    console.error('[SMTP Tester] Connection failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      message: 'SMTP connection failed',
      error: errorMessage,
    };
  }
}

/**
 * Send a test email to verify SMTP is fully functional
 *
 * @param config - SMTP configuration
 * @param testEmail - Email address to send test to
 * @returns Test result
 */
export async function sendTestEmail(
  config: Integration,
  testEmail: string
): Promise<SMTPTestResult> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: config.smtpUsername,
      to: testEmail,
      subject: 'ShopRewards Hub - SMTP Test Email',
      text: 'This is a test email from ShopRewards Hub setup wizard. If you received this, your SMTP configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SMTP Test Successful</h2>
          <p>This is a test email from <strong>ShopRewards Hub</strong> setup wizard.</p>
          <p>If you received this, your SMTP configuration is working correctly!</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Sent from: ${config.smtpHost}:${config.smtpPort}<br />
            User: ${config.smtpUsername}
          </p>
        </div>
      `,
    });

    console.log('[SMTP Tester] Test email sent successfully', {
      to: testEmail,
      from: config.smtpUsername,
    });

    return {
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
    };
  } catch (error) {
    console.error('[SMTP Tester] Test email failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      message: 'Failed to send test email',
      error: errorMessage,
    };
  }
}
