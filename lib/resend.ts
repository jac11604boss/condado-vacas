import { Resend } from "resend";

// Resend singleton. Si no hay API key, los emails se loguean por consola
// (modo dev) en vez de fallar.

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const client = getResend();
  if (!client) {
    console.log(`📧 [email desactivado] → ${to} | ${subject}`);
    return { disabled: true };
  }

  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM ?? "Condado +vacas <hola@condado.gal>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`❌ Error enviando email a ${to}:`, error);
    throw new Error(error.message);
  }
  return { sent: true };
}
