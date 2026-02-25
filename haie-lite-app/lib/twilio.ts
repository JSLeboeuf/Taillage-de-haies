import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_PHONE_NUMBER || '';

// Safety: SMS are disabled by default until SMS_ENABLED=true is set
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

// Format Quebec phone number to E.164
export function formatPhoneQC(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle various formats
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 7) return `+1514${digits}`; // Default to 514 area code

  return `+${digits}`;
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const formatted = formatPhoneQC(to);

  if (!SMS_ENABLED) {
    console.log(`[DRY-RUN] SMS to ${formatted}: ${body.substring(0, 80)}...`);
    return 'dry-run-no-send';
  }

  const message = await client.messages.create({
    body,
    from: FROM,
    to: formatted,
  });
  return message.sid;
}

// Send SMS to multiple recipients
export async function sendBulkSMS(
  recipients: { phone: string; message: string }[]
): Promise<string[]> {
  const results = await Promise.allSettled(
    recipients.map(({ phone, message }) => sendSMS(phone, message))
  );

  return results.map((r) =>
    r.status === 'fulfilled' ? r.value : `error: ${r.reason}`
  );
}

// Validate Quebec phone number
export function isValidQCPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const qcAreaCodes = ['514', '438', '450', '579', '819', '873', '418', '581', '367'];

  if (digits.length === 10) {
    return qcAreaCodes.includes(digits.substring(0, 3));
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return qcAreaCodes.includes(digits.substring(1, 4));
  }
  return false;
}

// Parse inbound Twilio SMS webhook
export interface TwilioInboundSMS {
  from: string;
  body: string;
  messageSid: string;
}

export function parseInboundSMS(formData: FormData): TwilioInboundSMS {
  return {
    from: formData.get('From') as string,
    body: (formData.get('Body') as string).trim().toUpperCase(),
    messageSid: formData.get('MessageSid') as string,
  };
}

export { client as twilioClient };
