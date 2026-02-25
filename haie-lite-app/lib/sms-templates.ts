// All SMS templates for Haie Lite automation
// CRTC/LCAP compliant: includes opt-out in marketing messages

export const SMS = {
  // ============================================================
  // QUOTE & BOOKING
  // ============================================================

  quoteAutomatic: (name: string, amount: number) =>
    `Bonjour ${name}! Merci pour votre demande. ` +
    `Estimation: ${amount}$ (taxes incl.) pour votre taille de haie. ` +
    `Répondez OUI pour confirmer ou appelez-nous au 514-XXX-XXXX. ` +
    `- Haie Lite`,

  bookingConfirmation: (name: string, date: string, timeSlot: string) =>
    `Confirmé! ${name}, votre taille de haie est prévue le ${date} (${timeSlot}). ` +
    `Notre équipe vous contactera 30 min avant l'arrivée. ` +
    `- Haie Lite`,

  // ============================================================
  // FOLLOW-UP SEQUENCE (J1, J3, J7, J14)
  // ============================================================

  followupJ1: (name: string) =>
    `Bonjour ${name}, avez-vous eu le temps de consulter notre soumission? ` +
    `Répondez OUI pour confirmer. On peut aussi ajuster si nécessaire! ` +
    `- Haie Lite`,

  followupJ3: (name: string) =>
    `${name}, petit rappel! Votre soumission est toujours valide. ` +
    `Les places se remplissent vite pour ce mois-ci. ` +
    `Répondez OUI pour booker. - Haie Lite`,

  followupJ7: (name: string, discount: number) =>
    `${name}, dernière chance! ${discount}% de rabais si vous confirmez cette semaine. ` +
    `Répondez OUI ou appelez-nous. - Haie Lite`,

  followupJ14: (name: string) =>
    `${name}, votre soumission va expirer bientôt. ` +
    `Pas de pression — on est là quand vous serez prêt! ` +
    `Appelez-nous au 514-XXX-XXXX. - Haie Lite ` +
    `STOP pour ne plus recevoir`,

  // ============================================================
  // DAY-OF-SERVICE
  // ============================================================

  jobConfirmationJ1: (name: string, date: string) =>
    `Rappel: ${name}, votre taille de haie est prévue demain (${date}). ` +
    `SVP assurez-vous que l'accès à la haie est dégagé. ` +
    `Répondez REPORTER si vous devez changer la date. - Haie Lite`,

  crewEnRoute: (name: string, eta: string) =>
    `${name}, notre équipe est en route! Arrivée estimée: ${eta}. ` +
    `- Haie Lite`,

  jobCompleted: (name: string) =>
    `${name}, votre taille de haie est terminée! ` +
    `Merci de votre confiance. On vous envoie la facture sous peu. ` +
    `- Haie Lite`,

  // ============================================================
  // POST-SERVICE (REVIEWS & REFERRALS)
  // ============================================================

  reviewRequest: (name: string, reviewLink: string) =>
    `${name}, merci d'avoir choisi Haie Lite! ` +
    `Votre avis compte beaucoup pour nous: ${reviewLink} ` +
    `Ça prend 30 secondes. Merci! 🌿`,

  referralRequest: (name: string, code: string) =>
    `${name}, référez un ami et recevez 50$ de crédit! ` +
    `Votre code: ${code}. Partagez-le! ` +
    `Votre ami reçoit aussi 10% de rabais. - Haie Lite ` +
    `STOP pour ne plus recevoir`,

  // ============================================================
  // UPSELL
  // ============================================================

  upsellFertilisation: (name: string, price: number) =>
    `Bonjour ${name}! Notre équipe a remarqué que votre haie bénéficierait d'une fertilisation. ` +
    `Ça renforce les racines et donne un feuillage plus dense. ` +
    `Prix: ${price}$ (taxes incl.). Répondez OUI pour booker. - Haie Lite`,

  upsellPestTreatment: (name: string, issue: string, price: number) =>
    `Bonjour ${name}! Notre équipe a détecté ${issue} sur vos cèdres. ` +
    `Un traitement préventif éviterait la propagation. ` +
    `Prix: ${price}$. Répondez OUI pour booker. - Haie Lite`,

  upsellWinterProtection: (name: string, price: number) =>
    `Bonjour ${name}! L'hiver approche. ` +
    `On offre la protection hivernale (toile) pour vos cèdres exposés. ` +
    `Prix: ${price}$. Répondez OUI pour réserver. - Haie Lite`,

  upsellCedarReplacement: (name: string, count: number, price: number) =>
    `Bonjour ${name}! Notre équipe a remarqué ${count} cèdre(s) mort(s) dans votre haie. ` +
    `On peut les remplacer pour garder votre haie uniforme. ` +
    `Prix: ${price}$. Répondez OUI pour booker. - Haie Lite`,

  upsellGeneric: (name: string, service: string, benefit: string, price: number) =>
    `Bonjour ${name}! Nous recommandons ${service} pour ${benefit}. ` +
    `Prix: ${price}$. Répondez OUI pour booker. - Haie Lite`,

  // ============================================================
  // EMPLOYEE NOTIFICATIONS
  // ============================================================

  employeeBonusReview: (name: string, clientName: string, amount: number) =>
    `Bravo ${name}! ${clientName} vous a donné 5 étoiles! ` +
    `+${amount}$ bonus sur votre prochain chèque. Continue comme ça!`,

  employeeBonusReferral: (name: string, amount: number) =>
    `${name}, un client que vous avez servi a référé quelqu'un! ` +
    `+${amount}$ commission. Merci!`,

  employeeBonusUpsell: (name: string, service: string, amount: number) =>
    `${name}, le client a accepté votre suggestion de ${service}! ` +
    `+${amount}$ commission. Beau travail!`,

  employeeWeeklyScore: (name: string, score: number, projectedBonus: number) =>
    `${name} — Score cette semaine: ${score}/100\n` +
    `Bonus projeté: ~${projectedBonus}$\n` +
    `Détails dans l'app. Continue!`,

  // ============================================================
  // INTERNAL REPORTS
  // ============================================================

  dailyPayrollReport: (report: string) =>
    `MASSE SALARIALE\n${report}`,

  dailyKPIReport: (report: string) =>
    `KPI QUOTIDIEN\n${report}`,

  // ============================================================
  // REACTIVATION (DORMANT CLIENTS)
  // ============================================================

  dormantReactivation: (name: string, lastYear: string, discount: number) =>
    `Bonjour ${name}! Ça fait un moment depuis votre dernière taille (${lastYear}). ` +
    `Vos cèdres ont besoin d'amour! ${discount}% rabais si vous bookez ce mois-ci. ` +
    `Répondez OUI ou appelez au 514-XXX-XXXX. - Haie Lite ` +
    `STOP pour ne plus recevoir`,

  // ============================================================
  // WEATHER
  // ============================================================

  weatherDelay: (name: string, originalDate: string, newDate: string) =>
    `${name}, en raison de la météo, votre rendez-vous du ${originalDate} ` +
    `est reporté au ${newDate}. Désolé pour l'inconvénient! ` +
    `Répondez OK pour confirmer ou appelez-nous. - Haie Lite`,
} as const;
