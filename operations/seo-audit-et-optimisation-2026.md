# Audit SEO complet — taillagehaielite.com (GoDaddy / WordPress)

**Date** : 31 mars 2026
**Stack** : WordPress + Elementor Pro + Yoast SEO + Formidable Forms
**Hebergement** : GoDaddy

---

## SCORE ACTUEL : ~15/100

Le site a des lacunes SEO **critiques** sur presque tous les fronts. Le bon cote : Yoast SEO est deja installe (robots.txt le confirme), donc la majorite des corrections se font directement dans l'admin WordPress sans toucher au code.

---

## STRUCTURE DU SITE (10 pages indexees)

| URL | Titre actuel | H1 | Meta description | Contenu |
|-----|-------------|-----|-----------------|---------|
| `/` | Accueil - Taillage Haielite | AUCUN | AUCUNE | ~300 mots |
| `/services/taillage-de-haies-de-cedres-et-arbustes/` | Taillage de haies... | OK | AUCUNE | ~550 mots |
| `/services/elagage-rabbatage/` | Elagage (Rabbatage)... | AUCUN (H2) | AUCUNE | ~350 mots |
| `/services/fertilisation/` | Fertilisation... | OK | AUCUNE | ~280 mots |
| `/a-propos/` | A propos... | OK | AUCUNE | ~230 mots |
| `/realisations/` | Realisations... | AUCUN (H2) | AUCUNE | ~120 mots |
| `/contact/` | Contact... | OK | AUCUNE | ~80 mots |
| `/faq/` | FAQ... | OK | AUCUNE | ~400 mots |
| `/rejoignez-notre-equipe/` | ? | ? | ? | ? |
| `/test-page/` | PAGE DE TEST ENCORE INDEXEE | - | - | A SUPPRIMER |

---

## PROBLEMES CRITIQUES (Priorite 1 — faire cette semaine)

### 1. ZERO meta descriptions sur toutes les pages

C'est le probleme #1. Google affiche un extrait aleatoire au lieu d'un texte accrocheur.

**Action** : Dans Yoast SEO (bas de chaque page dans l'editeur WordPress), remplir :

| Page | Meta description recommandee (max 155 car.) |
|------|---------------------------------------------|
| Accueil | `Taillage de haies de cedres, elagage et fertilisation a Montreal et Rive-Nord. Soumission gratuite. Appelez (514) 813-8956. Service professionnel rapide.` |
| Taillage de haies | `Service professionnel de taillage de haies de cedres et arbustes a Montreal. Taille precise, techniques avancees, entretien regulier. Soumission gratuite.` |
| Elagage | `Elagage et rabattage de haies de cedres a Montreal et Laval. Techniques specialisees, equipement professionnel. Appelez (514) 813-8956.` |
| Fertilisation | `Fertilisation de haies de cedres pour une croissance saine et vigoureuse. Service professionnel a Montreal. Soumission gratuite — (514) 813-8956.` |
| A propos | `Decouvrez Taillage Haielite : equipe passionnee par l'entretien paysager a Montreal. Expertise en taillage de haies de cedres depuis plusieurs annees.` |
| Realisations | `Voyez nos realisations : photos et videos avant/apres de taillage de haies, elagage et fertilisation a Montreal et Rive-Nord.` |
| Contact | `Contactez Taillage Haielite pour une soumission gratuite. (514) 813-8956 ou formulaire en ligne. Service rapide a Montreal et Rive-Nord.` |
| FAQ | `Questions frequentes sur le taillage de haies de cedres : meilleur moment, frequence, quantite a enlever. Reponses d'experts.` |
| Equipe | `Rejoignez l'equipe Taillage Haielite. Postes disponibles en entretien paysager a Montreal. Environnement dynamique.` |

### 2. ZERO alt text sur TOUTES les images

Chaque image du site n'a aucun texte alternatif. Cela nuit au SEO images et a l'accessibilite.

**Action** : Dans Elementor ou la mediatheque WordPress, ajouter un alt text descriptif :

| Image | Alt text recommande |
|-------|-------------------|
| poignee-de-main-1.webp | Poignee de main client satisfait taillage haie cedre Montreal |
| poignee-de-main-2.jpg | Equipe Taillage Haielite rencontre client |
| henri-echelle-resized-2.jpg | Henri Joannette elagage haie cedre avec echelle |
| image-fertilisation.jpg | Application fertilisant haie cedre professionnel |
| image-taillage.jpg | Taillage haie cedre avant apres Montreal |
| taillage-about-us-img.jpg | Equipe taillage haie cedre arbuste |
| buisson-apres-nouveau.png | Haie cedre apres taillage professionnel |
| buisson-avant.png | Haie cedre avant taillage |
| paysage-1 a paysage-13 | Realisation taillage haie cedre [lieu] avant/apres |

### 3. Pages sans H1 (hierarchie de titres brisee)

- **Accueil** : aucun H1 → Ajouter : `Taillage de haies de cedres a Montreal | Service professionnel`
- **Elagage** : commence a H2 → Changer le premier H2 en H1 : `Elagage et rabattage de haies de cedres`
- **Realisations** : aucun H1 → Ajouter : `Nos realisations en taillage de haies`

### 4. Supprimer /test-page/ du sitemap

Cette page de test est encore indexee. Dans WordPress : soit la supprimer, soit la mettre en brouillon, soit cocher "noindex" dans Yoast.

### 5. Aucune adresse physique / zone de service

Google Local SEO requiert une adresse ou au minimum une zone de service declaree. Le site ne mentionne nulle part Montreal, Laval, Rive-Nord, etc.

**Action** :
- Ajouter dans le footer : "Nous desservons Montreal, Laval, Longueuil, Rive-Nord et Rive-Sud"
- Ajouter l'adresse complete dans le schema LocalBusiness (voir section schema ci-dessous)

---

## PROBLEMES MAJEURS (Priorite 2 — faire ce mois-ci)

### 6. Schema LocalBusiness manquant

Le site a un schema Organization generique. Pour un business local, il faut un schema **LocalBusiness** complet.

**Action** : Installer un plugin comme "Schema Pro" ou ajouter ce JSON-LD via Yoast > Apparence dans les resultats de recherche > Type de contenu :

```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Taillage Haielite",
  "url": "https://taillagehaielite.com",
  "logo": "https://taillagehaielite.com/wp-content/uploads/taillage-haielite-logo.svg",
  "image": "https://taillagehaielite.com/wp-content/uploads/2024/05/poignee-de-main-1.webp",
  "telephone": "+15148138956",
  "email": "joannettehenri06@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Montreal",
    "addressRegion": "QC",
    "addressCountry": "CA"
  },
  "areaServed": [
    {"@type": "City", "name": "Montreal"},
    {"@type": "City", "name": "Laval"},
    {"@type": "City", "name": "Longueuil"},
    {"@type": "City", "name": "Terrebonne"},
    {"@type": "City", "name": "Repentigny"},
    {"@type": "City", "name": "Blainville"}
  ],
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "opens": "07:00",
    "closes": "19:00"
  },
  "sameAs": [
    "https://www.facebook.com/haielitetaillage/",
    "https://www.instagram.com/taillage_haielite/"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services d'entretien paysager",
    "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Taillage de haies de cedres et arbustes"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Elagage et rabattage"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Fertilisation"}}
    ]
  }
}
```

### 7. Schema FAQPage manquant sur /faq/

La page FAQ a du bon contenu mais aucun schema FAQ. Cela empeche les rich snippets FAQ dans Google.

**Action** : Ajouter via Yoast ou un plugin Schema :

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quel est le meilleur temps pour rabattre une haie de cedre?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La periode de repos de la plante (fin automne/debut hiver) est le moment le plus favorable. Elaguer avant la saison de croissance au debut du printemps. Eviter les periodes de chaleur extreme ou secheresse."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de temps attendre avant de tailler une nouvelle plantation de cedres?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Attendre au moins un an apres la plantation. Surveiller la croissance la premiere annee et ne pas enlever plus d'un tiers de la croissance. Tailler en fin d'automne ou debut d'hiver."
      }
    },
    {
      "@type": "Question",
      "name": "Est-il bon de faire tailler la haie chaque annee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui. La taille annuelle stimule la croissance dense et uniforme, favorise la floraison, aide a controler les parasites et maladies, et ajoute de la valeur esthetique a votre propriete."
      }
    },
    {
      "@type": "Question",
      "name": "Quelle quantite enlever pour la taille de haie?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ne pas enlever plus d'un tiers de la croissance totale a la fois. Pour la taille de rajeunissement, proceder progressivement sur plusieurs annees. Pour l'entretien regulier, tailler legerement plutot qu'attendre longtemps."
      }
    }
  ]
}
```

### 8. Titres de pages faibles (title tags)

Les titres actuels sont generiques. Optimiser pour inclure mots-cles + localisation :

| Page | Titre actuel | Titre optimise |
|------|-------------|---------------|
| Accueil | Accueil - Taillage Haielite | Taillage de haies de cedres Montreal - Haie Elite \| Soumission gratuite |
| Taillage | Taillage de haies... - Taillage Haielite | Taillage de haies de cedres et arbustes Montreal \| Haie Elite |
| Elagage | Elagage (Rabbatage) - Taillage Haielite | Elagage et rabattage haie cedre Montreal \| Haie Elite |
| Fertilisation | Fertilisation - Taillage Haielite | Fertilisation haie cedre Montreal - Croissance saine \| Haie Elite |
| A propos | A propos - Taillage Haielite | A propos de Haie Elite - Experts taillage haies Montreal |
| Realisations | Realisations - Taillage Haielite | Realisations taillage haies avant/apres \| Haie Elite Montreal |
| Contact | Contact - Taillage Haielite | Contactez Haie Elite - Soumission gratuite (514) 813-8956 |
| FAQ | FAQ - Taillage Haielite | FAQ taillage haie cedre - Questions frequentes \| Haie Elite |

### 9. Contenu trop mince (thin content)

Google penalise les pages avec peu de contenu. Plusieurs pages sont sous 300 mots.

**Objectif minimum** : 800+ mots par page de service, 500+ pour les autres.

| Page | Mots actuels | Objectif | A ajouter |
|------|-------------|----------|-----------|
| Realisations | ~120 | 500+ | Descriptions des projets, temoignages clients, lieux |
| A propos | ~230 | 600+ | Histoire de l'entreprise, valeurs, equipe, certifications |
| Fertilisation | ~280 | 800+ | Types de fertilisants, calendrier, signes de carence, prix |
| Elagage | ~350 | 800+ | Processus detaille, quand rabattre, risques du DIY, prix |
| Contact | ~80 | 300+ | Heures d'ouverture, zones desservies, delai de reponse, map |
| Taillage | ~550 | 1000+ | Guide complet, frequence, essences, avant/apres, prix |

### 10. Aucun Google Analytics / Tag Manager

Impossible de mesurer le trafic, les conversions, ou l'efficacite du SEO.

**Action** :
1. Creer un compte Google Analytics 4 (GA4)
2. Installer via Yoast ou plugin "Site Kit by Google"
3. Configurer les evenements de conversion : soumission formulaire, clic telephone
4. Connecter Google Search Console

---

## PROBLEMES IMPORTANTS (Priorite 3 — faire dans les 2 prochains mois)

### 11. Google Business Profile

C'est le levier #1 pour le SEO local. Sans fiche Google Business :
- Pas d'apparition dans Google Maps
- Pas de "Local Pack" (les 3 resultats avec carte)
- Pas d'avis Google visibles

**Action** :
1. Creer/revendiquer la fiche sur business.google.com
2. Categorie principale : "Service de taille de haies" ou "Paysagiste"
3. Ajouter photos, services, heures, zone de service
4. Demander des avis Google aux clients existants (objectif : 20+ avis)

### 12. Pages de zones de service (Local SEO)

Creer des pages dediees pour chaque ville/arrondissement desservi :

- `/zones/montreal/`
- `/zones/laval/`
- `/zones/rive-nord/`
- `/zones/terrebonne-mascouche/`
- `/zones/blainville-sainte-therese/`
- `/zones/longueuil-brossard/`

Chaque page : 500+ mots, mention des quartiers specifiques, temoignages locaux, photos locales.

### 13. Blog / contenu recurrent

Un blog est essentiel pour capturer le trafic longue traine. Articles recommandes :

| Article | Mot-cle cible | Volume estime |
|---------|--------------|---------------|
| Quand tailler sa haie de cedre au Quebec | quand tailler haie cedre | Eleve |
| Combien coute le taillage de haie (prix 2026) | prix taillage haie | Eleve |
| Haie de cedre qui jaunit : causes et solutions | haie cedre jaunit | Moyen |
| Comment fertiliser sa haie de cedre | fertiliser haie cedre | Moyen |
| Elagage vs taillage : quelle difference? | elagage vs taillage | Moyen |
| Top 5 erreurs de taillage de haie | erreur taillage haie | Moyen |
| Entretien haie de cedre apres l'hiver | entretien haie cedre printemps | Saisonnier |
| Meilleur moment pour planter une haie de cedre | planter haie cedre | Saisonnier |

**Frequence** : 2 articles/mois minimum, 800-1500 mots chacun.

### 14. Nouvelles pages de services

Le GAMEPLAN mentionne de nouveaux services a ajouter :
- `/services/lavage-de-vitres/` (deja dans le plan operationnel)
- `/services/deneigement/` (offre 2026)
- `/services/contrat-annuel/` (Plan Tranquillite et Plan Propriete Immaculee)
- `/services/entretien-paysager-commercial/` (appels d'offres MERX)

### 15. Open Graph et Twitter Cards incomplets

**Action** dans Yoast > Reseaux sociaux :
- Activer les Twitter Cards
- Definir une image OG par defaut (1200x630px)
- Remplir OG description pour chaque page

### 16. Email professionnel

`joannettehenri06@gmail.com` comme email de contact nuit a la credibilite.

**Action** : Utiliser `info@taillagehaielite.com` ou `contact@taillagehaielite.com` (GoDaddy offre des boites mail avec le domaine).

---

## OPTIMISATIONS TECHNIQUES (Priorite 4)

### 17. Vitesse de chargement

- Activer le cache WordPress (plugin : WP Super Cache ou LiteSpeed Cache)
- Compresser les images restantes (plugin : ShortPixel ou Imagify)
- Activer le lazy loading des images (natif WordPress ou Elementor)
- Minifier CSS/JS (plugin : Autoptimize)

### 18. Noms de fichiers images

Les images ont des noms generiques (`paysage-1.jpg`, `paysage-2.jpg`). Renommer :
- `paysage-1.jpg` → `taillage-haie-cedre-montreal-avant-apres.jpg`
- `paysage-3.jpg` → `elagage-haie-cedre-laval-resultat.jpg`

### 19. Liens internes

Ameliorer le maillage interne :
- Chaque page de service doit lier vers les 2 autres services
- La FAQ doit lier vers les pages de services pertinentes
- Les articles de blog doivent lier vers les services
- Ajouter des breadcrumbs visibles (Yoast > Reglages > Breadcrumbs)

### 20. HTTPS et securite

Verifier que toutes les pages redirigent bien http → https (GoDaddy le fait normalement).

---

## CHECKLIST D'IMPLEMENTATION

### Semaine 1 : Quick wins (dans l'admin WordPress)
- [ ] Remplir meta descriptions sur les 9 pages (Yoast)
- [ ] Ajouter alt text sur toutes les images
- [ ] Corriger les H1 manquants (Accueil, Elagage, Realisations)
- [ ] Supprimer ou noindex /test-page/
- [ ] Optimiser les title tags
- [ ] Ajouter zone de service dans le footer

### Semaine 2 : Schema et tracking
- [ ] Ajouter schema LocalBusiness (JSON-LD)
- [ ] Ajouter schema FAQPage sur /faq/
- [ ] Installer Google Analytics 4 (GA4)
- [ ] Connecter Google Search Console
- [ ] Soumettre le sitemap dans Search Console

### Semaine 3 : Contenu
- [ ] Etoffer la page Realisations (descriptions, avant/apres, lieux)
- [ ] Etoffer la page A propos (histoire, equipe, valeurs)
- [ ] Etoffer les 3 pages de services (800+ mots chacune)
- [ ] Ajouter temoignages/avis clients

### Semaine 4 : Google Business + pages locales
- [ ] Creer/revendiquer Google Business Profile
- [ ] Demander des avis Google (objectif 10 la premiere semaine)
- [ ] Creer 3 pages de zones de service (Montreal, Laval, Rive-Nord)

### Mois 2 : Contenu + nouveaux services
- [ ] Publier 4 articles de blog
- [ ] Creer page lavage de vitres
- [ ] Creer page deneigement
- [ ] Creer page contrat annuel
- [ ] Completer Open Graph / Twitter Cards
- [ ] Configurer email professionnel

### Mois 3 : Expansion
- [ ] 4 nouveaux articles de blog
- [ ] 3 nouvelles pages de zones de service
- [ ] Obtenir 20+ avis Google
- [ ] Audit performance (Core Web Vitals)
- [ ] Backlinks locaux (annuaires, partenaires, chambres de commerce)

---

## MOTS-CLES CIBLES (recherche locale Quebec)

### Primaires (pages de services)
- taillage haie cedre montreal
- taillage haie prix
- elagage haie cedre
- rabattage haie cedre
- fertilisation haie cedre
- entretien haie cedre

### Secondaires (blog / pages locales)
- quand tailler haie cedre quebec
- prix taillage haie 2026
- haie cedre jaunit
- meilleur fertilisant cedre
- taillage haie laval
- taillage haie rive-nord
- entretien paysager montreal
- soumission taillage haie

### Longue traine (blog)
- combien coute taillage haie cedre par pied
- haie cedre brune apres hiver que faire
- difference elagage taillage haie
- meilleur temps tailler haie cedre quebec
- comment sauver haie cedre malade

---

## OUTILS RECOMMANDES (gratuits)

| Outil | Usage |
|-------|-------|
| Google Search Console | Suivi indexation, erreurs, mots-cles |
| Google Analytics 4 | Trafic, conversions, comportement |
| Google Business Profile | SEO local, avis, Maps |
| Yoast SEO (deja installe) | Meta, schema, sitemap |
| PageSpeed Insights | Performance, Core Web Vitals |
| Schema Markup Validator | Validation des schemas |

---

*Document genere par audit automatise — Mars 2026*
