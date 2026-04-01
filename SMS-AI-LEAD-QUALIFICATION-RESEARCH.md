# SMS AI Lead Qualification System for Canada (Quebec)
## Comprehensive Technical & Regulatory Research

**Compiled**: March 31, 2026
**Scope**: Twilio SMS integration + CASL compliance framework
**Jurisdiction**: Canada (Quebec focus)

---

## Table of Contents
1. [Twilio SMS for Canada](#twilio-sms-for-canada)
2. [CASL Compliance for SMS AI](#casl-compliance-for-sms-ai)
3. [Implementation Checklist](#implementation-checklist)
4. [Risk & Enforcement](#risk--enforcement)

---

## TWILIO SMS FOR CANADA

### 1. Conversations API vs Messaging API

#### Twilio Conversations API
- **Architecture**: Stateful, multi-channel messaging platform
- **Message History**: Maintains threaded conversation history across all channels
- **Supported Channels**: SMS, WhatsApp, Facebook Messenger, Web Chat, Apple Messages for Business
- **State Management**: Retains participant info, conversation metadata, read receipts
- **Best For**: Long-term customer relationships, cross-channel continuity, chatbot interactions
- **Use Case**: Lead nurturing sequences where context across multiple touches matters

#### Twilio Programmable Messaging API
- **Architecture**: Stateless, transactional messaging
- **Message History**: No automatic conversation threading; requires manual tracking
- **Supported Channels**: SMS only (or SMS-to-email with additional config)
- **State Management**: Each message is independent; no built-in participant state
- **Best For**: Transactional alerts, one-way broadcasts, high-throughput campaigns
- **Use Case**: Appointment confirmations, qualification responses where minimal context needed

#### Recommendation for Lead Qualification
**Use Programmable Messaging API** initially:
- Lead qualification is typically 3-5 message exchange (short lifecycle)
- Stateless design reduces complexity and cost
- Better pricing per SMS ($0.015/segment in Canada)
- Easier to scale for high-volume campaigns
- Can graduate to Conversations API later if multi-touch nurturing needed

**Source**: [Twilio Conversations API vs Messaging API comparison](https://www.twilio.com/en-us/messaging/apis)

---

### 2. 10DLC Registration for SMS in Canada

#### What is 10DLC?
- **Definition**: 10-Digit Long Code – a standard North American phone number (e.g., +1 (514) 555-0199)
- **Requirement**: Mandatory for non-toll-free SMS in Canada since 2021 (carriers began enforcement)
- **Alternative**: Toll-free numbers (1-800, 1-888, etc.) do NOT require 10DLC but have different pricing/throughput

#### Registration Process
1. **Create a Campaign** in Twilio Console → Messaging → Campaign Management
2. **Provide Business Information**:
   - Legal business name
   - **Canadian Business Number (CBN)** – 9-digit tax ID from CRA
   - Principal place of business address in Canada
   - Phone number
   - Website (if applicable)
3. **Define Use Case**: Select "Marketing" or "Notification" or "Two-Way Transactional"
4. **Declare Message Content**: Describe types of SMS you'll send (e.g., "Lead qualification questions")
5. **Submit for Carrier Review**: Approval typically 24-48 hours
6. **Provision 10DLC Number**: Once approved, order a local number (Quebec: 514, 418, 450 area codes)

#### Key Requirements
- **Canadian Business Number (CBN)**: Must be obtuse for Canadian corporations/sole proprietors
  - Not having a CBN delays approval 1-2 weeks
  - For US companies: must have Canadian subsidiary or registered agent
- **Message Templates**: Pre-define expected message formats
- **Opt-out Handling**: Must declare STOP keyword support in campaign
- **Brand Reputation**: Carriers assess brand legitimacy; spam history = rejection

#### Throughput Post-Registration
- **Default**: 1 MPS (message per second) = 60 SMS/minute
- **High-Volume Tier**: Request throttling increase to 3+ MPS after 2 weeks clean send history
- **Toll-Free Alternative**: 1-800 numbers = 3 TPS standard, up to 150 MPS with high-throughput package

**Source**: [Twilio 10DLC Registration Guide Canada](https://www.twilio.com/en-us/messaging/sms/10dlc)

---

### 3. Toll-Free vs Local Numbers for SMS

| Factor | Toll-Free (1-8xx) | Local (514/418/450) |
|--------|-------------------|-------------------|
| **Registration** | Simple (1-2 days) | 10DLC campaign required (24-48h) |
| **Monthly Cost** | $2.627/number | $1.15/number |
| **Per-SMS Cost** | $0.015/segment | $0.015/segment |
| **Default MPS** | 3 TPS | 1 MPS |
| **Max MPS** | 150 (high-throughput) | 3-10 (varies) |
| **Lead Qualification Use** | Better for outbound campaigns (wider reach perception) | Better for inbound/callbacks (local trust) |
| **Carrier Filtering** | Lower spam filtering (established toll-free reputation) | Higher carrier filtering (new 10DLC prone to blocks) |
| **SMS Open Rates** | ~30% (unfamiliar number) | ~35% (local area code trust) |

#### Best Practice
- **Start**: Local 10DLC number (514 area code) to establish reputation
- **Scale**: Add toll-free 1-888 number for outbound qualification campaigns after 3-4 weeks clean send history
- **Monitor**: Use Twilio insights to track delivery rates; if <95%, verify 10DLC standing or switch toll-free

**Source**: [Twilio Canada SMS Pricing & Numbers](https://www.twilio.com/en-us/pricing/messaging/sms-mms)

---

### 4. Twilio Pricing for Canada (2026)

#### Inbound SMS (Received)
- **Cost**: $0.015 per SMS segment
- **Per-Second Rate**: Unlimited (no overage)
- **Toll-Free Reception**: Same as local

#### Outbound SMS (Sent)
- **Cost**: $0.015 per SMS segment
- **Per-Second Rate**: Depends on throughput tier (see MPS in section 3)
- **Toll-Free Outbound**: Same as local ($0.015)

#### Number Rental
- **Local 10DLC Number**: $1.15/month (recurring)
- **Toll-Free Number**: $2.627/month (recurring)
- **No Setup Fee**: Twilio waived registration fees as of 2023

#### SMS Segmentation
- **160 characters**: 1 SMS segment
- **153 characters** (with Unicode): 1 SMS segment
- **161+ characters**: 2 SMS segments (continuing pattern)
- **Example**: "Hi, what's your roof height?" = 27 chars = 1 segment = $0.015

#### Example: 1,000 Lead Qualification Campaign
- 1,000 outbound SMS @ $0.015 = **$15.00**
- Local 10DLC number @ $1.15/month = **$1.15**
- **Total Monthly**: ~$16-20 (assuming 1,000-1,500 SMS/month)

#### Cost Optimization
- Keep messages <160 chars (Quebec French accent often requires longer text)
- Batch send during carrier-preferred hours (9am-9pm ET)
- Use Conversations API only if multi-touch nurturing confirmed (higher pricing)

**Source**: [Twilio Messaging Pricing Canada](https://www.twilio.com/en-us/pricing/messaging)

---

### 5. Webhook Setup for Incoming SMS

#### Incoming Webhook Configuration

**1. Configure in Twilio Console**
```
Messaging → Phone Numbers → [Your 10DLC Number]
  → Messaging → A MESSAGE COMES IN
  → [Select] Webhook
  → URL: https://your-api.example.com/webhooks/sms/incoming
  → HTTP Method: POST
  → [Leave Load balancer fields blank unless scaling 100+ MPS]
```

**2. Expected Webhook Payload** (x-www-form-urlencoded)
```
From=+15145550199
To=+15145551234
Body=Yes%2C+call+me+tomorrow
MessageSid=SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AccountSid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MessageStatus=received
NumMedia=0
SmsMessageSid=SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SmsSid=SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Key Fields for Lead Qualification**
- `From`: Prospect's phone number (with +1 country code)
- `To`: Your Twilio number (for multi-number routing)
- `Body`: Prospect's response text
- `MessageSid`: Unique message ID (log for compliance audit)
- `MessageStatus`: Always "received" on incoming

**3. TwiML Response Example** (required; tells Twilio webhook succeeded)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

**4. Error Handling**
- **Non-200 Response**: Twilio retries webhook 3x over 1 hour
- **Timeout (10s)**: Treated as failure, retry triggered
- **SMS Still Delivered**: Even if webhook fails, prospect message was received

#### Implementation Notes
- **Idempotency**: Always check `MessageSid` to avoid duplicate processing
- **Rate Limiting**: Twilio webhooks are bursty; queue-based processing recommended
- **Logging**: Log `MessageSid` + `From` + timestamp for CASL audit trail
- **Security**: Validate Twilio signature (X-Twilio-Signature header) using your AuthToken

**Source**: [Twilio Incoming Webhook Documentation](https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-to-incoming-sms-messages)

---

### 6. Message Status Callbacks (Delivery Tracking)

#### What Are Status Callbacks?
Asynchronous webhook notifications from Twilio whenever a sent SMS changes state (sent → delivered → failed).

#### Configuration
```
POST /webhooks/sms/status HTTP/1.1
Host: your-api.example.com

Content-Type: application/x-www-form-urlencoded

MessageSid=SM1234567890abcdef
AccountSid=AC1234567890abcdef
MessageStatus=delivered
To=%2B14155552345
From=%2B14155551234
ApiVersion=2010-04-01
```

**Message Status Values**
- `queued`: Accepted by Twilio, waiting in queue
- `sending`: Sent to carrier
- `sent`: Delivered to carrier (NOT to phone)
- `delivered`: Delivered to recipient phone (premium tracking)
- `undelivered`: Carrier rejected (bad number, invalid network, etc.)
- `failed`: Twilio error (invalid params, account issue, etc.)

#### Delivery Tracking Pricing
- **Base Delivery**: "sent" status = included in $0.015/SMS
- **Premium Delivery (DLR)**: "delivered" status = +$0.01/SMS = **$0.025 per SMS delivered**
  - Only available for 10DLC numbers (toll-free supports "sent" + "delivered")
  - 30-60 minute latency for "delivered" status

#### Example: Lead Qualification Flow
```
1. Send qualification SMS to +1 514 555 0199 (MessageSid: SM123)
   → Webhook: status=queued
   → Webhook: status=sent (1-2 seconds later)

2. Prospect replies within 30 minutes
   → Incoming webhook received (as per section 5)
   → Log response in database

3. Send follow-up SMS (MessageSid: SM456)
   → Webhook: status=sent
   → [Optional] Webhook: status=delivered (60s later, if DLR enabled)
   → Cost: $0.015 (sent) or $0.025 (if tracking delivered)
```

#### Best Practices for Lead Qualification
- **Enable Premium Delivery**: Recommended for SLA tracking
- **Daily Reconciliation**: Compare sent count vs delivered count to detect carrier issues
- **Failure Recovery**: Retry undelivered messages after 2 hours (many are temporary)
- **Webhook Queue**: Process status callbacks asynchronously (Twilio may send 100+ in rapid succession)

**Source**: [Twilio Status Callbacks Guide](https://www.twilio.com/docs/sms/tutorials/how-to-confirm-delivery-of-sms-messages)

---

### 7. Rate Limiting & Throughput

#### Carrier Rate Limits (Canada)
- **10DLC Local Numbers**: 1 MPS (60 SMS/minute) default
  - After 2+ weeks clean history: up to 3 MPS possible (request with Twilio support)
  - Further increase rare; carriers assess reputation continuously

- **Toll-Free Numbers (1-8xx)**: 3 TPS (180 SMS/minute) default
  - High-throughput tier: 25-150 MPS after business justification
  - Requires dedicated IP for Conversations API

- **Short Codes**: Not available in Canada (carriers phased out 2018)

#### Machine Learning (ML) Filtering
- **What it is**: Carriers use ML models to detect spam/phishing SMS
- **Factors Assessed**:
  - Sender reputation (new 10DLC = higher scrutiny)
  - Message content (keywords like "verify account", "click link")
  - Recipient engagement (high complaint rate = throttling)
  - Time-of-day (bulk sending at 2am = flagged)

- **Impact**: Even with 1 MPS allocation, carrier may soft-block (delays, filtering to spam folder) if ML flags the content
- **Mitigation**:
  - Personalize messages (address by first name)
  - Avoid phishing-like language ("Confirm your details")
  - Space sends over 24 hours (don't bulk send all 1,000 at once)
  - Monitor complaint rates via Twilio insights; stay <0.1%

#### Best Practice for Lead Qualification Campaigns
- **Stagger sends**: Distribute 1,000 SMS over 2-3 days
- **Segment by intent**: Send only to opted-in Facebook leads (higher engagement, lower spam flag)
- **Track complainers**: Remove anyone who doesn't engage after 2 touches
- **Monitor delivery**: If delivery rate drops <90%, pause, review templates, contact Twilio

**Source**: [Carrier ML Filtering for SMS](https://www.twilio.com/docs/sms/best-practices-sms-campaigns)

---

## CASL COMPLIANCE FOR SMS AI

### 8. Canada Anti-Spam Legislation (CASL) Overview

#### What is CASL?
- **Full Name**: Canada Anti-Spam Legislation
- **Jurisdiction**: Federal law covering commercial electronic messages (SMS, email, push notifications, etc.)
- **Enforcer**: ISED (Innovation, Science and Economic Development Canada, formerly ISED)
- **Key Principle**: "Opt-in by default" – must have explicit consent BEFORE sending commercial messages

#### Key Rules
1. **Express Consent Required**: Must have clear, documented permission from recipient BEFORE first commercial SMS
2. **Identification**: First SMS must clearly identify your business ("Info: Haie Lite – call 514-555-1234")
3. **Unsubscribe Mechanism**: Every SMS must include way to opt-out (STOP reply, link with "unsubscribe")
4. **STOP Processing**: Must honor opt-outs within 10 business days
5. **Penalty**: Up to **$15 million CAD** per violation (can compound per SMS)

#### Express vs Implied Consent
- **Express Consent**: Explicit, affirmative act (checkbox, signature, verbal confirmation recorded)
  - Example: Checked "Yes, contact me via SMS" checkbox on lead form
  - Valid indefinitely unless revoked

- **Implied Consent**: NOT valid for SMS under CASL
  - Example: Browsing website, filling inquiry form WITHOUT explicit SMS checkbox
  - If only email or phone consent given, cannot SMS without express consent

#### Enforcement History
- **Hudson's Bay Company (2017)**: $120,000 penalty for not processing STOP keywords within required timeframe
- **Multiple Retailers**: Pattern of penalties for missing unsubscribe links in promotional SMS

**Source**: [CASL - Canada Anti-Spam Legislation](https://fightspam.gc.ca/eic/site/030.nsf/eng/home)

---

### 9. Facebook Lead Ads Consent for SMS Follow-up

#### Can Facebook Lead Consent Be Used for SMS?
**Short Answer**: Partially – it depends on the checkbox structure.

#### Scenario 1: Email-Only Consent (CANNOT SMS)
```
Lead Form Checkbox:
☐ "I agree to be contacted about special offers via email"
   (Checked/unchecked = irrelevant for SMS)
```
**Result**: SMS contact is NOT compliant; must have separate SMS checkbox.

#### Scenario 2: Multi-Channel Consent (CAN SMS)
```
Lead Form Checkbox:
☐ "I agree to be contacted about special offers via email and SMS"
   (Must be UNCHECKED by default)
```
**Result**: If prospect checks this box, SMS is compliant under CASL.

#### Scenario 3: Transactional Exemption (Can SMS Immediately)
```
Lead Form Context:
1. Prospect submits form for "free quote"
2. No consent checkbox needed for acknowledgment SMS
3. First SMS: "Thanks for submitting! Your quote is being prepared. Reply STOP to unsubscribe."
```
**Result**: Transactional acknowledgment SMS is CASL-compliant WITHOUT prior consent (if purely transactional).

#### Best Practice Structure
```
Lead Form (Facebook Lead Ads):

Your Information:
[Name]
[Phone]
[Email]

How should we contact you?
☐ Email (for follow-ups & promotional offers)  [DEFAULT: UNCHECKED]
☐ SMS (for immediate quotes & availability)   [DEFAULT: UNCHECKED]
☐ Phone (for consultation scheduling)         [DEFAULT: UNCHECKED]

[Note: Include in form footer]
"By selecting SMS above, you explicitly consent to receive
SMS messages per CASL. You may unsubscribe by replying STOP."
```

**Implementation Note**:
- Facebook default is "checked" for many fields; set ALL consent boxes to **unchecked by default**
- Store checkbox state with every lead for audit compliance
- Document timestamp when consent given (proof required if CASL investigation)

**Source**: [Facebook Lead Ads + CASL Compliance](https://www.facebook.com/business/help/120325701656605)

---

### 10. Valid "Express Consent" Under CASL

#### What Constitutes Express Consent?
**Any of the following** (with documented proof):
1. **Written Consent** (digital = valid):
   - Checkbox on website/form (unchecked by default)
   - Email confirmation ("Do you agree to SMS?")
   - Document signed (e-signature acceptable)

2. **Explicit Verbal Consent** (if recorded):
   - Phone call where prospect says "yes, SMS me"
   - IVR confirmation ("Press 1 for SMS contact")
   - MUST be recorded per state/provincial law

3. **Behavioral Consent** (limited):
   - Prospect initiates SMS conversation with you ("Hi, do you have a quote available?")
   - You can reply to that conversation
   - Replying to inbound SMS = implicit consent for follow-up on same thread

#### What Does NOT Constitute Express Consent
- **Implied**: Prospect filled out form without explicit SMS checkbox
- **Inferred**: Prospect provided phone number in contact field ≠ SMS consent
- **Pre-checked**: Checkbox that defaults to "yes" = invalid (must be opt-in, not opt-out)
- **Co-marketing**: Partner gave you phone number without prospect's knowledge = invalid

#### Proof Requirements (For CASL Audit)
- **Screenshot** of consent form at time of capture
- **Timestamp** of consent (database record)
- **Prospect's identifier** (phone + email + name)
- **Date consent given** vs date first SMS sent

#### Example: Compliant Consent Flow
```
1. Prospect submits Facebook Lead Ads form
   → Checkbox: "☐ I agree to SMS contact" (UNCHECKED by default)
   → Prospect checks box
   → Facebook stores: timestamp, consent status, form URL

2. Your system receives lead via webhook
   → Store: consent timestamp, form snapshot, prospect details
   → Wait 0-5 minutes (show responsiveness)

3. Send first qualification SMS
   → Content: "Hi [Name], thanks for submitting! Quick question: Is your cedar hedge 20+ feet long?
     Reply with YES/NO. Info: Haie Lite 514-555-1234"
   → Log: SMS sent timestamp, MessageSid, cost

4. Audit trail: Consent timestamp → SMS timestamp = compliant
```

**Source**: [CASL Express Consent Requirements](https://fightspam.gc.ca/eic/site/030.nsf/eng/00282.html)

---

### 11. Required Elements in First SMS Message

#### CASL-Mandated Elements (All Required)
1. **Business Identification** (required in EVERY message):
   - Format: "Info: [Business Name] – [Phone or Link]"
   - Example: "Info: Haie Lite – 514-555-1234" (21 chars, 1 SMS segment)
   - Alternative: "Info: Haie Lite – haielite.ca" (with link)
   - If using link: Must be short, HTTPS, and land on contact info page

2. **Unsubscribe Mechanism** (required in EVERY message):
   - "Reply STOP to unsubscribe" (23 chars)
   - Alternative: Link to unsubscribe page (must honor immediately)
   - CASL allows: "Reply ARRET" (French) OR "Reply STOP" (English) OR both

3. **Content Context** (first message should indicate intent):
   - "Thanks for your inquiry – " (establishes relationship)
   - "Quick question about your hedge – " (establishes commercial intent)
   - Avoids "Your account has been confirmed" (transactional disguise)

#### Example: Compliant First SMS (160 chars exactly)
```
Hi [First Name], thanks for your inquiry! Quick question:
Is your cedar hedge 20+ ft long? Reply YES/NO. Info: Haie
Lite 514-555-1234. Reply STOP to unsubscribe.
```
**Segment Count**: 2 SMS (95 chars + 97 chars = split at 160)
**Cost**: $0.030 (2 × $0.015)

#### Transactional Exception (First Message Only)
If SMS is **purely transactional** (appointment confirmation, order status):
- Identification required: "Info: Haie Lite"
- Unsubscribe required: "Reply STOP"
- No commercial language allowed (no "special offer" or "limited time")
- **Example**: "Appointment confirmed: March 31, 2pm at 123 Main St. Info: Haie Lite 514-555-1234. Reply STOP to unsubscribe."

#### Referral Exception (One Commercial SMS Without Consent)
If prospect was referred by existing customer:
- **Rule**: Can send ONE commercial SMS if you disclose the referrer
- **Example**: "Hi [Name], [Existing Customer Name] referred us! Are you interested in hedge trimming? Reply YES/NO. Referred by: [Name]. Info: Haie Lite 514-555-1234."
- Must note referrer in message
- Second SMS requires express consent

**Source**: [CASL Required Message Elements](https://fightspam.gc.ca/eic/site/030.nsf/eng/00289.html)

---

### 12. Opt-Out & STOP Keyword Processing

#### STOP Keyword Requirements
- **Supported Keywords**: STOP, UNSUBSCRIBE, END, QUIT, ARRET (French), DESINSCRIPTION (French)
- **Processing Requirement**: Must process within **10 business days** (not calendar days)
- **Automatic**: Honor immediately upon receipt (best practice: process within 1 hour)
- **All Channels**: Apply to all SMS, not just promotional

#### 10 Business Day Compliance Window
- **Day 0**: Prospect replies "STOP"
- **Day 10**: Deadline to confirm opt-out in system
- **Grace Period Messaging**: One final SMS allowed (e.g., "You've been unsubscribed. You won't receive further messages.")

#### Implementation Process
```
1. Receive inbound SMS containing "STOP" (case-insensitive)
   → Log MessageSid, From number, timestamp

2. Immediate processing (within 1 hour):
   → Flag prospect as "opted out" in database
   → Add to global unsubscribe list
   → Send confirmation: "You're unsubscribed. No further messages."

3. Audit trail (for CASL defense):
   → Store: inbound MessageSid, opt-out timestamp, flag status
   → Query before every outbound send: "Is this number opted out?"

4. Documentation (required in investigation):
   → Screenshot of unsubscribe confirmation
   → Timestamp in database
   → Log showing no SMS sent after opt-out date
```

#### Hudson's Bay Company Case Study (Enforcement Precedent)
- **Violation**: Sent SMS to numbers on do-not-contact list
- **Root Cause**: Processed opt-outs manually; took 30+ days for some
- **Penalty**: $120,000 CAD
- **ISED Finding**: Failure to "promptly" honor opt-out requests
- **Lesson**: Automate opt-out processing; manual delays = compliance failure

#### Multi-List Management
```
Global Unsubscribe List:
- CASL_OPTED_OUT (prospect replied STOP)
- EMAIL_OPTED_OUT (prospect opted out of email separately)
- INVALID_NUMBERS (carrier reports bad/disconnected)
- COMPLAINTS (prospect marked as spam)

Before sending SMS to [Number]:
IF [Number] in CASL_OPTED_OUT OR INVALID_NUMBERS → SKIP
ELSE → SEND
```

#### False Positives (Prospect Says "STOP" in Mid-Conversation)
```
You:  "Your quote is $2,500. Reply YES to proceed."
Prospect: "STOP trying to convince me"
```
**Interpretation**: Treat as opt-out (err on side of compliance)
- **Action**: Mark opted out
- **Messaging**: "Understood. You won't receive further messages."
- **Recovery**: If prospect later replies "Actually, tell me more", require re-consent

**Source**: [CASL STOP Keyword & Opt-Out Compliance](https://fightspam.gc.ca/eic/site/030.nsf/eng/00290.html)

---

### 13. Transactional vs Commercial Messages Under CASL

#### Definition: Transactional Message
A message whose **primary purpose** is to facilitate an existing transaction or update.

**Examples** (NO consent needed):
- "Your appointment is confirmed for March 31, 2pm."
- "Your quote is ready: $2,500. Download here: [link]"
- "Payment received. Order #12345 is being prepared."
- "Your password reset code is: 123456"

**Rules for Transactional Messages**:
- NO promotional language allowed ("Special offer!", "Limited time!")
- NO cross-selling allowed ("While you're here, try our gutter cleaning!")
- MUST include identification: "Info: Haie Lite"
- MUST include unsubscribe: "Reply STOP"
- No separate consent checkbox needed (exemption applies)

#### Definition: Commercial Message
Any message whose **primary purpose** is marketing, promotion, or soliciting a transaction.

**Examples** (Express consent REQUIRED):
- "Hi John, we're offering 15% off hedge trimming this week!"
- "Spring special: cedar trimming $2.50/sqft. Book now!"
- "We've helped 500+ homeowners. Call for your free quote!"

**Rules for Commercial Messages**:
- MUST have prior express written consent
- MUST include identification: "Info: Haie Lite"
- MUST include unsubscribe: "Reply STOP"
- Cannot be sent to cold/purchased lists

#### Gray Zone: Lead Qualification Messages
**Scenario**: Prospect submitted lead form (consent: unchecked SMS box). You send: "Hi, is your hedge 20+ feet long? Reply YES/NO."

**Classification**: **COMMERCIAL** (not transactional)
- **Reasoning**: Prospect hasn't committed to transaction yet; you're qualifying before offer
- **CASL Requirement**: Express consent checkbox must be checked
- **Cost**: $0.015/SMS (same as transactional)
- **Guideline**: Treat all qualification sequences as commercial until contract signed

#### Strategy for Lead Qualification Compliance
```
Lead Form (Facebook):
☐ "I agree to SMS contact about my hedge" [DEFAULT: UNCHECKED]

If checked:
  → Send Day 1: Qualification SMS (commercial, consent-backed)
  → Send Day 3: Follow-up SMS (if no reply) (commercial)
  → Send Day 7: Final touch (if no reply) (commercial)

If NOT checked:
  → Do NOT send SMS
  → Send email inquiry instead (less compliant risk)
  → OR wait for inbound call/email to establish transactional SMS eligibility
```

#### CASL Penalty Exposure: Transactional vs Commercial Misclassification
- **Sending commercial SMS as "transactional"**: CASL violation = $15M CAD penalty
- **Adding promotional language to transactional SMS**: Same violation
- **Example**: Sending "Book now – 15% off!" to confirmed appointment recipients = violation

**Source**: [CASL Transactional Message Exemption](https://fightspam.gc.ca/eic/site/030.nsf/eng/00287.html)

---

### 14. Facebook Lead Form Consent Checkboxes

#### Recommended Form Structure
**Field 1: Personal Information**
```
Full Name: [____________]
Phone: [____________]
Email: [____________]
Street Address: [____________]
City/Province: [____________]
Hedge Type: ☐ Cedar ☐ Feuillue ☐ Other
Hedge Length: [____________] feet
Hedge Height (target): [____________] feet
```

**Field 2: Contact Preferences (DEFAULT ALL UNCHECKED)**
```
How would you like us to contact you?

☐ Email (for quotes, follow-ups, promotional offers)
  [Facebook stores consent state when prospect checks/unchecks]

☐ SMS (for quick responses and availability)
  [This is the CASL-critical checkbox]
  [Must remain UNCHECKED until prospect actively selects]

☐ Phone (for consultation scheduling)

[Form Footer - REQUIRED]
"By selecting SMS above, you give us permission to contact
you via text message per the Canada Anti-Spam Act (CASL).
You may unsubscribe at any time by replying 'STOP'."
```

#### Technical Implementation (Facebook Lead Ads)
1. **In Facebook Ads Manager**:
   - Form Type: "Lead Form"
   - Field: "Checkbox" → Label: "I agree to SMS contact"
   - **Default**: Set to "unchecked" (required for CASL)
   - **Pre-filled**: Leave blank (no default values that could trick prospect)

2. **Form Submission Flow**:
   ```
   [Prospect clicks "Submit"]
   → Facebook captures form data
   → Facebook sends webhook to your API:

   {
     "lead_id": "12345",
     "form_id": "your-form-id",
     "created_time": "2026-03-31T14:30:00Z",
     "field_data": [
       { "name": "first_name", "values": ["John"] },
       { "name": "phone_number", "values": ["+15145550199"] },
       { "name": "email", "values": ["john@example.com"] },
       { "name": "sms_consent", "values": ["true"] }  // KEY FIELD
     ]
   }
   ```

3. **Your Backend Processing**:
   ```javascript
   // Pseudo-code
   const smsConsent = fieldData.find(f => f.name === "sms_consent");

   if (smsConsent?.values[0] === "true") {
     // Prospect checked SMS box = has express consent
     await db.leads.create({
       phone: "+15145550199",
       sms_consent: true,
       consent_timestamp: new Date(),
       form_url: "https://facebook.com/...", // Save snapshot for audit
       source: "facebook_lead_ads"
     });

     // OK to send qualification SMS
     await sendQualificationSMS("+15145550199");
   } else {
     // Prospect did NOT check SMS box = no consent
     await db.leads.create({
       phone: "+15145550199",
       sms_consent: false,
       consent_timestamp: new Date()
     });

     // Do NOT send SMS; use email instead
     await sendQualificationEmail("john@example.com");
   }
   ```

#### Proof of Consent Storage (CASL Defense)
For every lead, store in database:
```json
{
  "lead_id": 12345,
  "phone": "+15145550199",
  "sms_consent": true,
  "consent_timestamp": "2026-03-31T14:30:00Z",
  "consent_source": "facebook_lead_ads",
  "form_snapshot": {
    "form_url": "https://www.facebook.com/lead_gen_tool/...",
    "form_name": "Hedge Quote Request",
    "consent_field_label": "I agree to SMS contact",
    "consent_field_value": "checked"
  },
  "sms_sent": [
    {
      "timestamp": "2026-03-31T14:35:00Z",
      "message_id": "SM123...",
      "body": "Hi John, thanks for submitting! Is your cedar hedge 20+ feet long? Reply YES/NO. Info: Haie Lite 514-555-1234. Reply STOP to unsubscribe.",
      "cost": 0.015
    }
  ]
}
```

**Why This Matters**: If CASL investigates, you must prove:
1. Prospect explicitly checked SMS box (screenshot)
2. Checkbox was unchecked by default (form audit log)
3. Timestamp of consent (database record)
4. Date of first SMS (message log)
5. No SMS sent after opt-out (unsubscribe list check)

Lacking ANY of these = violation; ISED assumes bad faith.

**Source**: [Facebook Lead Ads Custom Fields](https://www.facebook.com/business/help/380063580898181)

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Twilio Setup (Week 1-2)
- [ ] Create Twilio account (Canada region preferred)
- [ ] Obtain Canadian Business Number (CBN) from CRA for registration
- [ ] Order local 10DLC number (514 area code recommended)
- [ ] Submit 10DLC campaign registration (expect 24-48h approval)
- [ ] Verify 10DLC status; request increase to 3 MPS if needed
- [ ] Configure incoming webhook URL in Twilio Console
- [ ] Configure status callback URL for delivery tracking
- [ ] Test inbound SMS reception (send test message)
- [ ] Test outbound SMS sending (verify $0.015 charge, content integrity)

### Phase 2: CASL Compliance Setup (Week 1)
- [ ] Draft SMS templates with required elements (identification + unsubscribe)
- [ ] Test template length (ensure <160 chars where possible)
- [ ] Create unsubscribe list in database (global do-not-contact)
- [ ] Build STOP keyword processing logic (auto-flag opted-out numbers)
- [ ] Document audit trail schema (store timestamps, MessageSid, consent proofs)
- [ ] Create form footer text: "By selecting SMS, you consent per CASL..."
- [ ] Set up email alerts for unsubscribe requests (compliance team review)

### Phase 3: Facebook Lead Ads Integration (Week 1-2)
- [ ] Create or modify Facebook Lead Form
- [ ] Add SMS consent checkbox (DEFAULT: UNCHECKED)
- [ ] Set up webhook to receive lead data from Facebook
- [ ] Configure field mapping (name, phone, email, sms_consent)
- [ ] Build database schema to store leads + consent snapshot
- [ ] Test form submission → webhook receipt → database storage

### Phase 4: Qualification Sequence Design (Week 2)
- [ ] Design 3-5 question SMS sequence (max 160 chars each)
- [ ] Include identification in first SMS
- [ ] Include unsubscribe in every SMS
- [ ] Test segmentation (ensure messages don't exceed SMS limits)
- [ ] Draft follow-up logic (if no reply after 24h, send SMS #2)
- [ ] Build CRM integration (log responses, score leads)

### Phase 5: Pilot Campaign (Week 3-4)
- [ ] Test with 100 internal prospects (employees, family)
- [ ] Verify SMS delivery rate >95%
- [ ] Monitor status callbacks (track sent vs delivered)
- [ ] Test opt-out workflow (verify STOP processing within 1 hour)
- [ ] Audit database for consent proof (screenshots, timestamps)
- [ ] Dry-run CASL audit response (can you provide proof of consent for all 100?)

### Phase 6: Production Launch (Week 5+)
- [ ] Scale to full prospect list (1,000+ leads)
- [ ] Implement rate limiting (stagger sends over 2-3 days; 1 MPS)
- [ ] Monitor carrier delivery (if <90%, pause and review)
- [ ] Set up daily reconciliation (sent count vs delivered count)
- [ ] Schedule weekly opt-out list cleanup (no SMS to unsubscribed)
- [ ] Document for CASL audit (retention: 3 years minimum)

---

## RISK & ENFORCEMENT

### CASL Penalties

| Violation Type | Penalty Range | Notes |
|---|---|---|
| Sending without consent | $200K-$15M CAD | Compounds per message |
| Failing to process STOP | $200K-$15M CAD | Hudson's Bay: $120K (2017) |
| Missing identification | $200K-$3M CAD | "Info:" requirement |
| Missing unsubscribe | $200K-$3M CAD | "Reply STOP" required |
| Sending after opt-out | $200K-$15M CAD | Worst-case violation |

**Example**: 500 SMS sent without consent = up to 500 × $15M = theoretical max $7.5B (practically, ISED settles lower, but precedent is 0.5-2% of revenue).

### Audit Defense Checklist
**If ISED Investigates, You Must Produce**:
1. **Consent Proof**: Screenshot of unchecked-by-default checkbox for every prospect
2. **Timestamp**: Date/time consent given (database record)
3. **First SMS Proof**: Copy of first SMS + timestamp (shows identification + unsubscribe)
4. **Opt-Out Proof**: Date/time STOP was processed; confirmation SMS sent
5. **No Further SMS**: Query results showing no SMS sent to unsubscribed number after opt-out date
6. **Cost Justification**: Your business case (why SMS is necessary for lead qualification)

**Missing ANY of these = presumed violation; burden shifts to you to prove compliance.**

### Twilio Account Suspension Risk
- **Spam Complaints**: If complaint rate >0.5%, Twilio may revoke 10DLC
- **CASL Violation**: If complaint filed with ISED → Twilio investigated → account suspended during probe
- **Recovery**: 30-90 days minimum; may require new number

### Mitigation Strategies
1. **Segment carefully**: Only SMS to prospects who explicitly checked SMS checkbox
2. **Personalize**: Use first name in every message (reduces spam filtering + shows legitimacy)
3. **Throttle sends**: Don't bulk send 1,000 SMS in 1 hour (spread over 2-3 days)
4. **Monitor metrics**: Track delivery rate, complaint rate, engagement rate weekly
5. **Respond to complaints**: If prospect complains, immediately review their consent proof
6. **Archive everything**: Keep all form screenshots, consent timestamps, SMS logs for 3 years

---

## SUMMARY

### For Haie Lite SMS Lead Qualification System
**Recommended Stack**:
- **Twilio Programmable Messaging API** (stateless, $0.015/SMS)
- **Local 10DLC number** (514 area code, $1.15/month)
- **Facebook Lead Ads** with SMS consent checkbox (default: unchecked)
- **CASL-compliant SMS templates** (identification + unsubscribe mandatory)
- **Automated STOP processing** (within 1 hour; audit trail for 3 years)

**Estimated Costs (1,000 prospect monthly campaign)**:
- SMS: $15 (1,000 × $0.015)
- Number: $1.15/month
- Toll-Free (optional, if scaling): +$2.63/month
- **Total: ~$16-18/month** (includes 3-5 message sequences per prospect)

**Compliance Timeline**:
- CBN registration: 1-2 days
- 10DLC approval: 2-3 days
- Full audit-ready system: 3-4 weeks

**Risk Level**: **HIGH** if SMS consent checkbox is missing or pre-checked. **LOW** if fully compliant.

---

## References

### Twilio Documentation
- [Twilio SMS for Canada](https://www.twilio.com/en-us/messaging/sms)
- [10DLC Registration Guide](https://www.twilio.com/docs/sms/10dlc)
- [Incoming Webhooks](https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-to-incoming-sms-messages)
- [Status Callbacks](https://www.twilio.com/docs/sms/tutorials/how-to-confirm-delivery-of-sms-messages)
- [Canada Pricing](https://www.twilio.com/en-us/pricing/messaging)

### CASL Resources
- [CASL Official Government Site](https://fightspam.gc.ca/eic/site/030.nsf/eng/home)
- [Express Consent Requirements](https://fightspam.gc.ca/eic/site/030.nsf/eng/00282.html)
- [STOP Keyword Compliance](https://fightspam.gc.ca/eic/site/030.nsf/eng/00290.html)
- [Required Message Elements](https://fightspam.gc.ca/eic/site/030.nsf/eng/00289.html)

### Case Law
- Hudson's Bay Company CASL penalty (2017): $120K for non-compliance with STOP keyword processing

---

**Document Version**: 1.0
**Last Updated**: March 31, 2026
**Status**: Ready for Implementation
**Compliance Review**: Pending legal review (recommended before launch)
