# SOP-001 : Prise d'appel entrant — Soumission téléphonique

**Version :** 1.0
**Date création :** 2026-03-23
**Auteur :** Jean-Samuel Leboeuf
**Approuvé par :** Henri

---

## 1. OBJECTIF

Transformer chaque appel entrant en soumission confirmée ou en rendez-vous terrain qualifié, tout en créant une première impression professionnelle.

**Résultat attendu :** Client informé du prix estimé, lead créé dans ServiceM8, prochaine étape claire (job confirmé ou visite planifiée).

---

## 2. PORTEE

**S'applique a :** Tous les appels entrants — Henri, Jean-Samuel, ou tout répondant désigné.

**Ne s'applique PAS a :**
- Appels sortants de relance (voir SOP-005)
- Demandes commerciales/institutionnelles (>400 $ estimé — Jean-Samuel gère directement)

---

## 3. RESPONSABILITES

| Role | Responsabilite |
|------|----------------|
| Henri | Répondant principal en haute saison |
| Jean-Samuel | Répondant secondaire, gère les devis complexes |
| Crew leader (terrain) | Ne répond PAS aux appels clients — redirige vers Henri/JS |

---

## 4. PREPARATION

Avoir sous la main avant de répondre :
- [ ] Grille de prix (version imprimée ou app ouverte)
- [ ] Accès ServiceM8 (créer le lead immédiatement)
- [ ] Calendrier disponibilités (savoir les 3 prochaines dates libres)

---

## 5. PROCEDURE — SCRIPT D'APPEL

### Etape 1 — Décrocher (max 3 sonneries)

> *« Bonjour, Taillage Haie Lite, [Prénom]. Comment puis-je vous aider ? »*

**Si appel manqué :** Rappeler dans les 2 heures. Laisser un message vocal si pas de réponse.

---

### Etape 2 — Qualifier le besoin (2-3 minutes)

Poser ces questions dans l'ordre :

| # | Question | Pourquoi |
|---|----------|----------|
| 1 | *« C'est pour quel type de haie — des cèdres, des arbustes ? »* | Détermine le tarif de base |
| 2 | *« Environ quelle hauteur ? »* | Catégorie de prix |
| 3 | *« Et la longueur approximative ? Vous pouvez estimer en pas ou en pieds. »* | Calcul pi li |
| 4 | *« C'est a quelle adresse ? »* | Vérifier le territoire (Rive-Sud) |
| 5 | *« La haie a-t-elle été taillée l'an passé ? »* | Supplément haie négligée +20 % si >2 ans |

**Si hors territoire (>20 km dépôt) :** minimum 150 $, mentionner franchise déplacement.

---

### Etape 3 — Calculer et annoncer le prix

Calcul rapide en live :

```
Longueur (pi li) × Tarif selon hauteur
+ Supplément haie négligée si >2 ans sans taille (+20 %)
+ Supplément accès difficile si mentionné (+15 %)
= Sous-total (min. 125 $)
```

**Script annonce prix :**

> *« Selon ce que vous me décrivez, on parle d'environ [X] $, taxes en sus. Ce prix inclut le taillage et le ramassage complet des débris — vous n'avez rien à faire après nous. »*

**Si client hésite sur le prix :**

> *« Je comprends. C'est pour ça qu'on offre aussi un contrat annuel — avec deux tailles par saison, vous économisez [Y] $ et vous bloquez votre prix pour toute l'année. »*

---

### Etape 4 — Confirmer ou planifier

**Si prix accepté au téléphone :**

> *« Parfait. Je vous propose [Date 1] ou [Date 2]. Lequel vous convient ? »*

- Confirmer l'adresse complète
- Demander le meilleur numéro pour confirmer la veille
- Confirmer par SMS dans l'heure (template SMS-01 dans ServiceM8)

**Si client veut une visite terrain avant :**

> *« Bien sûr. Je passe mesurer gratuitement, aucun engagement. Je vous propose [Date]. »*

- Planifier la visite (SOP-002)
- Aviser que la soumission sera remise sur place

---

### Etape 5 — Créer le lead dans ServiceM8

**Immédiatement après l'appel (max 5 minutes) :**

- [ ] Créer nouveau client (Nom, adresse, téléphone, courriel si disponible)
- [ ] Créer job « Soumission » ou « Job confirmé » selon l'état
- [ ] Noter dans les commentaires : type de haie, hauteur estimée, longueur estimée, suppléments applicables
- [ ] Ajouter la date de service au calendrier
- [ ] Taguer : *Résidentiel / TET / Taille simple / Contrat annuel* selon applicable

---

## 6. CAS PARTICULIERS

### Client demande une facture pro forma / soumission écrite

Envoyer via ServiceM8 → *Quote* → PDF par courriel. Valide 30 jours.

### Client se plaint d'un prix antérieur plus bas

> *« Nos prix incluent le ramassage complet des débris et une garantie de satisfaction. Si vous n'êtes pas satisfait après le travail, on revient sans frais. »*

Ne jamais descendre sous le minimum de 125 $.

### Client commercial ou institutionnel (école, immeuble, commerce)

> *« Pour ce type de propriété, c'est mon collègue Jean-Samuel qui gère les soumissions commerciales. Je lui transmets vos coordonnées et il vous rappelle aujourd'hui. »*

Envoyer un texto à JS avec : nom, numéro, description du besoin.

### Client agressif ou irrespectueux

Mettre fin poliment à l'appel. Aviser Henri. Ne pas créer de lead.

---

## 7. SUIVI POST-CONFIRMATION

**La veille du job :**

> *« Bonjour [Prénom], c'est [Nom] de Haie Lite. On vous confirme notre passage demain entre [heure] et [heure]. Avez-vous des questions ? »*

**Si pas de réponse à la confirmation :** Envoyer SMS (template ServiceM8) + noter dans le job.

---

## 8. METRIQUES DE SUCCES

| Métrique | Cible |
|----------|-------|
| Taux de conversion appel → job confirmé | > 60 % |
| Délai rappel appel manqué | < 2 heures |
| Lead créé dans ServiceM8 | 100 % des appels qualifiés |
| Prix annoncé avant fin d'appel | 90 % des cas résidentiels |

---

## 9. REFERENCES

- [Grille de prix](./grille-prix.md)
- [SOP-002 : Évaluation terrain](./SOP-002-evaluation-terrain.md)
- [Contrat client](./contrat-client.md)

---

*Version 1.0 — 2026-03-23*
