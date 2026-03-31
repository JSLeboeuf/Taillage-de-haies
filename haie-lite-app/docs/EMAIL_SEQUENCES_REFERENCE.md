# Email Sequences Reference

This document details all email templates in the acquisition outreach system.

## Cold Sequence (5 emails over 22 days)

For completely cold prospects with no prior contact.

### Step 1 — Expansion Intro (J+0)

**Subject:** `Expansion Haie Lite: Taille de haie récurrente pour [company_name] 🌿`

**Purpose:** Hook attention with expansion news + company name

**Key Points:**

- Regional expansion announcement
- Personalized company mention
- Benefit-driven CTA: "30% cost reduction"
- High-level positioning

**Next Email:** J+3

---

### Step 2 — Limited Offer (J+3)

**Subject:** `Suivant | Offre spéciale partenaires lancée`

**Purpose:** Create urgency with limited-time offer

**Key Points:**

- Follow-up confirmation
- Limited window (15 days)
- PDF offer download link
- Low friction: "Just reply"

**Next Email:** J+7

---

### Step 3 — Social Proof (J+7)

**Subject:** `3e contact | Preuve sociale + cas d'usage`

**Purpose:** Build credibility with case studies

**Key Points:**

- Acknowledge persistence (builds rapport)
- 3 measurable results shown
- Cost reduction: -28%
- Frequency optimization
- Scaling proof (4 new contracts)
- Case studies link

**Next Email:** J+12

---

### Step 4 — Last Chance (J+12)

**Subject:** `Dernier | Calendrier de lancement encore disponible`

**Purpose:** Final push with concrete next steps

**Key Points:**

- Signal this is last outreach email
- 3 launch week options provided
- Calendar booking link
- Direct reply option

**Next Email:** J+22 (moves to nurture)

---

### Step 5 → Nurture (J+22)

**Subject:** `Suivi | Intégration à notre programme de rétention`

**Purpose:** Transition non-responders to nurture track

**Key Points:**

- Acknowledge lack of response
- Position as VIP (not spam)
- Promise quarterly updates
- Explicit content: seasonal offers, calendar optimization, case studies
- Warm closing

**Next Email:** 90 days (quarterly)

---

## Warm Sequence (4 emails over 12 days)

For warm introductions (referrals, warm connections).

### Step 1 — Warm Intro (J+0)

**Subject:** `Introduction | Taille de haie récurrente pour [company_name]`

**Purpose:** Establish credibility via referral

**Key Points:**

- Reference the recommender: "[Recommandant]"
- Company-specific positioning
- Quick intro (2-minute pitch)
- Professional framing

**Next Email:** J+2

---

### Step 2 — Custom Offer (J+2)

**Subject:** `Suivi | Offre personnalisée pour [company_name]`

**Purpose:** Show personalization + research

**Key Points:**

- Custom proposal PDF
- Fast turnaround
- Low friction: "call if questions"

**Next Email:** J+5

---

### Step 3 — Next Steps (J+5)

**Subject:** `Suivi | Prochaines étapes et calendrier`

**Purpose:** Clarify implementation path

**Key Points:**

- 3-step process clearly outlined
  1. Alignment call (20 min)
  2. Final proposal + terms
  3. Signature + 48h launch
- Calendar booking link
- Action-oriented

**Next Email:** J+12 (if no response)

---

### Step 4 — Final (J+12)

**Subject:** `Dernier contact | Nous restons disponibles`

**Purpose:** Graceful exit to nurture

**Key Points:**

- Explicit final message signal
- Add to quarterly nurture program
- Re-engagement option ("reply anytime")
- Professional closure

**Next Email:** 90 days (quarterly in nurture)

---

## Blast Sequence (3 emails over 2 days)

For urgent, time-limited campaigns (season launches, limited slots).

### Step 1 — Urgent Offer (J+0)

**Subject:** `URGENT | Offre limitée 48h — Lancement avril`

**Purpose:** Create maximum urgency

**Key Points:**

- ALL CAPS + emoji (⏰)
- Red text warning: "48h only"
- Launch week announcement
- Scarcity: "5 first contracts" 20% discount
- Direct signup CTA

**Next Email:** J+1

---

### Step 2 — Last Chance (J+1)

**Subject:** `Attention | Plus que 24h pour l'offre lancée hier`

**Purpose:** Extreme final push

**Key Points:**

- LAST CHANCE signal
- 24h remaining countdown
- Signup link again
- Direct contact option

**Next Email:** J+2

---

### Step 3 → Waitlist (J+2)

**Subject:** `L'offre a expiré — Prochaine opportunité en mai`

**Purpose:** Convert non-converters to waitlist

**Key Points:**

- Offer closed message
- Next wave announcement (May)
- Waitlist signup link
- FOMO: "be among the first"

**Next Email:** 30 days (next wave launch)

---

## Nurture Sequence (2 emails, quarterly)

For long-term engagement with non-immediate prospects.

### Step 1 — Seasonal Update (Q1: 90 days)

**Subject:** `Mise à jour | Nouvelle offre saisonnière printemps`

**Purpose:** Stay top-of-mind with seasonal offers

**Key Points:**

- Acknowledge prior interest
- New seasonal offer
- Spring-specific messaging
- Low-pressure informational

**Next Email:** 90 days

---

### Step 2 — Product Updates (Q2: 180 days)

**Subject:** `Mise à jour | Optimisations implémentées ce trimestre`

**Purpose:** Demonstrate active development

**Key Points:**

- 3 major improvements listed
  - Improved scheduling algorithm
  - 15% team cost reduction
  - Real-time client tracking interface
- Link to detailed updates
- Shows continued innovation

**Next Email:** 90 days (cycle repeats)

---

## Email Design Guidelines

### HTML Structure

```html
<h2>Bonjour,</h2>
<p>Body paragraph...</p>
[Multiple paragraphs as needed]
<br />
<p>À bientôt,<br />Jean-Samuel Leboeuf<br />Haie Lite</p>
```

### Tone

- Conversational (vous/tu not required)
- Honest, not salesy
- Personality: "I" statements (JS)
- Acknowledge sequence position when appropriate

### CTAs

- Links use: `<a href="...">Click text</a>`
- Base URLs: `https://haielite.ca`
- Paths: `/acquisition/{sequence_type}/{slug}`
- Actions: signup, offer-pdf, case-studies, schedule-call, waitlist

### Personalization

- Company name: `${prospect.company_name}`
- All other details: kept generic
- NO employee names (except JS at bottom)

### Emojis

- Used sparingly for attention-grabbing
- Cold: 🌿 (green, nature)
- Blast: ⏰ ✅ (urgency + confirmation)
- Generally: avoid excessive emoji

---

## Performance Metrics to Track

Once integrated with email provider webhooks:

### Open Rate by Sequence Type

```
Cold:   ~22% (industry avg 18-25%)
Warm:   ~35% (industry avg 30-40%)
Blast:  ~40% (high urgency)
Nurture: ~15% (low engagement expected)
```

### Click-Through Rate

```
Cold:   ~3% (low engagement)
Warm:   ~8% (higher intent)
Blast:  ~15% (time-sensitive)
Nurture: ~2% (awareness only)
```

### Conversion Rate

```
Cold:   0.5-1% (long sales cycle)
Warm:   5-10% (referral credibility)
Blast:  2-5% (depends on offer quality)
```

### Best Send Times

- Cold & Warm: **Tuesday-Wednesday 10 AM EDT**
- Blast: **ASAP after scheduling**
- Nurture: **Thursday 2 PM EDT**

---

## A/B Testing Ideas

Future enhancements for subject line testing:

### Cold Sequence Step 1

- A: `Expansion Haie Lite: Taille de haie récurrente pour [company] 🌿`
- B: `[company] — Réduction de 30% sur entretien de haies`
- Winner: Likely A (company name + emoji)

### Cold Sequence Step 3

- A: `3e contact | Preuve sociale + cas d'usage`
- B: `Cas d'usage: -28% coûts, +4 contrats en 90 jours`
- Winner: Likely B (concrete numbers)

### Blast Sequence Step 1

- A: `URGENT | Offre limitée 48h — Lancement avril`
- B: `⏰ Dernier jour: 20% réduction avant lancement`
- Winner: Likely B (more direct discount call-out)

---

## Common Customizations

### By Industry

- Landscaping companies: Add maintenance plan focus
- Property management: Emphasize scheduling + compliance
- Construction: Add sustainability angle

### By Region

- Quebec: French-first messaging
- Canada-wide: Bilingual consideration
- USA expansion: English templates needed

### By Company Size

- Large (50+ employees): Focus on compliance, data
- Medium (10-50): Focus on cost reduction + efficiency
- Small (<10): Focus on simplicity + support

---

## Compliance Notes

### GDPR/CASL

- All emails must have unsubscribe option
- Add to `acquisition_activities` when unsubscribe received
- Respect "Do not contact" signals

### Email Best Practices

- From address: `Jean-Samuel Leboeuf <js@haielite.ca>`
- Reply-To: `js@haielite.ca`
- Plain text fallback: Ensure sendEmail() has text param
- Link tracking: Enable via Resend webhooks

### Deliverability

- Monitor bounce rate (target: <2%)
- Check spam complaints (target: <0.5%)
- Warm up IP if new sender
- Use authenticated domain (haielite.ca)
