# The Goal - Eliyahu Goldratt
## Théorie des Contraintes pour Opérations

---

## L'Objectif

> **Le but d'une entreprise est de faire de l'argent.**
> Tout le reste est un moyen pour y arriver.

### Les 3 Mesures Opérationnelles

| Mesure | Définition | Objectif |
|--------|------------|----------|
| **Throughput** | Argent généré par les ventes | Augmenter |
| **Inventory** | Argent investi dans le système | Réduire |
| **Operating Expense** | Argent pour transformer inventory en throughput | Réduire |

---

## Théorie des Contraintes (TOC)

### Le Goulot d'Étranglement
La ressource la plus lente dicte le débit de tout le système.

```
Équipe A    Équipe B    Équipe C
  10/h   →    5/h    →    8/h
            GOULOT

Output total = 5/h (pas 10, pas 8)
```

### Règle d'Or
> Une heure perdue au goulot = une heure perdue pour tout le système.
> Une heure gagnée ailleurs = illusion.

---

## Les 5 Étapes de Focalisation

### 1. IDENTIFIER le goulot
Où est l'engorgement?

### 2. EXPLOITER le goulot
Maximiser son utilisation (jamais en pause)

### 3. SUBORDONNER tout au goulot
Les autres ressources servent le goulot

### 4. ÉLEVER le goulot
Investir pour augmenter sa capacité

### 5. RECOMMENCER
Nouveau goulot → retour étape 1

---

## Application Taillage de Haies

### Identifier le Goulot

| Ressource | Capacité | Goulot? |
|-----------|----------|---------|
| Ventes/Appels | 20 devis/jour | Non |
| Équipement | 8 propriétés/jour | Possible |
| Main d'oeuvre | 6 propriétés/jour | **OUI** |
| Facturation | 50/jour | Non |

### Exploiter le Goulot (Main d'oeuvre)
- Pas de temps perdu en transport
- Routes optimisées
- Équipement prêt le matin
- Pas de retours pour outils oubliés

### Subordonner
- Ne pas vendre plus que la capacité
- Garder un buffer de travail
- Employés non-goulot supportent le goulot

### Élever
- Former un nouvel employé
- Sous-traiter overflow
- Équipement plus efficace

---

## Drum-Buffer-Rope (DBR)

### Les 3 Éléments

| Élément | Rôle | Application |
|---------|------|-------------|
| **Drum** | Le goulot dicte le rythme | Planning basé sur capacité réelle |
| **Buffer** | Stock de travail devant goulot | Toujours avoir 2-3 jours de jobs prêts |
| **Rope** | Contrôle le flux entrant | Ne pas accepter plus que le drum |

---

## Statistical Fluctuations + Dependent Events

### Le Problème
Même si la moyenne est bonne, les variations s'accumulent.

```
Moyenne: 10 haies/jour
Réalité: 8, 12, 7, 14, 9, 11...

Si chaque étape dépend de la précédente,
les retards s'accumulent,
les avances ne se transfèrent pas.
```

### Solution
- Réduire la variabilité
- Ajouter des buffers stratégiques
- Standardiser les processus

---

## Batch Size (Taille des Lots)

### Intuition Fausse
"Plus gros lots = plus efficace"

### Réalité
Petits lots = flux plus rapide, problèmes visibles

| Gros Lots | Petits Lots |
|-----------|-------------|
| Beaucoup d'attente | Flux continu |
| Problèmes cachés | Problèmes visibles |
| Cash bloqué | Cash libéré |
| Inflexible | Adaptable |

### Application
Faire 3 propriétés par jour (finies) > commencer 6 et en finir 2

---

## Mesurer le Bon Indicateur

### Mauvais Indicateurs
- Heures travaillées (encourage le temps, pas le résultat)
- Utilisation équipement (encourage le gaspillage)
- Coût par unité (ignore le throughput)

### Bons Indicateurs
- Throughput (valeur livrée)
- Cycle time (temps début à fin)
- On-time delivery (fiabilité)
- Cash-to-cash (vitesse de l'argent)

---

## Thinking Process (Outils TOC)

### Current Reality Tree
"Pourquoi les choses sont comme elles sont?"
- Liste des problèmes → liens cause-effet → racine commune

### Evaporating Cloud
"Comment résoudre un dilemme?"
- Compromis apparent → hypothèses → solution breakthrough

### Future Reality Tree
"La solution fonctionnera-t-elle?"
- Si on fait X → alors Y → ça résout le problème?

---

## Checklist Opérations Taillage

### Hebdomadaire
- [ ] Identifier où le travail s'accumule
- [ ] Vérifier utilisation du goulot
- [ ] Optimiser planning semaine suivante

### Mensuel
- [ ] Analyser cycle time moyen
- [ ] Identifier causes de retard
- [ ] Évaluer capacité vs demande

### Trimestriel
- [ ] Le goulot a-t-il changé?
- [ ] Faut-il investir pour élever?
- [ ] Nouvelles contraintes émergentes?

---

## Citations Clés

> "Tell me how you measure me, and I will tell you how I will behave."

> "An hour lost at a bottleneck is an hour lost for the entire system."

> "Reducing batch sizes accelerates the flow of information and materials."

---

**Source:** [the-goal-goldratt.md](../sources-livres/the-goal-goldratt.md)
