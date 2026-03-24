const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

// Format Quebec phone number to E.164
export function formatPhoneQC(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 7) return `+1514${digits}`;
  return `+${digits}`;
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const formatted = formatPhoneQC(to);

  if (!SMS_ENABLED) {
    console.log(`[DRY-RUN] SMS to ${formatted}: ${body.substring(0, 80)}...`);
    return 'dry-run-no-send';
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  const credentials = btoa(`${accountSid}:${authToken}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: formatted, From: from, Body: body }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { sid: string };
  return data.sid;
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
  if (digits.length === 10) return qcAreaCodes.includes(digits.substring(0, 3));
  if (digits.length === 11 && digits.startsWith('1')) return qcAreaCodes.includes(digits.substring(1, 4));
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
