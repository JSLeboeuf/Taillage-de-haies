# SEO Taillagehaielite.com — Statut & Actions Restantes

**Date** : 31 mars 2026
**Score SEO estimé** : ~15/100 → ~55/100 (après injections XMLRPC)

---

## CE QUI EST FAIT (automatisé via XMLRPC)

### Meta SEO (Yoast) — 9 pages existantes
- [x] Title tags optimisés (mot-clé + ville + marque)
- [x] Meta descriptions (150-160 car, avec CTA)
- [x] Focus keywords configurés
- [x] Cornerstone content activé sur 7 pages
- [x] OG images + Twitter Cards

### Images — 30 images
- [x] Alt text descriptif avec mots-clés sur toutes les images de la médiathèque

### Contenu — 25 nouvelles pages/articles publiés
- [x] 12 articles de blog (long-tail keywords, 800-1200 mots chaque)
- [x] 8 pages de zones géographiques (Montreal, Laval, Terrebonne, Blainville, Repentigny, Longueuil, St-Jerome, Lanaudière)
- [x] 3 pages de nouveaux services (Lavage de vitres, Déneigement, Contrat annuel)
- [x] 2 pages index (Blog, Zones)
- [x] 4 catégories + 14 tags blog créés

### Fichiers dans le repo
- [x] `operations/seo-audit-et-optimisation-2026.md` — Audit initial + plan
- [x] `operations/seo-contenu-pages-optimise.md` — Contenu optimisé 8 pages
- [x] `operations/seo-articles-blog.md` — 12 articles blog complets
- [x] `operations/seo-pages-zones-service.md` — 8 pages zones
- [x] `operations/seo-pages-nouveaux-services.md` — 3 pages services
- [x] `operations/seo-schemas-json-ld.md` — 7 schemas JSON-LD prêts
- [x] `operations/seo-guide-avance-complet.md` — Guide avancé (directories, backlinks, GBP, calendar)
- [x] `operations/seo-wordpress-injections-log.md` — Log complet des injections
- [x] `operations/tracking-setup-complet.md` — Guide setup tracking
- [x] `operations/prompt-admin-wordpress-seo.md` — Prompt pour exécuter les tâches admin
- [x] `outils/haielite-tracking.php` — MU-plugin tracking prêt
- [x] `outils/gbp-cli.py` — Script CLI Google Business Profile

---

## CE QUI RESTE À FAIRE (requiert accès admin WordPress ou navigateur)

### PRIORITÉ 1 — Critique pour SEO (impact immédiat)

#### 1. Schemas JSON-LD (10 min)
**Requiert** : Admin WordPress (installer WPCode plugin)
**Impact** : Rich snippets dans Google, meilleur CTR

1. Installer le plugin **WPCode** (gratuit) via Extensions > Ajouter
2. Ajouter un snippet "Header" avec le code LocalBusiness schema :
   - Copier depuis `operations/seo-schemas-json-ld.md` section "LocalBusiness"
   - Position: Header, Site Wide
3. Ajouter le schema FAQPage sur la page FAQ (ID:732)
4. Vérifier : `https://search.google.com/test/rich-results?url=https://taillagehaielite.com`

#### 2. Google Business Profile (15 min)
**Requiert** : Navigateur + compte Google
**Impact** : Apparition dans Google Maps, Local Pack (top 3 résultats locaux)

1. Aller sur https://business.google.com
2. Suivre les instructions dans `operations/seo-guide-avance-complet.md` section GBP
3. Infos clés :
   - Nom : **Taillage Haielite**
   - Catégorie : **Paysagiste**
   - Tél : **(514) 813-8956**
   - Web : **https://taillagehaielite.com**
   - Zones : Montréal, Laval, Terrebonne, Blainville, Repentigny, Longueuil, Saint-Jérôme
   - Heures : Lundi-Samedi 7h-19h

#### 3. Google Search Console (5 min)
**Requiert** : Navigateur + compte Google
**Impact** : Google indexe les 31 pages du sitemap

1. Aller sur https://search.google.com/search-console
2. Ajouter `https://taillagehaielite.com`
3. Vérifier via balise HTML dans Yoast
4. Soumettre le sitemap : `https://taillagehaielite.com/sitemap_index.xml`

#### 4. Navigation menu (5 min)
**Requiert** : Admin WordPress (Apparence > Menus)
**Impact** : Maillage interne, crawlabilité, UX

1. Ajouter sous "Services" : Lavage de vitres, Déneigement, Contrat annuel
2. Nouveau item : "Zones" (avec sous-menu des 8 villes)
3. Nouveau item : "Blog"

### PRIORITÉ 2 — Important (impact dans 2-4 semaines)

#### 5. Yoast Organisation (5 min)
**Requiert** : Admin WordPress (Yoast SEO > Réglages)

1. Type d'organisation : Entreprise locale
2. Nom : Taillage Haielite
3. Logo : sélectionner le logo existant
4. Téléphone : (514) 813-8956
5. Facebook : `https://www.facebook.com/haielitetaillage/`
6. Instagram : `https://www.instagram.com/taillage_haielite/`

#### 6. Noindex archives inutiles (3 min)
**Requiert** : Admin WordPress (Yoast SEO > Réglages)

1. Archives auteur : Désactiver
2. Archives date : Désactiver
3. Format : noindex

#### 7. Tagline du site (1 min)
**Requiert** : Admin WordPress (Réglages > Général)

Changer le slogan pour : `Taillage de haies de cèdres, élagage et fertilisation à Montréal et Rive-Nord`

#### 8. Copyright footer (2 min)
**Requiert** : Admin WordPress (Elementor > Footer template ID:63)

Changer "© 2024" par "© 2026"

### PRIORITÉ 3 — Tracking visiteurs

#### 9. Google Analytics 4 (10 min)
**Requiert** : Navigateur + compte Google + Admin WordPress

**Option A** (recommandée) : Installer plugin "Site Kit by Google"
**Option B** : Uploader `outils/haielite-tracking.php` dans `/wp-content/mu-plugins/`

Étapes détaillées dans `operations/tracking-setup-complet.md`

#### 10. Microsoft Clarity (5 min)
**Requiert** : Navigateur + compte Microsoft/Google + Admin WordPress

1. Créer compte sur https://clarity.microsoft.com
2. Installer plugin "Microsoft Clarity" ou utiliser le mu-plugin

#### 11. Meta Pixel (5 min)
**Requiert** : Navigateur + compte Facebook Business

Étapes dans `operations/tracking-setup-complet.md`

### PRIORITÉ 4 — Optimisation continue

#### 12. Citations / Répertoires locaux (30 min)
**Requiert** : Navigateur
**Impact** : Backlinks + NAP consistency

Inscrire l'entreprise sur les 17 répertoires listés dans `operations/seo-guide-avance-complet.md` :
- PagesJaunes.ca, Yelp.ca, 411.ca, Canpages.ca
- HouzzPro, HomeStars, TrustedPros
- Chambre de commerce locale

#### 13. Stratégie avis Google (continu)
**Impact** : #1 facteur ranking Local Pack

Template SMS pour demander un avis (dans le guide avancé) :
```
Bonjour [Prénom]! Merci d'avoir choisi Taillage Haielite.
Si vous êtes satisfait, un avis Google nous aiderait énormément :
[lien avis Google]
Merci! — Henri
```

---

## BLOCAGE ACTUEL

**GoDaddy WAF** a activé une protection anti-bot sur notre IP après les requêtes XMLRPC automatisées. Ni XMLRPC ni le login admin web ne sont accessibles depuis cette machine.

**Solutions** :
1. **Attendre** 24-48h — la protection se lève automatiquement
2. **Utiliser un autre réseau/IP** (téléphone mobile, VPN, autre WiFi)
3. **Utiliser Comet/Cursor** avec navigateur intégré (contourne le challenge JS)
4. **Contacter Shooga** (mariane@shooga.ca) pour les tâches admin — template email dans `operations/tracking-setup-complet.md`
5. **Contacter GoDaddy support** pour whitelister l'IP ou désactiver la protection temporairement

---

## RÉSUMÉ CHIFFRÉ

| Métrique | Avant | Après |
|----------|-------|-------|
| Pages indexables | 9 | 34 |
| Meta descriptions | 0 | 9 (pages existantes) |
| Alt text images | 0 | 30 |
| Articles blog | 0 | 12 |
| Pages zones locales | 0 | 8 |
| Pages services | 3 | 6 |
| Schemas JSON-LD | 0 | 0 (prêts, pas installés) |
| Google Business Profile | Non | Non (guide prêt) |
| Google Analytics | Non | Non (mu-plugin prêt) |
| Sitemap URLs | ~9 | ~34 |
| Score SEO estimé | ~15/100 | ~55/100 |
| Score potentiel (tout fait) | — | ~85/100 |

---

## ACCÈS WORDPRESS

- **URL admin** : `https://taillagehaielite.com/shooga/` (AIOS renomme wp-login.php)
- **CAPTCHA** : Math en français (ex: "quatre × 2 = ") — répondre en chiffres
- **Identifiant** : joannettehenri06@gmail.com
- **Mot de passe** : ChangezMoiMaintenant
- **Rôle** : Éditeur (PAS admin — ne peut pas changer Settings, Yoast, Plugins, Menus)

**Pour avoir accès admin**, demander à Shooga de changer le rôle en Administrateur, ou utiliser le compte admin Shooga directement.
