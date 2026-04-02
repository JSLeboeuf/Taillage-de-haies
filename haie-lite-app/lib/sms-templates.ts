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

  weatherDelay: (name: string, originalDate: string, newDate: string, reason: string) =>
    `${name}, en raison de ${reason}, votre RDV du ${originalDate} ` +
    `est reporte au ${newDate}. ` +
    `Repondez OK pour confirmer ou APPELER pour nous joindre. - Haie Lite`,

  weatherDelayEmployee: (crewName: string, date: string, jobsCount: number) =>
    `METEO ${date}: ${jobsCount} job(s) reportes pour ${crewName}. ` +
    `Consultez votre horaire mis a jour. - Haie Lite`,

  weatherRescheduleConfirmed: (name: string, newDate: string) =>
    `Parfait ${name}! Votre RDV du ${newDate} est confirme. ` +
    `Notre equipe vous contactera la veille. - Haie Lite`,

  // ============================================================
  // RAPPORT PHOTO POST-VISITE
  // ============================================================

  rapportPhoto: (name: string, photoLink: string) =>
    `${name}, voici votre rapport photos avant/après de la visite d'aujourd'hui: ` +
    `${photoLink} ` +
    `- Haie Lite`,

  // ============================================================
  // CONTRAT ANNUEL — CONVERSION & BIENVENUE
  // ============================================================

  annualContractOffer: (name: string, deadlineDate: string, link: string) =>
    `Bonjour ${name}! On réserve les plans annuels 2026 cette semaine — ` +
    `vitres+haies+gouttières à 1400$/an. Tarif gelé avant hausse le ${deadlineDate}. ` +
    `Répondez OUI pour qu'on vous appelle ou: ${link} ` +
    `- Haie Lite STOP pour arrêter`,

  annualContractOfferRelance: (name: string, deadlineDate: string, link: string) =>
    `${name}, petit rappel — le tarif 2026 pour le Plan Tranquillité est garanti ` +
    `jusqu'au ${deadlineDate}. Après ça, hausse de 8%. ` +
    `Répondez OUI ou: ${link} - Haie Lite STOP pour arrêter`,

  annualContractOfferLastCall: (name: string, link: string) =>
    `${name}, dernière chance au tarif 2025! Le Plan Annuel monte à 1512$/an dès demain. ` +
    `Cette semaine c'est encore 1400$. Répondez OUI ou: ${link} - Haie Lite`,

  annualContractWelcome: (name: string, firstVisitDate: string) =>
    `Bienvenue au Plan Tranquillité, ${name}! ` +
    `Votre contrat annuel est actif (vitres+haies+gouttières, 2 passages chacun). ` +
    `Premier passage: ${firstVisitDate}. Rien à gérer — on vous contacte la veille. ` +
    `- Haie Lite`,

  annualContractWelcomeImmaculee: (name: string, firstVisitDate: string) =>
    `Bienvenue au Plan Propriété Immaculée, ${name}! ` +
    `Votre contrat premium est actif. ` +
    `Premier passage: ${firstVisitDate}. Rapport détaillé après chaque visite. ` +
    `- Haie Lite`,

  // ============================================================
  // RENOUVELLEMENT ANNUEL
  // ============================================================

  annualContractRenewalNotice: (name: string, renewalDate: string, newPrice: number) =>
    `Bonjour ${name}, votre Plan Tranquillité se renouvelle le ${renewalDate}. ` +
    `Nouveau tarif: ${newPrice}$/an (+8% selon contrat). ` +
    `Pour changer de plan ou annuler, avisez-nous avant le ${renewalDate}. - Haie Lite`,

  annualContractRenewalReminder: (name: string, daysLeft: number, newPrice: number) =>
    `${name}, votre abonnement Haie Lite se renouvelle dans ${daysLeft} jours à ${newPrice}$/an. ` +
    `Aucune action requise. Pour annuler: répondez ANNULER ou appelez-nous. - Haie Lite`,

  annualContractRenewalConfirm: (name: string, newPrice: number, nextVisitMonth: string) =>
    `Votre Plan Tranquillité ${new Date().getFullYear()} est actif, ${name}! ` +
    `Tarif: ${newPrice}$/an. Prochain passage schedulé en ${nextVisitMonth}. ` +
    `Merci de votre fidélité! - Haie Lite`,

  // ============================================================
  // ROLLOVER GOUTTIÈRES → CONTRAT ANNUEL
  // ============================================================

  rolloverGuttersToAnnual: (name: string, link: string) =>
    `Bonjour ${name}! On vient de nettoyer vos gouttières. ` +
    `Saviez-vous que pour 1400$/an vous avez gouttières+vitres+haies — DEUX fois chacun? ` +
    `Ça revient moins cher que de tout booker séparément. Intéressé? ${link} ` +
    `- Haie Lite STOP pour arrêter`,

  // ============================================================
  // UPSELL PLAN PROPRIÉTÉ IMMACULÉE
  // ============================================================

  proprieteImmaculeePitch: (name: string, link: string) =>
    `${name}, en tant que client fidèle, on vous offre en priorité notre Plan Propriété Immaculée ` +
    `(2400$/an) — 3 passages vitres intérieur/extérieur, inspection toit, haies 3x, rapport photo détaillé. ` +
    `Disponible pour votre secteur cette saison seulement. ${link} ` +
    `- Haie Lite STOP pour arrêter`,

  // ============================================================
  // REFERRAL SYSTÈME
  // ============================================================

  referralPostVisit: (name: string, code: string, link: string) =>
    `Bonjour ${name}, merci pour la visite d'hier! Votre code referral: ${code}. ` +
    `Partagez-le à un voisin — votre prochaine visite est offerte si ils bookent. ` +
    `${link}?ref=${code} - Haie Lite`,

  referralMonthlyReminder: (name: string, code: string, link: string) =>
    `${name}, votre code Haie Lite est toujours actif: ${code}. ` +
    `Si vous le partagez ce mois-ci et quelqu'un bookte, votre prochaine visite est offerte. ` +
    `${link}?ref=${code} - Haie Lite STOP pour arrêter`,

  referralConverted: (referrerName: string, newClientFirstName: string) =>
    `Bonne nouvelle ${referrerName}! Votre ami ${newClientFirstName} vient de réserver. ` +
    `Votre prochaine visite est offerte. Merci pour la référence! - Haie Lite`,

  // ============================================================
  // PARTENARIAT AGENTS IMMOBILIERS
  // ============================================================

  agentReferralCommission: (agentName: string, clientName: string, commission: number) =>
    `Bonjour ${agentName}, ${clientName} (votre référence) vient de signer son contrat. ` +
    `Votre commission de ${commission}$ sera virée dans les 7 prochains jours. Merci! ` +
    `- Haie Lite`,
} as const;
