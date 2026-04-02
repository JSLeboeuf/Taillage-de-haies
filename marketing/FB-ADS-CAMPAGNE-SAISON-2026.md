# Campagne FB Lead Ads — Saison 2026

## Campagne 1: "Soumission Gratuite Taillage"

### Parametres

| Parametre | Valeur |
|-----------|--------|
| Objectif | Lead Generation |
| Budget | 33$/jour (1,000$/mois) |
| Placement | FB Feed + Instagram Feed + Stories |
| Audience | 35-65 ans, rayon 25km Rive-Sud |
| Interets | RONA, Home Depot, Reno-Depot, HGTV, jardinage, amenagement paysager |
| Exclusions | Locataires (exclure interets "location appartement") |
| Duree | Avril → ajuster en mai |

### Creative A — Avant/Apres (image)

**Image**: Split screen avant/apres d'une haie de cedres
- Gauche: haie degueu, branches qui depassent
- Droite: haie taillee propre, ligne parfaite

**Headline**: Votre haie a besoin d'amour?
**Primary text**: Soumission gratuite en 2 minutes par texto. Prix a partir de 2$/pied lineaire. Reponse garantie en 30 minutes. Equipement 100% electrique. Plus de 1,300 clients satisfaits.
**CTA**: Obtenir une soumission
**Description**: Taillage de haies de cedres — Rive-Sud et Montreal

### Creative B — Video (15s)

**Script video**:
- 0-3s: Haie degueulasse (close-up branches mortes)
- 3-7s: Technicien avec taille-haie electrique en action
- 7-12s: Haie magnifique terminee (drone shot ou wide angle)
- 12-15s: "Soumission gratuite par texto" + logo

**Text overlay**: "De CA... a CA. En 1 visite."
**CTA**: Soumission gratuite

### Creative C — Temoignage client

**Image**: Photo client satisfait devant sa haie (avec permission)
**Headline**: "La meilleure decision que j'ai prise!" — Marie, Brossard
**Primary text**: 4.9/5 sur Google. Prix transparents. Equipement electrique silencieux. Soumission gratuite en 2 min par texto. On repond en moins de 30 minutes.
**CTA**: Obtenir ma soumission

### Lead Form

**Champs** (garder MINIMUM pour maximiser conversion):
1. Prenom (pre-rempli FB)
2. Telephone (pre-rempli FB)
3. Question custom: "Combien de cotes a votre haie?" (dropdown: 1 cote, 2 cotes, 3 cotes, 4 cotes (tour complet), Je ne sais pas)

**Message de remerciement**: "Merci! Vous recevrez un texto dans les prochaines minutes avec votre soumission. — Haie Lite"

**Webhook**: POST vers https://haie-lite-app.vercel.app/api/webhooks/meta-leads

### Flux post-lead

```
Lead FB → webhook meta-leads → insert dans leads table (Supabase)
→ SMS Sophie en <30s: "Bonjour [prenom]! C'est Sophie de Haie Lite..."
→ Qualification IA (dimensions, secteur, budget)
→ Si qualifie: proposition prix + booking
→ Si pas de reponse 2h: cascade tier 2 (appel VAPI)
```

---

## Campagne 2: "Multi-Services" (lancer en juin)

### Creative D — Forfait complet

**Image**: Collage 3 services (haie taillee + vitres propres + gouttieres)
**Headline**: Haies + Vitres + Gouttieres = 1 seul appel
**Primary text**: Tout l'entretien exterieur de votre maison. Taillage de haies, lavage de vitres, nettoyage de gouttieres. Forfait annuel a partir de 800$/an. Soumission gratuite par texto.
**CTA**: Obtenir une soumission

---

## Campagne 3: "Gouttieres" (lancer en septembre)

### Creative E — Urgence automne

**Image**: Gouttieres pleines de feuilles mortes (photo stock ou reelle)
**Headline**: Vos gouttieres sont pretes pour l'hiver?
**Primary text**: Nettoyage complet a partir de 175$. On est deja dans votre quartier. Soumission en 2 minutes par texto. Avant que la neige arrive.
**CTA**: Reserver maintenant

---

## Metriques a suivre

| Metrique | Target | Alerte si |
|----------|--------|-----------|
| CPL | <30$ | >45$ |
| CTR (click-through) | >1.5% | <0.8% |
| Conversion lead→client | >25% | <15% |
| ROAS | >3x | <1.5x |
| Frequence | <3 | >4 (fatigue pub) |

### Regles d'optimisation

1. **Semaine 1-2**: laisser tourner, ne rien toucher (phase apprentissage)
2. **Apres 50 leads**: analyser CPL par creative, couper le pire, scaler le meilleur
3. **Apres 100 leads**: lancer Lookalike 1% sur les clients convertis
4. **Mensuel**: refresh creative (nouvelles photos avant/apres)

---

## Budget annuel

| Mois | Budget | Campagne |
|------|--------|----------|
| Avril | 1,000$ | Taillage haies |
| Mai | 1,500$ | Taillage haies |
| Juin | 2,500$ | Haies + Multi-services |
| Juillet | 3,000$ | Haies + Multi-services |
| Aout | 2,500$ | Haies + Multi-services |
| Septembre | 2,000$ | Gouttieres + Haies |
| Octobre | 1,500$ | Gouttieres |
| Nov-Mars | 500$/mois | Deneigement (si lance) |
| **TOTAL** | **~17,000$** | |
