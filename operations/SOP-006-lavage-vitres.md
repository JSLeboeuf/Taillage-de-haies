# SOP-006 — Visite Lavage de Vitres

**Version :** 1.0 — 2026-03-23
**Applicable à :** Tous les laveurs de vitres, chefs d'équipe
**Référence :** Livrable 10 — Playbook Hormozi

---

## CHECKLIST PRÉ-VISITE (La veille)

- [ ] Confirmer RDV par SMS au client (template : `jobConfirmationJ1`)
- [ ] Vérifier adresse, notes du dossier client, historique ServiceM8
- [ ] Identifier upsells pertinents : gouttières ? haies ? (préparer le pitch)
- [ ] Équipement chargé et vérifié : raclette, savon, perche, seau, chiffons, escabeau
- [ ] Photos de la visite précédente consultées

---

## ARRIVÉE (0–5 min)

- [ ] **Photo extérieur (avant)** — angle large, inclure haies et gouttières visibles
- [ ] Se présenter au client si présent : *"Bonjour [Prénom], c'est [Nom] de Haie Lite pour le lavage de vitres."*
- [ ] Tour rapide d'inspection visuelle (noter mentalement ou dans ServiceM8) :
  - État gouttières — débordent ? rouille visible ? mousses ?
  - État haies — taillage nécessaire ?
  - Toit — mousse, tuiles décollées ?
  - Massifs floraux — débroussaillage nécessaire ?

---

## EXÉCUTION

- [ ] **Chaque fenêtre = cochée dans ServiceM8**
- [ ] Ordre recommandé : façade avant → côtés → arrière → deuxième étage
- [ ] Repasser si traces visibles (standard : zéro trace)
- [ ] Si accès difficile (fenêtre haute) : utiliser la perche, ne jamais forcer
- [ ] **Si anomalie détectée** (gouge, tache incrustée, mousse sur toit) :
  - Prendre une photo
  - Ajouter note "upsell" dans ServiceM8 sous le job
  - Ne pas promettre quoi que ce soit au client sans prix

---

## FIN DE VISITE (5–10 min)

- [ ] **Photo extérieur (après)** — même angle qu'avant
- [ ] **Présenter 1–2 upsells observés** pendant la visite :
  - Gouttières bouchées → Script Rollover (voir playbook-12-livrables-hormozi.md #3)
  - Haies non taillées → *"On peut faire ça la prochaine fois si vous le souhaitez."*
  - Plan annuel → si client one-time, pitch Plan Tranquillité
- [ ] **Demander referral** (obligatoire à chaque visite) :
  > *"Vous êtes satisfait? Si vous connaissez un voisin ou un ami qui aurait besoin de nos services, votre prochaine visite est offerte."*
- [ ] **Envoyer rapport photo** au client dans les 2 heures (voir template SMS ci-dessous)
- [ ] Marquer job "Completed" dans ServiceM8

---

## RAPPORT PHOTO SMS — Template

> *"Bonjour [Prénom], votre lavage de vitres est terminé! Photos avant/après : [lien ServiceM8]. Prochaine visite schedulée : [date]. Des questions? Répondez à ce message. — Haie Lite"*

Ce message est envoyé automatiquement par le webhook ServiceM8 dès que le job est marqué "Completed".

---

## STANDARDS DE QUALITÉ

| Critère | Standard |
|---|---|
| Traces visibles après lavage | Zéro tolérance — refaire |
| Photo avant/après | Obligatoire pour chaque visite |
| Délai rapport photo | < 2 heures après fin de visite |
| Upsell présenté | Minimum 1 par visite |
| Referral demandé | Obligatoire à chaque visite |
| Arrivée dans la fenêtre prévue | ±30 minutes |

---

## SITUATIONS SPÉCIALES

**Client absent (accès convenu) :**
- Exécuter le travail normalement
- Envoyer SMS *"Votre lavage est terminé! Photos : [lien]. Si vous avez des questions, répondez à ce message."*
- Ne pas laisser de facture papier — ServiceM8 envoie par email

**Fenêtres inaccessibles (trop hautes, angles impossibles) :**
- Documenter dans ServiceM8 (photos)
- Aviser le client dans le rapport photo
- Proposer équipement spécialisé au besoin (+$)

**Client insatisfait sur place :**
- Refaire immédiatement la fenêtre en question
- Si problème structurel (tache incrustée) : expliquer et ne pas facturer cette fenêtre
- Escalader à Henri si conflit — ne jamais argumenter

---

*Ce SOP est à revoir après chaque saison. Dernière révision : 2026-03-23*
