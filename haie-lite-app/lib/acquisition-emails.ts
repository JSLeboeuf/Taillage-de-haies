/**
 * Acquisition M&A Email Templates
 * Based on: operations/sequences-courriels-acquisition.md
 * Framework: Roland Frasier (EPIC) + Codie Sanchez (Main Street Millionaire)
 */

export interface AcquisitionProspect {
  id: string;
  company_name: string;
  owner_name: string;
  owner_email: string;
  estimated_age_years?: number;
  territory?: string;
  motivation?: string;
  sequence_type:
    | "cold"
    | "warm"
    | "hot"
    | "nurture"
    | "referral"
    | "career_change"
    | "blast"
    | "reactivation"
    | "partnership";
  sequence_step: number;
  referrer_name?: string;
  offer_plan_a?: string;
  offer_plan_b?: string;
  company_age_years?: number;
  annual_revenue?: number;
  profit_adjusted?: number;
  equipment_list?: string;
  employees_count?: number;
  last_contacted_date?: string;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const SIGNATURE_TEXT = `Jean-Samuel Leboeuf
Taillage Haie Élite
514-XXX-XXXX`;

const SIGNATURE_HTML = `<p>
  <strong>Jean-Samuel Leboeuf</strong><br />
  Taillage Haie Élite<br />
  514-XXX-XXXX
</p>`;

/**
 * Get next email delay in days based on sequence type and step
 */
export function getNextEmailDelay(sequenceType: string, step: number): number | null {
  const delays: Record<string, Record<number, number>> = {
    cold: { 1: 4, 2: 8 },
    warm: { 1: 7, 2: 14 },
    hot: { 1: 5, 2: 9 },
    nurture: { 1: 180, 2: 365, 3: 730, 4: 1095 },
    referral: { 1: 5 },
    career_change: { 1: 3 },
    blast: { 0: 0 },
    reactivation: { 1: 7 },
    partnership: { 1: 7 },
  };

  return delays[sequenceType]?.[step] ?? null;
}

/**
 * Generate acquisition email based on prospect and sequence
 */
export function getAcquisitionEmail(
  prospect: AcquisitionProspect,
  sequenceType: string,
  step: number,
): EmailTemplate | null {
  switch (sequenceType) {
    case "cold":
      return getColdEmail(prospect, step);
    case "warm":
      return getWarmEmail(prospect, step);
    case "hot":
      return getHotEmail(prospect, step);
    case "nurture":
      return getNurtureEmail(prospect, step);
    case "referral":
      return getReferralEmail(prospect, step);
    case "career_change":
      return getCareerChangeEmail(prospect, step);
    case "blast":
      return getBlastEmail(prospect);
    case "reactivation":
      return getReactivationEmail(prospect, step);
    case "partnership":
      return getPartnershipEmail(prospect, step);
    default:
      return null;
  }
}

/**
 * COLD SEQUENCE — Premier contact
 */
function getColdEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name, company_name } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

Êtes-vous ouvert à discuter de l'avenir de ${company_name} ?

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Êtes-vous ouvert à discuter de l'avenir de ${company_name} ?</p>
${SIGNATURE_HTML}`;

    return {
      subject: `${owner_name}, une question rapide`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `Bonjour ${owner_name},

Je m'appelle Jean-Samuel Leboeuf. Je suis co-propriétaire de Taillage Haie Élite sur la Rive-Sud de Montréal.

En faisant mes recherches sur les entreprises de taillage les plus respectées de la région, votre nom est revenu à plusieurs reprises.

Je ne sais pas si vous avez déjà pensé à votre plan de relève, mais je cherche à acquérir une entreprise établie avec une clientèle fidèle — exactement comme la vôtre.

Mon approche :
- Je préserve ce que vous avez bâti (clients, réputation, employés)
- Je vous offre des termes flexibles — à votre rythme
- La première étape, c'est juste un café — sans engagement

Êtes-vous fermé à l'idée d'une conversation de 10 minutes ?

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Je m'appelle Jean-Samuel Leboeuf. Je suis co-propriétaire de Taillage Haie Élite sur la Rive-Sud de Montréal.</p>
<p>En faisant mes recherches sur les entreprises de taillage les plus respectées de la région, votre nom est revenu à plusieurs reprises.</p>
<p>Je ne sais pas si vous avez déjà pensé à votre plan de relève, mais je cherche à acquérir une entreprise établie avec une clientèle fidèle — exactement comme la vôtre.</p>
<p><strong>Mon approche :</strong></p>
<ul>
  <li>Je préserve ce que vous avez bâti (clients, réputation, employés)</li>
  <li>Je vous offre des termes flexibles — à votre rythme</li>
  <li>La première étape, c'est juste un café — sans engagement</li>
</ul>
<p>Êtes-vous fermé à l'idée d'une conversation de 10 minutes ?</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Re: ${owner_name}, une question rapide`,
      text,
      html,
    };
  }

  if (step === 3) {
    const text = `Bonjour ${owner_name},

Je ne veux pas être insistant. C'est mon dernier courriel.

Si un jour vous pensez à la retraite, à vendre, ou simplement à connaître la valeur de votre entreprise (gratuit, sans engagement), mon offre tient toujours.

Je vous souhaite une excellente saison.

Jean-Samuel
514-XXX-XXXX`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Je ne veux pas être insistant. C'est mon dernier courriel.</p>
<p>Si un jour vous pensez à la retraite, à vendre, ou simplement à connaître la valeur de votre entreprise (gratuit, sans engagement), mon offre tient toujours.</p>
<p>Je vous souhaite une excellente saison.</p>
<p>Jean-Samuel<br />514-XXX-XXXX</p>`;

    return {
      subject: `${owner_name} — dernière tentative`,
      text,
      html,
    };
  }

  return null;
}

/**
 * WARM SEQUENCE — After first phone call
 */
function getWarmEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name, company_name, company_age_years } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

Merci pour votre temps au téléphone aujourd'hui. C'est clair que ${company_name} est une entreprise solide — ${company_age_years ?? "X"} années de réputation, ça ne se bâtit pas du jour au lendemain.

Comme discuté, voici les prochaines étapes si vous voulez explorer :

CE DONT J'AURAIS BESOIN :
1. États des résultats (3 dernières années)
2. Bilans (3 dernières années)
3. Liste de l'équipement (type, âge approximatif)
4. Nombre d'employés et salaires approximatifs

Vous pouvez me les envoyer directement ou me mettre en contact avec votre comptable.

CE QUE VOUS RECEVREZ EN RETOUR :
- Une évaluation gratuite de la valeur de votre entreprise
- Deux scénarios d'offre (Plan A et Plan B) pour que vous puissiez comparer
- Zéro obligation

Aucune pression. Si vous voulez y réfléchir quelques semaines, c'est parfait.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Merci pour votre temps au téléphone aujourd'hui. C'est clair que ${company_name} est une entreprise solide — ${company_age_years ?? "X"} années de réputation, ça ne se bâtit pas du jour au lendemain.</p>
<p>Comme discuté, voici les prochaines étapes si vous voulez explorer :</p>
<p><strong>CE DONT J'AURAIS BESOIN :</strong></p>
<ol>
  <li>États des résultats (3 dernières années)</li>
  <li>Bilans (3 dernières années)</li>
  <li>Liste de l'équipement (type, âge approximatif)</li>
  <li>Nombre d'employés et salaires approximatifs</li>
</ol>
<p>Vous pouvez me les envoyer directement ou me mettre en contact avec votre comptable.</p>
<p><strong>CE QUE VOUS RECEVREZ EN RETOUR :</strong></p>
<ul>
  <li>Une évaluation gratuite de la valeur de votre entreprise</li>
  <li>Deux scénarios d'offre (Plan A et Plan B) pour que vous puissiez comparer</li>
  <li>Zéro obligation</li>
</ul>
<p>Aucune pression. Si vous voulez y réfléchir quelques semaines, c'est parfait.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Merci pour la conversation, ${owner_name}`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `Bonjour ${owner_name},

J'espère que votre semaine se passe bien. Avez-vous eu la chance de parler à votre comptable ?

Je sais que c'est un processus — pas de rush. Si c'est plus simple, je peux contacter votre comptable directement (avec votre permission) pour accélérer les choses de votre côté.

Qu'est-ce qui serait le plus facile pour vous ?

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>J'espère que votre semaine se passe bien. Avez-vous eu la chance de parler à votre comptable ?</p>
<p>Je sais que c'est un processus — pas de rush. Si c'est plus simple, je peux contacter votre comptable directement (avec votre permission) pour accélérer les choses de votre côté.</p>
<p>Qu'est-ce qui serait le plus facile pour vous ?</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Suivi rapide — documents financiers`,
      text,
      html,
    };
  }

  if (step === 3) {
    const text = `Bonjour ${owner_name},

Je voulais vérifier si l'idée de vendre est toujours quelque chose qui vous intéresse.

Trois options :
1. OUI, J'AVANCE — je vous envoie les prochaines étapes
2. PAS MAINTENANT, MAIS PLUS TARD — je vous recontacte dans 6 mois
3. NON MERCI — aucun problème, bonne saison

Un mot suffit.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Je voulais vérifier si l'idée de vendre est toujours quelque chose qui vous intéresse.</p>
<p><strong>Trois options :</strong></p>
<ol>
  <li>OUI, J'AVANCE — je vous envoie les prochaines étapes</li>
  <li>PAS MAINTENANT, MAIS PLUS TARD — je vous recontacte dans 6 mois</li>
  <li>NON MERCI — aucun problème, bonne saison</li>
</ol>
<p>Un mot suffit.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `${owner_name} — toujours dans vos plans ?`,
      text,
      html,
    };
  }

  return null;
}

/**
 * HOT SEQUENCE — Offer stage
 */
function getHotEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name, company_name } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

Merci pour votre transparence avec les financiers. Voici notre analyse et deux options pour vous.

---

ÉVALUATION

Chiffre d'affaires moyen (3 ans) : [X] $
Profit ajusté (BAIIA - salaire opérateur) : [Y] $
Multiple appliqué : [Z]x
Valeur d'entreprise : [TOTAL] $
Équipement inclus : [Liste]

---

PLAN A — Prix maximum + financement vendeur

Prix total : [X + 20%] $
Mise de fonds (15%) : [A] $ à la signature
Financement vendeur : [B] $ sur 7 ans à 5%
Paiement mensuel pour vous : [C] $/mois
Intérêts totaux que VOUS recevez : [D] $
Consultation (6 mois) : [E] $/mois

PLAN B — Cash rapide + prix réduit

Prix total : [X] $
Paiement comptant : [F] $ (financement banque)
Earnout (12 mois, basé rétention) : [G] $
Délai de fermeture : 60-90 jours

---

COMPARAISON NET DANS VOS POCHES

 | Plan A (financement vendeur) | Plan B (cash + earnout)
Prix de vente | [X + 20%] $ | [X] $
Intérêts pour vous | + [D] $ | 0 $
Taux d'imposition | ~30% (étalé 7 ans) | ~45% (année courante)
Net après impôts | [GROS] $ | [PETIT] $

Dans 90% des cas, le Plan A met plus d'argent dans vos poches. Les intérêts vont chez VOUS, pas chez la banque. Et l'impôt étalé sur 7 ans vous garde dans un bracket beaucoup plus bas.

---

PROTECTIONS POUR VOUS

- Nantissement sur tous les actifs de l'entreprise
- Assurance vie sur l'acheteur (paiement intégral si décès)
- Clause de reprise automatique après 3 paiements manqués
- Rapports financiers trimestriels
- Droit de regard pendant la transition

---

Cette offre est préliminaire et sans engagement de votre part. On peut ajuster n'importe quel élément.

Quel plan vous parle le plus ? Je peux me déplacer cette semaine pour en discuter.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Merci pour votre transparence avec les financiers. Voici notre analyse et deux options pour vous.</p>
<hr />
<p><strong>ÉVALUATION</strong></p>
<table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Chiffre d'affaires moyen (3 ans)</td>
    <td style="padding: 8px;">[X] $</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Profit ajusté (BAIIA - salaire opérateur)</td>
    <td style="padding: 8px;">[Y] $</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Multiple appliqué</td>
    <td style="padding: 8px;">[Z]x</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;"><strong>Valeur d'entreprise</strong></td>
    <td style="padding: 8px;"><strong>[TOTAL] $</strong></td>
  </tr>
  <tr>
    <td style="padding: 8px;">Équipement inclus</td>
    <td style="padding: 8px;">[Liste]</td>
  </tr>
</table>
<hr />
<p><strong>PLAN A — Prix maximum + financement vendeur</strong></p>
<table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Prix total</td>
    <td style="padding: 8px;"><strong>[X + 20%] $</strong></td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Mise de fonds (15%)</td>
    <td style="padding: 8px;">[A] $ à la signature</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Financement vendeur</td>
    <td style="padding: 8px;">[B] $ sur 7 ans à 5%</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Paiement mensuel pour vous</td>
    <td style="padding: 8px;"><strong>[C] $/mois</strong></td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Intérêts totaux que VOUS recevez</td>
    <td style="padding: 8px;">[D] $</td>
  </tr>
  <tr>
    <td style="padding: 8px;">Consultation (6 mois)</td>
    <td style="padding: 8px;">[E] $/mois</td>
  </tr>
</table>
<p><strong>PLAN B — Cash rapide + prix réduit</strong></p>
<table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Prix total</td>
    <td style="padding: 8px;"><strong>[X] $</strong></td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Paiement comptant</td>
    <td style="padding: 8px;">[F] $ (financement banque)</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px;">Earnout (12 mois, basé rétention)</td>
    <td style="padding: 8px;">[G] $</td>
  </tr>
  <tr>
    <td style="padding: 8px;">Délai de fermeture</td>
    <td style="padding: 8px;">60-90 jours</td>
  </tr>
</table>
<hr />
<p><strong>COMPARAISON NET DANS VOS POCHES</strong></p>
<table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
  <thead>
    <tr style="border-bottom: 2px solid #333;">
      <th style="padding: 8px; text-align: left;"></th>
      <th style="padding: 8px; text-align: left;">Plan A (financement vendeur)</th>
      <th style="padding: 8px; text-align: left;">Plan B (cash + earnout)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">Prix de vente</td>
      <td style="padding: 8px;">[X + 20%] $</td>
      <td style="padding: 8px;">[X] $</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">Intérêts pour vous</td>
      <td style="padding: 8px;">+ [D] $</td>
      <td style="padding: 8px;">0 $</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">Taux d'imposition</td>
      <td style="padding: 8px;">~30% (étalé 7 ans)</td>
      <td style="padding: 8px;">~45% (année courante)</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Net après impôts</strong></td>
      <td style="padding: 8px;"><strong>[GROS] $</strong></td>
      <td style="padding: 8px;"><strong>[PETIT] $</strong></td>
    </tr>
  </tbody>
</table>
<blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 15px 0;">
  <p>Dans 90% des cas, le Plan A met plus d'argent dans vos poches. Les intérêts vont chez VOUS, pas chez la banque. Et l'impôt étalé sur 7 ans vous garde dans un bracket beaucoup plus bas.</p>
</blockquote>
<hr />
<p><strong>PROTECTIONS POUR VOUS</strong></p>
<ul>
  <li>Nantissement sur tous les actifs de l'entreprise</li>
  <li>Assurance vie sur l'acheteur (paiement intégral si décès)</li>
  <li>Clause de reprise automatique après 3 paiements manqués</li>
  <li>Rapports financiers trimestriels</li>
  <li>Droit de regard pendant la transition</li>
</ul>
<hr />
<p>Cette offre est préliminaire et sans engagement de votre part. On peut ajuster n'importe quel élément.</p>
<p>Quel plan vous parle le plus ? Je peux me déplacer cette semaine pour en discuter.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Offre pour ${company_name} — Deux options`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `Bonjour ${owner_name},

J'espère que vous avez eu le temps de consulter l'offre avec votre comptable ou votre conjoint(e).

Les questions les plus fréquentes que je reçois :

"POURQUOI PAS JUSTE DU CASH ?"
→ Je peux. Mais regardez la comparaison : avec le financement vendeur, vous gardez [D] $ d'intérêts + payez moins d'impôts. Net dans vos poches = [X]$ de plus.

"C'EST PAS ASSEZ."
→ Les termes sont flexibles. On peut ajouter un earnout, allonger la durée, ou inclure une consultation payée. Le prix du marché pour notre industrie est [Z]x le profit — mais je veux que vous soyez satisfait.

"J'AI BESOIN DE TEMPS."
→ L'offre reste ouverte. Pas de date limite.

Un appel de 15 minutes suffirait pour ajuster. Quand êtes-vous disponible ?

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>J'espère que vous avez eu le temps de consulter l'offre avec votre comptable ou votre conjoint(e).</p>
<p><strong>Les questions les plus fréquentes que je reçois :</strong></p>
<p><strong>"Pourquoi pas juste du cash ?"</strong><br />
→ Je peux. Mais regardez la comparaison : avec le financement vendeur, vous gardez [D] $ d'intérêts + payez moins d'impôts. Net dans vos poches = [X]$ de plus.</p>
<p><strong>"C'est pas assez."</strong><br />
→ Les termes sont flexibles. On peut ajouter un earnout, allonger la durée, ou inclure une consultation payée. Le prix du marché pour notre industrie est [Z]x le profit — mais je veux que vous soyez satisfait.</p>
<p><strong>"J'ai besoin de temps."</strong><br />
→ L'offre reste ouverte. Pas de date limite.</p>
<p>Un appel de 15 minutes suffirait pour ajuster. Quand êtes-vous disponible ?</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Re: Offre — Vos questions ?`,
      text,
      html,
    };
  }

  if (step === 3) {
    const text = `Bonjour ${owner_name},

Je voulais simplement savoir où vous en êtes.

1. PRÊT À AVANCER → On fixe un rendez-vous cette semaine
2. BESOIN DE PLUS DE TEMPS → Dites-moi quand vous recontacter
3. PAS POUR VOUS → Aucun problème, merci pour votre temps

Quelle que soit votre réponse, je la respecte.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Je voulais simplement savoir où vous en êtes.</p>
<ol>
  <li><strong>PRÊT À AVANCER</strong> → On fixe un rendez-vous cette semaine</li>
  <li><strong>BESOIN DE PLUS DE TEMPS</strong> → Dites-moi quand vous recontacter</li>
  <li><strong>PAS POUR VOUS</strong> → Aucun problème, merci pour votre temps</li>
</ol>
<p>Quelle que soit votre réponse, je la respecte.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `${owner_name} — On se reparle ?`,
      text,
      html,
    };
  }

  return null;
}

/**
 * NURTURE SEQUENCE — Long-term relationship
 */
function getNurtureEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name, company_name } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

Merci pour la rencontre. C'est clair que vous avez une entreprise bien rodée, et je comprends parfaitement que ce n'est pas le moment.

Pour votre information, j'ai préparé une estimation informelle de la valeur de votre entreprise — pas pour vous convaincre, mais pour que vous ayez un chiffre en tête le jour où vous serez prêt :

ESTIMATION PRÉLIMINAIRE : [X] $ — [Y] $
(Basée sur [Z]x le profit ajusté, sujette à validation des financiers)

Je vais vous recontacter dans quelques mois pour prendre des nouvelles. D'ici là, mon numéro est toujours ouvert.

Excellente saison,

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Merci pour la rencontre. C'est clair que vous avez une entreprise bien rodée, et je comprends parfaitement que ce n'est pas le moment.</p>
<p>Pour votre information, j'ai préparé une estimation informelle de la valeur de votre entreprise — pas pour vous convaincre, mais pour que vous ayez un chiffre en tête le jour où vous serez prêt :</p>
<p style="border-left: 3px solid #333; padding-left: 15px; margin: 15px 0;">
  <strong>ESTIMATION PRÉLIMINAIRE : [X] $ — [Y] $</strong><br />
  <em>(Basée sur [Z]x le profit ajusté, sujette à validation des financiers)</em>
</p>
<p>Je vais vous recontacter dans quelques mois pour prendre des nouvelles. D'ici là, mon numéro est toujours ouvert.</p>
<p>Excellente saison,</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Content de vous avoir rencontré, ${owner_name}`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `Bonjour ${owner_name},

J'espère que la saison a été bonne.

De notre côté, Taillage Haie Élite a grandi : [réalisation concrète — ex: "on a ajouté 2 équipes et acquis une entreprise à Candiac"]. On continue à chercher des entreprises de qualité.

Si votre réflexion a évolué, je serais heureux de reprendre la conversation autour d'un café. Sinon, bonne fin de saison et bon repos !

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>J'espère que la saison a été bonne.</p>
<p>De notre côté, Taillage Haie Élite a grandi : [réalisation concrète — ex: "on a ajouté 2 équipes et acquis une entreprise à Candiac"]. On continue à chercher des entreprises de qualité.</p>
<p>Si votre réflexion a évolué, je serais heureux de reprendre la conversation autour d'un café. Sinon, bonne fin de saison et bon repos !</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Comment s'est passée votre saison, ${owner_name} ?`,
      text,
      html,
    };
  }

  if (step === 3) {
    const text = `Bonjour ${owner_name},

Avec le retour du printemps, je voulais prendre de vos nouvelles.

Depuis l'an dernier, on a [réalisation]. Les multiples de valorisation dans notre industrie continuent d'augmenter — votre entreprise vaut probablement plus qu'il y a un an.

Si [année] est l'année où vous commencez à planifier votre transition, j'aimerais être le premier à qui vous en parlez.

Bonne saison,

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Avec le retour du printemps, je voulais prendre de vos nouvelles.</p>
<p>Depuis l'an dernier, on a [réalisation]. Les multiples de valorisation dans notre industrie continuent d'augmenter — votre entreprise vaut probablement plus qu'il y a un an.</p>
<p>Si [année] est l'année où vous commencez à planifier votre transition, j'aimerais être le premier à qui vous en parlez.</p>
<p>Bonne saison,</p>
${SIGNATURE_HTML}`;

    return {
      subject: `${owner_name} — Début de saison + mise à jour`,
      text,
      html,
    };
  }

  if (step === 4) {
    const text = `Bonjour ${owner_name},

Ça fait 2 ans qu'on s'est rencontrés. J'espère que les affaires vont bien.

Mon intérêt pour ${company_name} est toujours là. Et avec notre croissance, notre capacité d'offrir un bon prix a augmenté aussi.

Si vous voulez une mise à jour gratuite de la valeur de votre entreprise, faites-moi signe — ça prend 15 minutes.

Au plaisir,

Jean-Samuel
514-XXX-XXXX`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Ça fait 2 ans qu'on s'est rencontrés. J'espère que les affaires vont bien.</p>
<p>Mon intérêt pour ${company_name} est toujours là. Et avec notre croissance, notre capacité d'offrir un bon prix a augmenté aussi.</p>
<p>Si vous voulez une mise à jour gratuite de la valeur de votre entreprise, faites-moi signe — ça prend 15 minutes.</p>
<p>Au plaisir,</p>
<p>Jean-Samuel<br />514-XXX-XXXX</p>`;

    return {
      subject: `Toujours là pour vous, ${owner_name}`,
      text,
      html,
    };
  }

  if (step === 5) {
    const text = `Bonjour ${owner_name},

Mon check-in annuel. J'espère que tout va bien de votre côté.

Haie Élite est maintenant à [X] équipes, [Y] $ de CA. On a acquis [Z] entreprises dans les dernières années. Si vous êtes plus proche de votre retraite qu'il y a 3 ans, la conversation est toujours ouverte.

Pas de pression — juste un rappel que l'offre est là.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Mon check-in annuel. J'espère que tout va bien de votre côté.</p>
<p>Haie Élite est maintenant à [X] équipes, [Y] $ de CA. On a acquis [Z] entreprises dans les dernières années. Si vous êtes plus proche de votre retraite qu'il y a 3 ans, la conversation est toujours ouverte.</p>
<p>Pas de pression — juste un rappel que l'offre est là.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `${owner_name} — Nouvelles annuelles`,
      text,
      html,
    };
  }

  return null;
}

/**
 * REFERRAL SEQUENCE — Introduction by third party
 */
function getReferralEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name, referrer_name, company_name } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

${referrer_name} m'a mentionné que vous pourriez songer à [la retraite / un changement / vendre votre clientèle].

Je m'appelle Jean-Samuel Leboeuf — Taillage Haie Élite, Rive-Sud de Montréal. On cherche à acquérir des entreprises de taillage établies dans la région.

${referrer_name} a de bons mots pour votre entreprise, et c'est exactement le profil qu'on recherche.

Mon approche : prix juste, termes flexibles, transition à votre rythme.

Seriez-vous disponible pour un appel de 10 minutes cette semaine ?

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>${referrer_name} m'a mentionné que vous pourriez songer à [la retraite / un changement / vendre votre clientèle].</p>
<p>Je m'appelle Jean-Samuel Leboeuf — Taillage Haie Élite, Rive-Sud de Montréal. On cherche à acquérir des entreprises de taillage établies dans la région.</p>
<p>${referrer_name} a de bons mots pour votre entreprise, et c'est exactement le profil qu'on recherche.</p>
<p><strong>Mon approche :</strong> prix juste, termes flexibles, transition à votre rythme.</p>
<p>Seriez-vous disponible pour un appel de 10 minutes cette semaine ?</p>
${SIGNATURE_HTML}`;

    return {
      subject: `${referrer_name} m'a parlé de vous`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `Bonjour ${owner_name},

Je voulais m'assurer que mon courriel ne s'était pas perdu. ${referrer_name} pensait vraiment que ça valait la peine qu'on se parle.

Même si ce n'est pas le bon moment pour vendre, je peux vous donner une estimation gratuite de la valeur de votre entreprise — ça pourrait être utile pour votre planification.

10 minutes au téléphone, sans engagement.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Je voulais m'assurer que mon courriel ne s'était pas perdu. ${referrer_name} pensait vraiment que ça valait la peine qu'on se parle.</p>
<p>Même si ce n'est pas le bon moment pour vendre, je peux vous donner une estimation gratuite de la valeur de votre entreprise — ça pourrait être utile pour votre planification.</p>
<p>10 minutes au téléphone, sans engagement.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Re: ${referrer_name} m'a parlé de vous`,
      text,
      html,
    };
  }

  return null;
}

/**
 * CAREER CHANGE SEQUENCE — Quick deal
 */
function getCareerChangeEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

J'ai entendu dire que vous vous dirigez vers [la construction / un nouveau projet]. Bonne décision.

Plutôt que de laisser vos clients de taillage sans service, je peux reprendre votre clientèle rapidement :

- PRIX : [30-40%] du chiffre d'affaires annuel
- PAIEMENT : Moitié à la signature, moitié après 90 jours (conditionnel à la rétention)
- VOTRE RÔLE : Un appel à vos clients pour présenter le transfert
- TIMELINE : On peut closer en 2 semaines

Combien de clients réguliers avez-vous, et quel est votre CA annuel en taillage ? Avec ces 2 chiffres, je vous fais une offre ferme demain.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>J'ai entendu dire que vous vous dirigez vers [la construction / un nouveau projet]. Bonne décision.</p>
<p>Plutôt que de laisser vos clients de taillage sans service, je peux reprendre votre clientèle rapidement :</p>
<ul>
  <li><strong>Prix :</strong> [30-40%] du chiffre d'affaires annuel</li>
  <li><strong>Paiement :</strong> Moitié à la signature, moitié après 90 jours (conditionnel à la rétention)</li>
  <li><strong>Votre rôle :</strong> Un appel à vos clients pour présenter le transfert</li>
  <li><strong>Timeline :</strong> On peut closer en 2 semaines</li>
</ul>
<p>Combien de clients réguliers avez-vous, et quel est votre CA annuel en taillage ? Avec ces 2 chiffres, je vous fais une offre ferme demain.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Votre clientèle de taillage — offre en 24h`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `${owner_name},

Juste un suivi rapide. La saison approche — si on veut transférer vos clients avant qu'ils appellent quelqu'un d'autre, le timing est maintenant.

Un appel de 5 minutes suffit.

Jean-Samuel
514-XXX-XXXX`;

    const html = `<p>${owner_name},</p>
<p>Juste un suivi rapide. La saison approche — si on veut transférer vos clients avant qu'ils appellent quelqu'un d'autre, le timing est maintenant.</p>
<p>Un appel de 5 minutes suffit.</p>
<p>Jean-Samuel<br />514-XXX-XXXX</p>`;

    return {
      subject: `Re: Votre clientèle — Toujours intéressé ?`,
      text,
      html,
    };
  }

  return null;
}

/**
 * BLAST SEQUENCE — Mass outreach
 */
function getBlastEmail(prospect: AcquisitionProspect): EmailTemplate | null {
  const text = `Bonjour,

Je m'appelle Jean-Samuel Leboeuf. Mon entreprise, Taillage Haie Élite, est en train de consolider le marché du taillage de haies sur la Rive-Sud de Montréal.

On contacte un nombre limité de propriétaires d'entreprises de taillage et d'élagage dans la grande région de Montréal.

SI VOUS ÊTES DANS L'UNE DE CES SITUATIONS :

- Vous pensez à la retraite dans les 1 à 5 prochaines années
- Vous n'avez pas de relève familiale
- Vous voulez passer à autre chose (construction, immobilier, etc.)
- Vous voulez simplement connaître la valeur de votre entreprise

CE QU'ON OFFRE :

- Évaluation gratuite et confidentielle de votre entreprise
- Prix juste basé sur le profit réel (pas le chiffre d'affaires)
- Termes flexibles — financement vendeur, transition graduelle, earnout
- Vos employés et vos clients sont protégés

Intéressé ? Répondez "OUI" à ce courriel et je vous rappelle dans les 24h.

Pas intéressé ? Aucun problème — je ne vous recontacterai pas.

Cordialement,

Jean-Samuel Leboeuf
Co-propriétaire, Taillage Haie Élite
514-XXX-XXXX | [Site web]`;

  const html = `<p>Bonjour,</p>
<p>Je m'appelle Jean-Samuel Leboeuf. Mon entreprise, Taillage Haie Élite, est en train de consolider le marché du taillage de haies sur la Rive-Sud de Montréal.</p>
<p>On contacte un nombre limité de propriétaires d'entreprises de taillage et d'élagage dans la grande région de Montréal.</p>
<p><strong>SI VOUS ÊTES DANS L'UNE DE CES SITUATIONS :</strong></p>
<ul>
  <li>Vous pensez à la retraite dans les 1 à 5 prochaines années</li>
  <li>Vous n'avez pas de relève familiale</li>
  <li>Vous voulez passer à autre chose (construction, immobilier, etc.)</li>
  <li>Vous voulez simplement connaître la valeur de votre entreprise</li>
</ul>
<p><strong>CE QU'ON OFFRE :</strong></p>
<ul>
  <li>Évaluation gratuite et confidentielle de votre entreprise</li>
  <li>Prix juste basé sur le profit réel (pas le chiffre d'affaires)</li>
  <li>Termes flexibles — financement vendeur, transition graduelle, earnout</li>
  <li>Vos employés et vos clients sont protégés</li>
</ul>
<p>Intéressé ? Répondez <strong>"OUI"</strong> à ce courriel et je vous rappelle dans les 24h.</p>
<p>Pas intéressé ? Aucun problème — je ne vous recontacterai pas.</p>
<p>Cordialement,</p>
<p><strong>Jean-Samuel Leboeuf</strong><br />
Co-propriétaire, Taillage Haie Élite<br />
514-XXX-XXXX | [Site web]</p>`;

  return {
    subject: `Propriétaires d'entreprises de taillage — Évaluation gratuite`,
    text,
    html,
  };
}

/**
 * REACTIVATION SEQUENCE — Past "no" prospects
 */
function getReactivationEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name } = prospect;

  if (step === 1) {
    const text = `${owner_name},

Avez-vous toujours votre entreprise de taillage ?

Jean-Samuel
514-XXX-XXXX`;

    const html = `<p>${owner_name},</p>
<p>Avez-vous toujours votre entreprise de taillage ?</p>
<p>Jean-Samuel<br />514-XXX-XXXX</p>`;

    return {
      subject: `${owner_name}`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `Content d'avoir de vos nouvelles, ${owner_name}.

Depuis notre dernière conversation, Haie Élite a [réalisation concrète]. Notre capacité d'acquisition a augmenté et on peut offrir de meilleurs termes qu'avant.

Est-ce que votre situation a évolué ? Si oui, un café de 20 minutes suffirait pour voir où on en est.

${SIGNATURE_TEXT}`;

    const html = `<p>Content d'avoir de vos nouvelles, ${owner_name}.</p>
<p>Depuis notre dernière conversation, Haie Élite a [réalisation concrète]. Notre capacité d'acquisition a augmenté et on peut offrir de meilleurs termes qu'avant.</p>
<p>Est-ce que votre situation a évolué ? Si oui, un café de 20 minutes suffirait pour voir où on en est.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Re: ${owner_name}`,
      text,
      html,
    };
  }

  return null;
}

/**
 * PARTNERSHIP SEQUENCE — Soft entry (Host-Beneficiary)
 */
function getPartnershipEmail(
  prospect: AcquisitionProspect,
  step: number,
): EmailTemplate | null {
  const { owner_name, company_name } = prospect;

  if (step === 1) {
    const text = `Bonjour ${owner_name},

Je ne vous contacte pas pour acheter votre entreprise.

J'ai une idée qui pourrait augmenter vos revenus sans que ça vous coûte quoi que ce soit.

Mon entreprise, Taillage Haie Élite, offre [service complémentaire — ex: contrats annuels d'entretien / lavage de vitres / fertilisation]. Vos clients pourraient être intéressés, et on partagerait les profits.

COMMENT ÇA MARCHE :
1. On teste avec 10-15 de vos clients (pas tous)
2. Vous leur envoyez une recommandation
3. On fait le travail et on partage le revenu [X%] avec vous
4. Si ça ne marche pas, on arrête — zéro risque pour vous

Ça vous intéresse d'en discuter ? 10 minutes au téléphone.

${SIGNATURE_TEXT}`;

    const html = `<p>Bonjour ${owner_name},</p>
<p>Je ne vous contacte pas pour acheter votre entreprise.</p>
<p>J'ai une idée qui pourrait augmenter vos revenus sans que ça vous coûte quoi que ce soit.</p>
<p>Mon entreprise, Taillage Haie Élite, offre [service complémentaire — ex: contrats annuels d'entretien / lavage de vitres / fertilisation]. Vos clients pourraient être intéressés, et on partagerait les profits.</p>
<p><strong>COMMENT ÇA MARCHE :</strong></p>
<ol>
  <li>On teste avec 10-15 de vos clients (pas tous)</li>
  <li>Vous leur envoyez une recommandation</li>
  <li>On fait le travail et on partage le revenu [X%] avec vous</li>
  <li>Si ça ne marche pas, on arrête — zéro risque pour vous</li>
</ol>
<p>Ça vous intéresse d'en discuter ? 10 minutes au téléphone.</p>
${SIGNATURE_HTML}`;

    return {
      subject: `Idée de partenariat — ${company_name}`,
      text,
      html,
    };
  }

  if (step === 2) {
    const text = `${owner_name},

Mon idée est simple : je veux augmenter vos revenus, pas remplacer quoi que ce soit.

On commence petit (10-15 clients). Si les résultats sont là, on continue. Sinon, on arrête et vous n'avez rien perdu.

5 minutes au téléphone — ça vaut le coup ?

Jean-Samuel
514-XXX-XXXX`;

    const html = `<p>${owner_name},</p>
<p>Mon idée est simple : je veux augmenter vos revenus, pas remplacer quoi que ce soit.</p>
<p>On commence petit (10-15 clients). Si les résultats sont là, on continue. Sinon, on arrête et vous n'avez rien perdu.</p>
<p>5 minutes au téléphone — ça vaut le coup ?</p>
<p>Jean-Samuel<br />514-XXX-XXXX</p>`;

    return {
      subject: `Re: Idée de partenariat`,
      text,
      html,
    };
  }

  return null;
}
