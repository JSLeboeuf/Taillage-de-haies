import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Extract lead info from unstructured text (voicemail, form, etc.)
export async function extractLeadInfo(rawText: string): Promise<ExtractedLead> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You extract structured lead information from raw text for a hedge trimming company in Quebec.
Return a JSON object with these fields:
- name: string (client full name)
- phone: string (phone number, format: +15141234567)
- email: string | null
- address: string | null (full street address)
- city: string | null
- postal_code: string | null
- hedge_type: "cedar" | "other" | null
- hedge_length_m: number | null (estimated length in meters)
- hedge_height_m: number | null (estimated height in meters)
- hedge_sides: number | null (number of sides to trim: 1-8)
- includes_top: boolean | null
- includes_cleanup: boolean | null (ramassage)
- preferred_date: string | null (ISO date)
- notes: string | null (any other relevant info)
- urgency: "normal" | "urgent" | null

If a field cannot be determined, set it to null.
All text is in Quebec French. Common terms: "coter/côté" = sides, "rabattage" = heavy pruning, "ramassage" = cleanup.`,
      },
      { role: 'user', content: rawText },
    ],
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

interface ExtractedLead {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  hedge_type: 'cedar' | 'other' | null;
  hedge_length_m: number | null;
  hedge_height_m: number | null;
  hedge_sides: number | null;
  includes_top: boolean | null;
  includes_cleanup: boolean | null;
  preferred_date: string | null;
  notes: string | null;
  urgency: 'normal' | 'urgent' | null;
}

// Classify inbound SMS intent
export async function classifySMSIntent(
  message: string
): Promise<{ intent: 'confirm' | 'cancel' | 'reschedule' | 'question' | 'upsell_accept' | 'upsell_decline' | 'unknown'; confidence: number }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Classify the intent of this SMS reply from a hedge trimming client in Quebec.
Return JSON: { "intent": "confirm"|"cancel"|"reschedule"|"question"|"upsell_accept"|"upsell_decline"|"unknown", "confidence": 0.0-1.0 }
Common replies: "OUI", "NON", "OK", "REPORTER", dates, questions about pricing.`,
      },
      { role: 'user', content: message },
    ],
  });

  return JSON.parse(completion.choices[0].message.content || '{"intent":"unknown","confidence":0}');
}

export { openai };
export type { ExtractedLead };
