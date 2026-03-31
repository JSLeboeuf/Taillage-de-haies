# Setup Tracking Complet — taillagehaielite.com

## Statut actuel : ZERO tracking installe

---

## ETAPE 1 : Creer les comptes (5 minutes chaque)

### Google Analytics 4 (GA4)
1. Aller sur https://analytics.google.com
2. Se connecter avec le compte Google de l'entreprise
3. Cliquer "Commencer les mesures"
4. Nom du compte : `Taillage Haielite`
5. Nom de la propriete : `taillagehaielite.com`
6. Fuseau : Canada, Montreal (EST)
7. Devise : CAD
8. Categorie : Services a domicile
9. Taille : Petite entreprise
10. Objectif : Generer des prospects
11. Creer un flux web : `https://taillagehaielite.com`
12. **NOTER l'ID de mesure** (format `G-XXXXXXXXXX`)

### Google Tag Manager (GTM)
1. Aller sur https://tagmanager.google.com
2. Creer un compte : `Taillage Haielite`
3. Creer un conteneur : `taillagehaielite.com` (type: Web)
4. **NOTER l'ID conteneur** (format `GTM-XXXXXXX`)

### Microsoft Clarity (gratuit, illimite)
1. Aller sur https://clarity.microsoft.com
2. Se connecter (compte Microsoft ou Google)
3. Ajouter un projet : `Taillage Haielite`
4. URL : `https://taillagehaielite.com`
5. Categorie : Home Services
6. **NOTER l'ID projet** (format alphanum, ex: `abc123def4`)

### Meta Pixel (Facebook)
1. Aller sur https://business.facebook.com/events_manager
2. Se connecter avec le compte Facebook de l'entreprise
3. Sources de donnees > Pixels > Ajouter
4. Nom : `Taillage Haielite Pixel`
5. URL : `https://taillagehaielite.com`
6. **NOTER l'ID pixel** (format numerique, ex: `123456789012345`)

---

## ETAPE 2 : Installer les codes sur le site

### Option A : Demander a Shooga (recommande — plus rapide)

Envoyer le courriel ci-dessous a mariane@shooga.ca avec les IDs obtenus.

### Option B : Plugin WordPress (requiert admin)

1. Se connecter a https://taillagehaielite.com/wp-admin/
2. Extensions > Ajouter > Chercher "Site Kit by Google"
3. Installer et activer
4. Suivre l'assistant de connexion Google (GA4 + Search Console)
5. Pour Clarity : Extensions > Ajouter > "Microsoft Clarity"
6. Pour Meta Pixel : Extensions > Ajouter > "PixelYourSite"

### Option C : Code personnalise (mu-plugin)

Uploader le fichier `haielite-tracking.php` (ci-dessous) dans :
`/wp-content/mu-plugins/haielite-tracking.php`

Via FTP GoDaddy ou gestionnaire de fichiers GoDaddy.

---

## FICHIER MU-PLUGIN : haielite-tracking.php

```php
<?php
/**
 * Plugin Name: Haie Elite - Tracking Scripts
 * Description: GA4 + GTM + Clarity + Meta Pixel
 * Version: 1.0
 * Author: Taillage Haielite
 */

// REMPLACER CES VALEURS PAR VOS IDS REELS
define('HAIELITE_GA4_ID', 'G-XXXXXXXXXX');        // Google Analytics 4
define('HAIELITE_GTM_ID', 'GTM-XXXXXXX');          // Google Tag Manager
define('HAIELITE_CLARITY_ID', 'abcdef1234');        // Microsoft Clarity
define('HAIELITE_META_PIXEL_ID', '123456789012345'); // Meta/Facebook Pixel

// Ne pas tracker les admins/editeurs
function haielite_should_track() {
    if (is_user_logged_in() && current_user_can('edit_posts')) {
        return false;
    }
    return true;
}

// === HEAD SCRIPTS ===
add_action('wp_head', function() {
    if (!haielite_should_track()) return;
    ?>

    <!-- Google Tag Manager -->
    <?php if (HAIELITE_GTM_ID !== 'GTM-XXXXXXX') : ?>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','<?php echo esc_js(HAIELITE_GTM_ID); ?>');</script>
    <?php endif; ?>

    <!-- Google Analytics 4 -->
    <?php if (HAIELITE_GA4_ID !== 'G-XXXXXXXXXX') : ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr(HAIELITE_GA4_ID); ?>"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '<?php echo esc_js(HAIELITE_GA4_ID); ?>', {
        'send_page_view': true,
        'cookie_flags': 'SameSite=None;Secure'
    });
    // Track phone clicks
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href^="tel:"]');
        if (link) {
            gtag('event', 'phone_click', {
                'event_category': 'contact',
                'event_label': link.href
            });
        }
    });
    // Track email clicks
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href^="mailto:"]');
        if (link) {
            gtag('event', 'email_click', {
                'event_category': 'contact',
                'event_label': link.href
            });
        }
    });
    // Track form submissions (Formidable Forms)
    document.addEventListener('frmFormComplete', function(e) {
        gtag('event', 'form_submission', {
            'event_category': 'conversion',
            'event_label': 'contact_form'
        });
    });
    </script>
    <?php endif; ?>

    <!-- Microsoft Clarity -->
    <?php if (HAIELITE_CLARITY_ID !== 'abcdef1234') : ?>
    <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script","<?php echo esc_js(HAIELITE_CLARITY_ID); ?>");
    </script>
    <?php endif; ?>

    <!-- Meta Pixel -->
    <?php if (HAIELITE_META_PIXEL_ID !== '123456789012345') : ?>
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '<?php echo esc_js(HAIELITE_META_PIXEL_ID); ?>');
    fbq('track', 'PageView');
    // Track form submissions
    document.addEventListener('frmFormComplete', function() {
        fbq('track', 'Lead');
    });
    // Track phone clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('a[href^="tel:"]')) {
            fbq('track', 'Contact');
        }
    });
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=<?php echo esc_attr(HAIELITE_META_PIXEL_ID); ?>&ev=PageView&noscript=1"/></noscript>
    <?php endif; ?>

    <?php
}, 1); // Priority 1 = very early in <head>

// === BODY OPEN (GTM noscript fallback) ===
add_action('wp_body_open', function() {
    if (!haielite_should_track()) return;
    if (HAIELITE_GTM_ID !== 'GTM-XXXXXXX') :
    ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo esc_attr(HAIELITE_GTM_ID); ?>"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <?php endif;
});
```

---

## ETAPE 3 : Configurer Google Search Console

1. Aller sur https://search.google.com/search-console
2. Ajouter une propriete : `https://taillagehaielite.com`
3. Methode de verification : balise HTML (copier le meta tag)
4. Coller dans Yoast > Reglages > Apparence dans les resultats > Outils webmaster > Google
5. Soumettre le sitemap : `https://taillagehaielite.com/sitemap_index.xml`

---

## ETAPE 4 : Configurer les conversions dans GA4

Dans GA4 > Admin > Evenements, marquer comme conversions :
- `form_submission` — Soumission formulaire contact
- `phone_click` — Clic sur numero de telephone
- `email_click` — Clic sur adresse email

---

## ETAPE 5 : Dashboard Clarity a surveiller

Apres 48h de donnees :
1. **Heatmaps** : Verifier ou les gens cliquent sur l'accueil
2. **Session Recordings** : Regarder 10 sessions pour comprendre le comportement
3. **Dead Clicks** : Identifier les elements ou les gens cliquent sans resultat
4. **Scroll Depth** : Verifier si les CTA sont vus (au-dessus du fold)

---

## COURRIEL A ENVOYER A SHOOGA

**Objet** : Installation codes de tracking — taillagehaielite.com

```
Bonjour Mariane,

J'aimerais faire installer les codes de tracking suivants sur le site taillagehaielite.com.

Pourriez-vous ajouter ces scripts dans le <head> de toutes les pages (via Elementor > Custom Code ou fonctions du theme) :

1. Google Analytics 4 (ID: G-XXXXXXXXXX)
2. Google Tag Manager (ID: GTM-XXXXXXX)
3. Microsoft Clarity (ID: XXXXXXXXXX)
4. Meta Pixel (ID: XXXXXXXXXXXXXXX)

Je vous envoie les IDs exacts des que les comptes sont crees.

Alternativement, je peux vous fournir un fichier PHP a placer dans
/wp-content/mu-plugins/ qui contient tous les scripts.

Aussi, pourriez-vous :
- Ajouter le code de verification Google Search Console dans Yoast
- Mettre a jour la tagline du site dans Reglages > General :
  "Taillage de haies de cedres, elagage et fertilisation a Montreal et Rive-Nord"
- Configurer le type d'organisation dans Yoast > Reglages > Apparence > General :
  - Type : Entreprise locale
  - Nom : Taillage Haielite
  - Telephone : (514) 813-8956
  - Reseaux sociaux :
    - Facebook: https://www.facebook.com/haielitetaillage/
    - Instagram: https://www.instagram.com/taillage_haielite/

Merci beaucoup!
Henri
```

---

## EVENEMENTS PERSONNALISES A TRACKER

| Evenement | Declencheur | Importance |
|-----------|------------|------------|
| `form_submission` | Formulaire Formidable soumis | Conversion principale |
| `phone_click` | Clic sur `tel:` link | Conversion principale |
| `email_click` | Clic sur `mailto:` link | Conversion secondaire |
| `cta_click` | Clic sur bouton "Soumission gratuite" | Micro-conversion |
| `scroll_50` | Scroll 50% de la page | Engagement |
| `scroll_90` | Scroll 90% de la page | Engagement fort |
| `page_view` | Chaque page vue (automatique GA4) | Base |
| `session_start` | Nouvelle session (automatique GA4) | Base |

---

## TRACKING AVANCE (Phase 2, apres 30 jours de donnees)

### Call Tracking
- Service : CallRail ou CallTrackingMetrics
- Numero local Montreal avec redirection
- Permet de tracker les appels par source (Google, Facebook, direct)

### Formulaire UTM
- Ajouter des champs caches UTM aux formulaires Formidable
- Permet de savoir d'ou vient chaque lead

### Rapport hebdomadaire automatique
- GA4 > Admin > Rapports personnalises > Planifier envoi email
- Metriques : sessions, conversions, sources, pages top
