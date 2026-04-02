import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Jean-Samuel Leboeuf <js@taillagedehaies.ai>';
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO || 'js@taillagedehaies.ai';

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const emailData: any = {
    from: FROM_EMAIL,
    reply_to: REPLY_TO_EMAIL,
    to,
    subject,
  };

  if (html) emailData.html = html;
  if (text) emailData.text = text;

  // Ensure at least html or text is provided
  if (!html && !text) {
    throw new Error('Either html or text must be provided');
  }

  const { data, error } = await resend.emails.send(emailData);
  if (error) throw error;
  return data;
}

// Pre-built email templates
export async function sendQuoteEmail(to: string, clientName: string, amount: number) {
  return sendEmail({
    to,
    subject: `Votre soumission Haie Lite — ${amount}$`,
    html: `
      <h2>Bonjour ${clientName},</h2>
      <p>Merci de votre intérêt pour nos services de taille de haie.</p>
      <p>Votre soumission estimée : <strong>${amount}$</strong> (taxes incluses)</p>
      <p>Pour confirmer, répondez à ce courriel ou appelez-nous.</p>
      <br>
      <p>L'équipe Haie Lite</p>
    `,
  });
}

export async function sendDailyReportEmail(to: string, reportHtml: string) {
  const today = new Date().toLocaleDateString('fr-CA');
  return sendEmail({
    to,
    subject: `Rapport quotidien Haie Lite — ${today}`,
    html: reportHtml,
  });
}

export { resend };
