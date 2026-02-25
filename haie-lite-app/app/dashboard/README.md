# Dashboard COO — Haie Lite

Dashboard de pilotage opérationnel pour Henri (propriétaire de Haie Lite).

## Objectif

Visibilité temps réel sur le business pour atteindre **2M$ de revenus** en 2026.

## Accès

Le dashboard est protégé par une clé d'accès.

### URL
```
https://votre-domaine.com/dashboard?key=VOTRE_CLE_SECRETE
```

### Configuration

Ajouter dans `.env` ou `.env.local`:

```bash
DASHBOARD_KEY=votre_cle_secrete_ici
```

**Important:** Générer une clé sécurisée (32+ caractères aléatoires).

## Fonctionnalités

### 📊 Métriques clés (KPICards)
- Revenue MTD vs objectif mensuel (166,667$ pour 2M$/an)
- Jobs complétés (aujourd'hui / cette semaine / MTD)
- Leads dans le pipeline
- Taux de conversion
- Ticket moyen
- Revenue aujourd'hui

**Auto-refresh:** 60 secondes

### 🔄 Pipeline commercial (PipelineView)
- Funnel visuel: Nouveau → Contacté → Qualifié → Soumissionné → Gagné / Perdu
- Nombre de leads + valeur totale par étape
- Taux de conversion global
- Win rate (taux de fermeture)

**Auto-refresh:** 2 minutes

### 📈 Graphique revenus (RevenueChart)
- Bar chart des 12 derniers mois
- Ligne d'objectif à 166,667$/mois
- Indicateur visuel: vert si au-dessus de l'objectif, bleu sinon

### 👥 Classement employés (EmployeeLeaderboard)
- Top 5 employés par revenue généré cette semaine
- Heures travaillées
- Revenue par heure
- Bonus accumulés
- Badges: 🥇 Gold, 🥈 Silver, 🥉 Bronze

**Auto-refresh:** 5 minutes

### ⚠️ Alertes (AlertsPanel)
- Alertes météo du jour
- Leads sans follow-up depuis >48h
- Reviews négatives récentes
- Alertes système

**Auto-refresh:** 10 minutes

## Architecture

### API Routes
- `GET /api/dashboard/kpis` — KPIs temps réel
- `GET /api/commercial/pipeline` — Pipeline analytics
- `GET /api/payroll/export` — Stats employés

### Composants
Tous les composants sont dans `app/dashboard/components/`:
- `KPICards.tsx` — Client component avec fetch auto
- `PipelineView.tsx` — Client component avec fetch auto
- `RevenueChart.tsx` — Client component avec chart CSS pur
- `EmployeeLeaderboard.tsx` — Client component avec fetch auto
- `AlertsPanel.tsx` — Client component avec fetch auto

### Layout
- **Desktop:** Sidebar navigation fixe à gauche
- **Mobile:** Header top + bottom navigation
- **Responsive:** Mobile-first, breakpoints lg

## Design System

### Couleurs (Dark Theme)
- Background: `#0f1117`
- Cards: `#1a1d27`
- Borders: `#2a2d37`
- Hover: `#21242e`

### Accents
- Vert: `#22c55e` (positif)
- Rouge: `#ef4444` (négatif)
- Bleu: `#3b82f6` (neutre)

### Typographie
- Font: Geist Sans + Geist Mono
- Nombres: toujours en `font-mono`

### Touch Targets
- Minimum 44x44px pour mobile
- Focus rings visibles (accessibility)

## Graceful Degradation

Si Supabase n'est pas connecté:
- Les composants affichent des états "empty" avec messages clairs
- Pas de crash, juste des placeholders
- Messages: "En attente de connexion Supabase"

## Déploiement

1. Configurer `DASHBOARD_KEY` dans les variables d'environnement Vercel/Fly.io
2. Déployer normalement
3. Partager l'URL avec `?key=...` à Henri et Jean-Samuel

## Sécurité

- ✅ Protection par clé (query param)
- ✅ Pas d'auth persistante (stateless)
- ✅ Supabase service role côté serveur uniquement
- ⚠️ Pour production: implémenter JWT ou session-based auth

## Performance

- Server Components pour le layout
- Client Components pour les données temps réel
- Auto-refresh intelligent (pas de polling excessif)
- Loading states avec skeletons
- Error boundaries gracieux

## Prochaines étapes

1. Connecter Supabase production
2. Implémenter webhook weather API pour alertes météo
3. Ajouter Google Reviews API pour alertes reviews
4. Exporter PDF des rapports hebdomadaires
5. Notifications push (optional)

---

**Version:** 1.0.0
**Créé:** 2026-02-20
**Objectif:** 2M$ de revenus annuels
