"use server";
import { Resend } from 'resend';

// Replace with your actual key from Resend dashboard
const resend = new Resend('re_UdcsCEYb_KmoNAXCubbJFnQe45xxqaUeq'); 

export async function sendClientAlert(email: string, message: string) {
  try {
    await resend.emails.send({
      from: 'Intel <updates@talormayde.com>', // You might need to verify a domain or use 'onboarding@resend.dev' for testing
      to: email,
      subject: 'Secure Transmission: Update Received',
      html: `
        <div style="background:#000; color:#fff; padding:40px; font-family:monospace;">
          <h1 style="color:#10b981;">TALORMAYDE // INTEL</h1>
          <p>New intel has been uploaded to your War Room.</p>
          <div style="border:1px solid #333; padding:20px; margin:20px 0; color:#ccc;">
            "${message}"
          </div>
          <a href="https://talormayde.com/login" style="color:#10b981; text-decoration:none;">> ACCESS DASHBOARD</a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}