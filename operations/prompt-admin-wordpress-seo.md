# PROMPT POUR EXECUTER LES TACHES ADMIN WORDPRESS

Copier-coller ce prompt dans Comet, Cursor, ou n'importe quel assistant avec acces navigateur.

---

## CONTEXTE

Tu dois executer des taches d'optimisation SEO sur le site WordPress https://taillagehaielite.com

**Acces admin WordPress :**
- URL : https://taillagehaielite.com/wp-admin/
- Identifiant : joannettehenri06@gmail.com
- Mot de passe : ChangezMoiMaintenant

**Ce qui est DEJA FAIT (ne pas refaire) :**
- Title tags, meta descriptions, focus keywords sur 9 pages (via Yoast XMLRPC)
- Alt text sur 30 images (mediatheque)
- 26 brouillons crees (12 articles, 8 zones, 3 services, 2 index, 1 test-page)
- 4 categories + 14 tags blog
- Cornerstone content sur 7 pages
- OG images + Twitter Cards

---

## TACHES A EXECUTER (dans cet ordre)

### TACHE 1 : Configurer Yoast SEO — Organisation (5 min)

1. Aller dans **Yoast SEO > Reglages > Apparence dans les resultats de recherche > General**
2. Type d'organisation : **Entreprise locale** (ou "Organisation")
3. Nom : **Taillage Haielite**
4. Logo : selectionner le logo existant (taillage-haielite-logo.svg)
5. Aller dans **Reseaux sociaux** :
   - Facebook : `https://www.facebook.com/haielitetaillage/`
   - Instagram : `https://www.instagram.com/taillage_haielite/`
6. Telephone : `(514) 813-8956`
7. Sauvegarder

### TACHE 2 : Noindex archives inutiles (3 min)

1. Aller dans **Yoast SEO > Reglages > Apparence dans les resultats de recherche**
2. Onglet **Archives** :
   - Archives auteur : **Desactiver** (ou mettre noindex)
   - Archives date : **Desactiver** (ou mettre noindex)
3. Onglet **Taxonomies** :
   - Format : **noindex**
4. Sauvegarder

### TACHE 3 : Tagline du site (1 min)

1. Aller dans **Reglages > General**
2. Slogan du site : `Taillage de haies de cedres, elagage et fertilisation a Montreal et Rive-Nord`
3. Sauvegarder

### TACHE 4 : Installer Google Analytics 4 (10 min)

1. Aller dans **Extensions > Ajouter**
2. Chercher **"Site Kit by Google"**
3. Installer et activer
4. Suivre l'assistant :
   - Connecter le compte Google de l'entreprise
   - Activer Google Analytics
   - Activer Google Search Console
5. Dans Search Console, soumettre le sitemap : `https://taillagehaielite.com/sitemap_index.xml`
6. Dans GA4, aller dans **Admin > Evenements** et marquer comme conversions :
   - `form_submission`
   - `phone_click`
   - `email_click`

### TACHE 5 : Installer Microsoft Clarity (2 min) — COMPTE DEJA CREE

Le projet Clarity existe deja : **ID `w4plzkeqkr`**

1. Aller dans **Extensions > Ajouter**
2. Chercher **"Microsoft Clarity"**
3. Installer et activer
4. Se connecter avec le compte Google (joannettehenri06@gmail.com)
5. Selectionner le projet **"Taillage Haielite"** existant
6. Le plugin s'occupe du reste

### TACHE 6 : Installer le mu-plugin de tracking avance (5 min)

**ALTERNATIVE aux taches 4-5 si on veut TOUT dans un seul fichier :**

1. Aller dans **GoDaddy > Gestionnaire de fichiers** (ou FTP)
2. Naviguer vers `/wp-content/mu-plugins/`
3. Si le dossier n'existe pas, le creer
4. Uploader le fichier `haielite-tracking.php` depuis le repo GitHub :
   `https://github.com/JSLeboeuf/Taillage-de-haies/blob/main/outils/haielite-tracking.php`
5. Editer le fichier et remplacer les IDs placeholder restants :
   - `G-XXXXXXXXXX` → votre ID Google Analytics 4
   - `GTM-XXXXXXX` → votre ID Google Tag Manager (si cree)
   - Clarity est deja configure : `w4plzkeqkr` (pas besoin de changer)
   - `123456789012345` → votre ID Meta Pixel (si cree)

### TACHE 7 : Publier les articles de blog (15 min)

Les 12 articles sont deja crees en brouillon avec tout le SEO configure.

1. Aller dans **Articles > Tous les articles**
2. Filtrer par **Brouillon**
3. Pour chaque article :
   - Cliquer **"Modifier avec Elementor"** (optionnel — le contenu HTML est deja la)
   - OU simplement cliquer **"Publier"** pour une mise en ligne rapide
   - Les articles sont deja beaux en format texte standard
4. **Publier 2-3 articles par semaine** (pas tous d'un coup — Google prefere la regularite)

**Ordre de publication recommande (priorite SEO) :**
1. Quand tailler sa haie de cedre au Quebec (ID:1571)
2. Combien coute le taillage de haie (ID:1573)
3. Haie de cedre qui jaunit (ID:1575)
4. 5 erreurs courantes (ID:1613)
5. Credit d'impot pour aines (ID:1609)
6. Elagage vs taillage (ID:1579)
7. Comment fertiliser (ID:1577)
8. Entretien apres l'hiver (ID:1581)
9. Haie vs cloture (ID:1615)
10. Choisir un professionnel (ID:1611)
11. Preparer pour l'hiver (ID:1637)
12. DIY vs professionnel (ID:1639)

### TACHE 8 : Publier les pages de zones (10 min)

1. Aller dans **Pages > Toutes les pages**
2. Filtrer par **Brouillon**
3. Publier les pages de zones dans cet ordre :
   - Montreal (ID:1583) — PRIORITE #1
   - Laval (ID:1585)
   - Terrebonne/Mascouche (ID:1587)
   - Blainville/Ste-Therese (ID:1589)
   - Longueuil/Rive-Sud (ID:1593)
   - Repentigny (ID:1591)
   - Saint-Jerome (ID:1595)
   - Lanaudiere (ID:1597)
4. Publier aussi :
   - Blog index (ID:1605)
   - Zones index (ID:1607)

### TACHE 9 : Publier les pages de nouveaux services (5 min)

1. Publier :
   - Lavage de vitres (ID:1599)
   - Deneigement (ID:1601)
   - Contrat annuel (ID:1603)
2. Si possible, ajouter ces pages dans le menu de navigation (Apparence > Menus)

### TACHE 10 : Ajouter les pages au menu de navigation (5 min)

1. Aller dans **Apparence > Menus** (ou Elementor Header)
2. Ajouter dans le menu principal :
   - Sous "Services" : Lavage de vitres, Deneigement, Contrat annuel
   - Nouveau item : "Zones" (avec sous-menu des villes)
   - Nouveau item : "Blog"
3. Sauvegarder le menu

### TACHE 11 : Creer Google Business Profile (15 min)

1. Aller sur https://business.google.com
2. Cliquer "Gerer maintenant"
3. Nom : **Taillage Haielite**
4. Categorie principale : **Paysagiste** ou **Service d'entretien de pelouse**
5. Categories secondaires : Taille de haies, Entretien paysager
6. Pas d'adresse physique — cocher **"Je livre des biens et services a mes clients"**
7. Zones desservies :
   - Montreal
   - Laval
   - Terrebonne
   - Blainville
   - Repentigny
   - Longueuil
   - Saint-Jerome
8. Telephone : **(514) 813-8956**
9. Site web : **https://taillagehaielite.com**
10. Heures : Lundi-Samedi 7h-19h
11. Description (750 car max) :
    ```
    Taillage Haielite est le specialiste du taillage de haies de cedres a Montreal et dans la grande region. Nos services incluent le taillage de precision, l'elagage et le rabattage, la fertilisation professionnelle, le lavage de vitres et le deneigement residentiel. Equipe certifiee, assuree et passionnee. Soumission gratuite au (514) 813-8956. Plans annuels d'entretien a partir de 1 400$/an.
    ```
12. Ajouter 10+ photos (prendre du site web)
13. Verifier le profil (par telephone ou courrier)

### TACHE 12 : Mettre a jour le copyright footer (2 min)

1. Ouvrir le footer dans Elementor (template ID:63)
2. Changer "© 2024" par "© 2026"
3. Sauvegarder

### TACHE 13 : Ajouter les schemas JSON-LD (10 min)

1. Aller dans **Apparence > Editeur de theme** (ou Elementor > Custom Code)
2. Ou installer le plugin **"WPCode"** (gratuit)
3. Ajouter un snippet "Header" avec le code suivant (LocalBusiness schema) :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LandscapingBusiness",
  "name": "Taillage Haielite",
  "url": "https://taillagehaielite.com",
  "logo": "https://taillagehaielite.com/wp-content/uploads/2024/04/taillage-haielite-logo.svg",
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
    {"@type": "City", "name": "Blainville"},
    {"@type": "City", "name": "Saint-Jerome"}
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
  ]
}
</script>
```

4. Activer sur "Tout le site" / "Site Wide"
5. Position : Header
6. Sauvegarder

---

## VERIFICATION FINALE

Apres avoir complete toutes les taches, verifier :

1. Ouvrir https://taillagehaielite.com en navigation privee
2. Verifier le title dans l'onglet : "Taillage de haies de cedres Montreal | Haie Elite"
3. Faire un clic droit > Afficher source > chercher "application/ld+json" (schema present)
4. Verifier https://search.google.com/test/rich-results?url=https://taillagehaielite.com
5. Verifier https://pagespeed.web.dev/analysis?url=https://taillagehaielite.com
6. Verifier que Google Analytics recoit du trafic (GA4 > Temps reel)
7. Verifier que Clarity recoit des donnees (clarity.microsoft.com)
