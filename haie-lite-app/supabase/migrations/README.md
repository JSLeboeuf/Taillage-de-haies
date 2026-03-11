# Supabase Migrations

## Initial Schema (001_initial_schema.sql)

Migration complète du schéma initial pour l'application Haie Lite.

### Tables créées (19 tables)

#### Core Business
1. **leads** - Pipeline de leads (prospects à conversion)
2. **referrals** - Programme de référencement client
3. **messages_sent** - Historique SMS/email
4. **daily_kpis** - Métriques quotidiennes

#### Employee Management
5. **employees** - Répertoire employés
6. **timesheets** - Heures travaillées (sync ServiceM8)
7. **employee_incentives** - Bonus et commissions
8. **performance_scores** - Scores de performance
9. **daily_payroll** - Rapport masse salariale quotidien

#### Upsell System
10. **upsell_opportunities** - Opportunités identifiées sur le terrain

#### Subscriptions
11. **subscriptions** - Plans récurrents (Club Haie Lite)
12. **commercial_contracts** - Contrats commerciaux B2B

#### System
13. **scheduled_actions** - Actions planifiées (cron)
14. **job_events** - Log webhooks ServiceM8

#### Reports & Analytics
15. **google_reviews** - Avis Google avec matching employe
16. **weather_alerts** - Alertes météo
17. **weekly_employee_reports** - Rapports hebdo employés
18. **monthly_performance_reports** - Rapports mensuels business
19. **reactivation_campaigns** - Campagnes clients dormants

### Fonctionnalités

- **UUID primary keys** sur toutes les tables
- **Timestamps automatiques** (created_at, updated_at)
- **Triggers updated_at** sur 13 tables
- **120+ indexes** pour performance optimale
- **Row Level Security (RLS)** activé avec bypass service_role
- **Foreign keys** avec ON DELETE SET NULL pour les employés
- **CHECK constraints** pour tous les enums
- **Fonction helper** `increment_daily_kpi()` pour métriques

### Application de la migration

#### Option 1: Supabase CLI (recommandé)

```bash
# Se connecter au projet
supabase link --project-ref <project-ref>

# Appliquer la migration
supabase db push

# Ou reset complet (⚠️ détruit toutes les données)
supabase db reset
```

#### Option 2: Supabase Dashboard

1. Aller dans **Database** → **SQL Editor**
2. Copier-coller le contenu de `001_initial_schema.sql`
3. Exécuter

#### Option 3: Programmatique (pour tests)

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sql = fs.readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf-8')
await supabase.rpc('exec_sql', { sql })
```

### Vérification post-migration

```sql
-- Lister toutes les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier les indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Vérifier les triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Vérifier RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Rollback

⚠️ Cette migration ne contient pas de rollback automatique.

Pour annuler:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Prochaines étapes

Après application de cette migration:

1. Vérifier que toutes les tables sont créées
2. Tester les triggers `updated_at`
3. Vérifier les policies RLS
4. Peupler la table `employees` depuis ServiceM8
5. Configurer les webhooks ServiceM8 → `/api/webhooks/servicem8`
6. Configurer les cron jobs Vercel

### Notes techniques

- Utilise `gen_random_uuid()` au lieu de `uuid_generate_v4()` (plus moderne)
- Extension `pg_trgm` activée pour fuzzy matching (reviews → jobs)
- JSONB pour données flexibles (payroll breakdown, scheduled_actions payload)
- Indexes partiels avec `WHERE` pour optimiser queries spécifiques
- Pas de CASCADE sur DELETE employés → SET NULL pour préserver historique
