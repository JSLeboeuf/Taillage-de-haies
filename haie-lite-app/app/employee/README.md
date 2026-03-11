# Interface Employé - Haie Lite

Interface mobile-first pour les employés terrain de Haie Lite.

## Pages créées

### 1. `/employee?id=<employee_uuid>`
Page d'accueil employé avec:
- Résumé des performances (bonus du mois, score, jobs complétés)
- 3 actions rapides: Flagger upsell, Mes jobs, Mon score
- Identification par query param `?id=employee_uuid`

### 2. `/employee/upsell?id=<employee_uuid>`
Formulaire pour flagger un upsell:
- Sélection du type de service (6 options avec commissions)
- Job UUID ou adresse client
- Description libre
- Photo upload (base64, stocké en local)
- Valeur estimée (pour services à commission %)
- Soumission vers POST `/api/upsell/flag`
- Confirmation avec montant de commission

### 3. `/employee/jobs?id=<employee_uuid>`
Liste des jobs du jour:
- Jobs assignés (à venir, en cours, complétés)
- Détails: adresse, heure, type de haie, notes
- Bouton "Flagger upsell" (pré-remplit le job_uuid)
- Mock data pour l'instant (à remplacer par ServiceM8 API)

### 4. `/employee/score?id=<employee_uuid>`
Scorecard de performance:
- Score global sur 100 (barre circulaire CSS)
- Breakdown: $/heure, jobs, bonus, reviews
- Classement vs autres employés
- Historique des bonus (scrollable)
- Mock data pour l'instant

## Composants

### `BottomNav.tsx`
Navigation mobile fixe en bas:
- 4 onglets: Accueil, Upsell, Jobs, Score
- Active state visuel
- Gestion des query params (employee_id)
- Accessible (ARIA labels)

### `layout.tsx`
Layout employé:
- Container mobile-optimized (max 430px)
- Bottom nav intégré
- Spacing pour éviter overlap avec nav
- PWA ready

## Design

### Mobile-first
- Optimisé pour 375px, max 430px
- Boutons tactiles 48x48px minimum (actions principales 56px)
- Pas de scroll horizontal
- Font: Geist (déjà configuré)

### Couleurs
- Background: `haie-cream-50` (#faf8f4)
- Cartes: `white`
- Accent: `haie-green-700` (#1a4d2e)
- Texte: `gray-900` (#1c1917)

### Animations
- CSS transitions douces (150ms)
- Cubic-bezier(0.16, 1, 0.3, 1)
- Respect prefers-reduced-motion
- Scale animations sur actions

### Accessibilité
- Focus-visible rings
- ARIA labels sur navigation
- Touch targets 48x48px+
- Contrast WCAG AA

## PWA

### Manifest (`/public/manifest.json`)
- name: "Haie Lite - Employés"
- standalone display
- theme_color: #1a4d2e
- Icons: 192x512 (placeholders SVG)

### Meta tags
- viewport optimisé mobile
- apple-web-app-capable
- theme-color

## API Integration

### Existant
- POST `/api/upsell/flag` - Créer upsell opportunity

### À créer
- GET `/api/employee/:id` - Données employé
- GET `/api/employee/:id/jobs` - Jobs du jour
- GET `/api/employee/:id/score` - Performance metrics
- GET `/api/employee/:id/bonus-history` - Historique bonus

## Commission Rates

| Service | Commission |
|---------|-----------|
| Fertilisation | 15$ |
| Pest treatment | 20$ |
| Winter protection | 25$ |
| Cedar replacement | 10$/unité |
| Rejuvenation | 3% valeur |
| Mulching | 15$ |

## Usage

### Développement
```bash
npm run dev
```

Accéder à: `http://localhost:3000/employee?id=<uuid>`

### Production
L'app est déjà buildée et prête à déployer sur Vercel.

## Next Steps

1. Créer les API routes pour les données employés
2. Intégrer ServiceM8 API pour les jobs réels
3. Implémenter le système de score/ranking
4. Ajouter notifications push (upsell accepté, nouveau bonus)
5. Ajouter upload photo vers Supabase Storage
6. Créer dashboard admin pour approuver les upsells
7. Tests end-to-end avec Playwright

## Notes

- Tous les composants utilisent "use client" (interactivité)
- Mock data actuellement pour développement
- Tailwind CSS v3 (déjà configuré dans le projet)
- TypeScript strict mode
- Pas de dépendances externes ajoutées
