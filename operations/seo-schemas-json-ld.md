# SEO Schemas JSON-LD — Taillage Haielite
## Guide Complet pour Structured Data & Local SEO

**Date:** Mars 2026
**Entreprise:** Taillage Haielite
**Propriétaire:** Henri Joannette
**URL:** https://taillagehaielite.com

---

## Table des matières
1. [Schemas Requis](#schemas-requis)
2. [Instructions d'Implémentation](#instructions-dimpllémentation)
3. [Validation](#validation)
4. [FAQ Complète](#faq-complète)

---

## Schemas Requis

### 1. LocalBusiness (Page d'Accueil)

**Placer sur:** `<head>` de la page d'accueil (index.html ou via Yoast)

```json
{
  "@context": "https://schema.org",
  "@type": "LandscapingBusiness",
  "@id": "https://taillagehaielite.com/#organization",
  "name": "Taillage Haielite",
  "url": "https://taillagehaielite.com",
  "logo": "https://taillagehaielite.com/wp-content/uploads/taillage-haielite-logo.svg",
  "image": [
    "https://taillagehaielite.com/wp-content/uploads/2024/05/poignee-de-main-1.webp",
    "https://taillagehaielite.com/wp-content/uploads/images/service-1.webp",
    "https://taillagehaielite.com/wp-content/uploads/images/service-2.webp"
  ],
  "description": "Taillage Haielite offre des services professionnels de taillage de haies, élagage, rabattage et fertilisation dans la région de Montréal et ses environs.",
  "telephone": "+15148138956",
  "email": "joannettehenri06@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[À remplir avec adresse physique]",
    "addressLocality": "Montréal",
    "addressRegion": "QC",
    "postalCode": "[À remplir]",
    "addressCountry": "CA"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Montréal",
      "url": "https://taillagehaielite.com/zones/montreal"
    },
    {
      "@type": "City",
      "name": "Laval",
      "url": "https://taillagehaielite.com/zones/laval"
    },
    {
      "@type": "City",
      "name": "Longueuil",
      "url": "https://taillagehaielite.com/zones/longueuil"
    },
    {
      "@type": "City",
      "name": "Terrebonne",
      "url": "https://taillagehaielite.com/zones/terrebonne"
    },
    {
      "@type": "City",
      "name": "Repentigny",
      "url": "https://taillagehaielite.com/zones/repentigny"
    },
    {
      "@type": "City",
      "name": "Blainville",
      "url": "https://taillagehaielite.com/zones/blainville"
    },
    {
      "@type": "City",
      "name": "Saint-Jérôme",
      "url": "https://taillagehaielite.com/zones/saint-jerome"
    }
  ],
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "07:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "Closed"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/haielitetaillage/",
    "https://www.instagram.com/taillage_haielite/"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services de Taillage",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Taillage de haies de cèdres et arbustes",
          "description": "Service professionnel de taillage de haies de cèdres, arbustes et plantes de paysagement.",
          "url": "https://taillagehaielite.com/services/taillage-haies"
        },
        "price": "[À remplir]",
        "priceCurrency": "CAD",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Élagage et rabattage",
          "description": "Élagage professionnel, rabattage de haies et gestion des branches mortes.",
          "url": "https://taillagehaielite.com/services/elagage-rabattage"
        },
        "price": "[À remplir]",
        "priceCurrency": "CAD",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Fertilisation",
          "description": "Service de fertilisation pour maintenir la santé et la vigorosité de vos haies.",
          "url": "https://taillagehaielite.com/services/fertilisation"
        },
        "price": "[À remplir]",
        "priceCurrency": "CAD",
        "availability": "https://schema.org/InStock"
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "[À remplir: nb d'avis Google]",
    "reviewCount": "[À remplir: nb d'avis Google]"
  },
  "contact": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "telephone": "+15148138956",
    "email": "joannettehenri06@gmail.com"
  }
}
```

---

### 2. FAQPage (Page FAQ)

**Placer sur:** `<head>` de la page FAQ complète

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://taillagehaielite.com/faq/#faqpage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quel est le meilleur temps pour rabattre une haie de cèdre?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le meilleur temps pour rabattre une haie de cèdre est à la fin du printemps ou au début de l'été, généralement entre mai et juin. C'est à ce moment que l'arbre reprend sa croissance active et peut se rétablir rapidement. Évitez les périodes de gel ou de sécheresse extrême."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de temps attendre avant de tailler une nouvelle plantation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pour une nouvelle plantation de cèdre, attendez au moins 2-3 ans avant une première taille légère. La plante a besoin de ce temps pour établir ses racines et sa structure. Une première taille légère après 2-3 ans aide à former une haie dense et uniforme."
      }
    },
    {
      "@type": "Question",
      "name": "Est-il bon de faire tailler la haie chaque année?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, une taille annuelle est recommandée pour maintenir une haie saine et esthétique. Une taille une fois par an, généralement à la fin du printemps, favorise la croissance dense, maintient la forme et prévient le vieillissement de la haie."
      }
    },
    {
      "@type": "Question",
      "name": "Quelle quantité enlever pour la taille de haie?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En général, on recommande de tailler entre 15 à 30 cm (6 à 12 pouces) lors d'une taille annuelle. Pour une haie mature, ne pas enlever plus du tiers de la croissance nouvelle. Une taille trop agressive peut causer des dégâts et ralentir la repousse."
      }
    },
    {
      "@type": "Question",
      "name": "Combien coûte le taillage de haie de cèdre?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le coût du taillage de haie de cèdre varie selon la longueur, la hauteur et l'état de la haie. Nous offrons des soumissions gratuites pour évaluer vos besoins spécifiques. En moyenne, le service coûte entre 200 $ et 800 $ par projet, selon la taille. Contactez-nous pour une estimation précise."
      }
    },
    {
      "@type": "Question",
      "name": "Quelles zones desservez-vous?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nous desservons la région métropolitaine de Montréal et ses environs: Montréal, Laval, Longueuil, Terrebonne, Repentigny, Blainville et Saint-Jérôme. Si vous n'êtes pas certain si votre adresse fait partie de notre zone de service, n'hésitez pas à nous contacter."
      }
    },
    {
      "@type": "Question",
      "name": "Offrez-vous des soumissions gratuites?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, nous offrons des soumissions gratuites et sans engagement. Notre équipe se déplacera pour évaluer votre projet et vous proposer un prix juste et honnête. Contactez-nous par téléphone ou par courriel pour prendre rendez-vous."
      }
    },
    {
      "@type": "Question",
      "name": "Peut-on obtenir un crédit d'impôt pour le taillage de haie?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Au Québec, le RénoVéhicule (anciennement Réno-Climat) peut couvrir certains travaux d'amélioration énergétique. Le taillage de haie seul ne qualifie généralement pas pour les crédits d'impôt provinciaux ou fédéraux. Cependant, si vous combinez le taillage avec d'autres rénovations, consultez un expert fiscal. Nous pouvons vous fournir une facture détaillée."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de fois par année faut-il tailler sa haie de cèdre?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pour un cèdre, une taille annuelle suffît généralement. Elle se fait généralement à la fin du printemps (mai-juin). Certains propriétaires préfèrent une taille légère supplémentaire à la fin de l'été pour maintenir la forme, mais une seule taille bien faite par année est le standard."
      }
    },
    {
      "@type": "Question",
      "name": "Que faire si ma haie de cèdre est devenue trop large?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Si votre haie de cèdre est devenue trop large, un rabattage progressif sur 2-3 ans est recommandé. Une première année, on réduit de 30-40 cm. La deuxième année, on réduit à nouveau de 20-30 cm, et ainsi de suite. Cela permet au cèdre de récupérer progressivement sans dégâts sérieux. Une taille drastique unique peut tuer la haie."
      }
    }
  ]
}
```

---

### 3. Service Schemas (3 pages de services)

#### Service 1: Taillage de haies de cèdres et arbustes

**Placer sur:** `/services/taillage-haies` (ou page correspondante)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://taillagehaielite.com/services/taillage-haies/#service",
  "name": "Taillage de haies de cèdres et arbustes",
  "description": "Service professionnel de taillage et d'entretien de haies de cèdres, arbustes et plantes de paysagement. Nos experts utilisent des techniques éprouvées pour assurer une haie saine et esthétique.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Taillage Haielite",
    "url": "https://taillagehaielite.com",
    "telephone": "+15148138956",
    "email": "joannettehenri06@gmail.com"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Montréal"
    },
    {
      "@type": "City",
      "name": "Laval"
    },
    {
      "@type": "City",
      "name": "Longueuil"
    },
    {
      "@type": "City",
      "name": "Terrebonne"
    },
    {
      "@type": "City",
      "name": "Repentigny"
    },
    {
      "@type": "City",
      "name": "Blainville"
    },
    {
      "@type": "City",
      "name": "Saint-Jérôme"
    }
  ],
  "url": "https://taillagehaielite.com/services/taillage-haies",
  "image": "https://taillagehaielite.com/wp-content/uploads/2024/05/taillage-haies-cedres.webp",
  "potentialAction": {
    "@type": "OrderAction",
    "target": "https://taillagehaielite.com/contact"
  }
}
```

#### Service 2: Élagage et rabattage

**Placer sur:** `/services/elagage-rabattage` (ou page correspondante)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://taillagehaielite.com/services/elagage-rabattage/#service",
  "name": "Élagage et rabattage",
  "description": "Service d'élagage professionnel et rabattage de haies pour éliminer les branches mortes, malades ou non désirées. Parfait pour rajeunir une vieille haie ou réduire sa taille.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Taillage Haielite",
    "url": "https://taillagehaielite.com",
    "telephone": "+15148138956",
    "email": "joannettehenri06@gmail.com"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Montréal"
    },
    {
      "@type": "City",
      "name": "Laval"
    },
    {
      "@type": "City",
      "name": "Longueuil"
    },
    {
      "@type": "City",
      "name": "Terrebonne"
    },
    {
      "@type": "City",
      "name": "Repentigny"
    },
    {
      "@type": "City",
      "name": "Blainville"
    },
    {
      "@type": "City",
      "name": "Saint-Jérôme"
    }
  ],
  "url": "https://taillagehaielite.com/services/elagage-rabattage",
  "image": "https://taillagehaielite.com/wp-content/uploads/2024/05/elagage-rabattage.webp",
  "potentialAction": {
    "@type": "OrderAction",
    "target": "https://taillagehaielite.com/contact"
  }
}
```

#### Service 3: Fertilisation

**Placer sur:** `/services/fertilisation` (ou page correspondante)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://taillagehaielite.com/services/fertilisation/#service",
  "name": "Fertilisation",
  "description": "Service de fertilisation professionnelle pour maintenir la santé, la vigorosité et la couleur des haies de cèdres et arbustes. Un entretien régulier assure une croissance optimale.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Taillage Haielite",
    "url": "https://taillagehaielite.com",
    "telephone": "+15148138956",
    "email": "joannettehenri06@gmail.com"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Montréal"
    },
    {
      "@type": "City",
      "name": "Laval"
    },
    {
      "@type": "City",
      "name": "Longueuil"
    },
    {
      "@type": "City",
      "name": "Terrebonne"
    },
    {
      "@type": "City",
      "name": "Repentigny"
    },
    {
      "@type": "City",
      "name": "Blainville"
    },
    {
      "@type": "City",
      "name": "Saint-Jérôme"
    }
  ],
  "url": "https://taillagehaielite.com/services/fertilisation",
  "image": "https://taillagehaielite.com/wp-content/uploads/2024/05/fertilisation-haies.webp",
  "potentialAction": {
    "@type": "OrderAction",
    "target": "https://taillagehaielite.com/contact"
  }
}
```

---

### 4. BreadcrumbList Schemas

**Placer sur:** Chaque page, avant le contenu principal

#### Accueil > Services > [Service]

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/services/taillage-haies/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://taillagehaielite.com/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Taillage de haies de cèdres et arbustes",
      "item": "https://taillagehaielite.com/services/taillage-haies"
    }
  ]
}
```

**Variantes pour autres pages:**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/a-propos/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "À propos",
      "item": "https://taillagehaielite.com/a-propos"
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/realisations/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Réalisations",
      "item": "https://taillagehaielite.com/realisations"
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/contact/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Contact",
      "item": "https://taillagehaielite.com/contact"
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/faq/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "FAQ",
      "item": "https://taillagehaielite.com/faq"
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/zones/montreal/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Zones",
      "item": "https://taillagehaielite.com/zones"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Montréal",
      "item": "https://taillagehaielite.com/zones/montreal"
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://taillagehaielite.com/blog/article-titre/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://taillagehaielite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://taillagehaielite.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Titre de l'article]",
      "item": "https://taillagehaielite.com/blog/article-titre"
    }
  ]
}
```

---

### 5. WebSite Schema (avec SearchAction)

**Placer sur:** `<head>` de la page d'accueil

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://taillagehaielite.com/#website",
  "name": "Taillage Haielite",
  "url": "https://taillagehaielite.com",
  "description": "Service professionnel de taillage de haies de cèdres, élagage et fertilisation à Montréal, Laval et région.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://taillagehaielite.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

### 6. Article Schema (Template pour blog)

**Placer sur:** Chaque article de blog, dans le `<head>`

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://taillagehaielite.com/blog/article-titre/#article",
  "headline": "[Titre de l'article]",
  "author": {
    "@type": "Person",
    "name": "Henri Joannette"
  },
  "datePublished": "2026-03-15T08:00:00+00:00",
  "dateModified": "2026-03-20T10:30:00+00:00",
  "publisher": {
    "@type": "Organization",
    "name": "Taillage Haielite",
    "logo": {
      "@type": "ImageObject",
      "url": "https://taillagehaielite.com/wp-content/uploads/taillage-haielite-logo.svg"
    }
  },
  "image": {
    "@type": "ImageObject",
    "url": "https://taillagehaielite.com/wp-content/uploads/blog/article-image.webp",
    "width": 1200,
    "height": 630
  },
  "description": "[Courte description ou excerpt de l'article]",
  "articleBody": "[Le contenu complet de l'article peut être inclus ici ou omis]"
}
```

---

### 7. Review / AggregateRating Template

**Placer sur:** Page d'accueil et/ou pages de services (mettre à jour avec des avis réels)

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "@id": "https://taillagehaielite.com/#review-1",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Person",
    "name": "[Nom du client]"
  },
  "reviewBody": "[Texte de l'avis client]",
  "datePublished": "2026-02-15T12:00:00+00:00",
  "publisher": {
    "@type": "Organization",
    "name": "Google",
    "logo": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
  }
}
```

**Format pour afficher directement l'AggregateRating (mieux pour SEO):**

```json
{
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "@id": "https://taillagehaielite.com/#aggregate-rating",
  "ratingValue": "4.9",
  "ratingCount": "[Nombre d'avis]",
  "reviewCount": "[Nombre d'avis]",
  "bestRating": "5",
  "worstRating": "1"
}
```

---

## Instructions d'Implémentation

### Option 1: Via Yoast SEO (WordPress)

**MEILLEURE OPTION pour WordPress**

#### Étapes:

1. **LocalBusiness Schema:**
   - Aller à: `Yoast SEO > Dashboard > Site Features > Business`
   - Activer "Local Business"
   - Remplir: Nom, Adresse, Téléphone, Email, Heures d'ouverture
   - Télécharger le logo
   - Ajouter les réseaux sociaux (Facebook, Instagram)
   - Sauvegarder

2. **FAQPage Schema:**
   - Aller à: `Yoast SEO > Dashboard > Features > Site Features > FAQ`
   - Activer "FAQ"
   - Créer une page dédiée "FAQ"
   - Dans l'éditeur WordPress, utiliser le bloc Yoast FAQ
   - Ajouter Q&A en suivant la structure ci-dessus
   - Publier

3. **Service Schemas:**
   - Créer une page pour chaque service
   - Ajouter manuellement via "Custom Field" ou utiliser un plugin comme:
     - **WooCommerce > Products** (si utilisant WooCommerce)
     - **Ou ajouter manuellement en HTML:**

4. **Ajouter manuellement JSON-LD (sans Yoast):**
   - Aller au footer du site (footer.php ou via plugin)
   - Ajouter dans `<head>`:
   ```html
   <script type="application/ld+json">
   [COLLER LE JSON ICI]
   </script>
   ```

5. **BreadcrumbList:**
   - Yoast génère automatiquement si activé
   - Aller à: `Yoast SEO > Dashboard > Appearance in Search > Breadcrumbs`
   - Activer et configurer

### Option 2: Via Plugin Schema (Schema)

**Alternative gratuite**

1. Installer: **Schema** (gratuit, confiance WordPress)
2. Aller à: `Schema > Add Schema`
3. Créer un nouveau schema pour chaque type
4. Remplir les champs
5. Assigner à la page/post correspondant
6. Publier

### Option 3: Manuellement (Code)

**Maximum contrôle, si vous codez**

1. Créer un fichier: `inc/schema-markup.php`
2. Ajouter les JSON-LD ci-dessus dedans
3. Dans `functions.php`:
```php
function add_schema_markup() {
    if ( is_front_page() ) {
        get_template_part( 'inc/schema', 'markup' );
    }
}
add_action( 'wp_head', 'add_schema_markup' );
```
4. Ou utiliser **Header / Footer Code** plugin pour ajouter le JSON directement

---

## Validation

### Outils Google

1. **Google Schema Testing Tool:**
   - Lien: https://schema.org/docs/gs.html
   - Ou: https://validator.schema.org/

2. **Google Rich Results Test:**
   - Lien: https://search.google.com/test/rich-results
   - Copier l'URL de votre site
   - Vérifier les rich results détectés

3. **Structured Data Testing Tool (legacy):**
   - https://www.google.com/webmasters/markup-helper/
   - Utile pour tester JSON-LD

### Procédure de validation:

1. Publier un schema
2. Aller à: https://search.google.com/test/rich-results
3. Coller l'URL de la page
4. Attendre le scan (30-60 sec)
5. Vérifier les erreurs / warnings
6. Corriger et valider à nouveau
7. Répéter pour chaque page

### Erreurs courantes à éviter:

- **URL non https:** Tous les URLs doivent être HTTPS
- **Image manquante:** Chaque schema avec image doit avoir un URL valide
- **Champ requis vide:** Vérifier les champs obligatoires
- **Dates invalides:** Format ISO 8601 (`YYYY-MM-DDTHH:MM:SS+00:00`)
- **Prix manquant:** Inclure `priceCurrency: CAD` si prix mentionné
- **Doublons:** Un seul schema "LocalBusiness" par site

---

## FAQ Complète (Détails)

### Q1: Quel est le meilleur temps pour rabattre une haie de cèdre?

**Réponse:** Le meilleur temps pour rabattre une haie de cèdre est à la **fin du printemps ou au début de l'été** (mai-juin). À ce moment, l'arbre reprend sa croissance active après l'hiver et peut se rétablir rapidement après une taille agressive. Évitez absolument les périodes de gel ou de sécheresse extrême, qui pourraient compromettre la récupération.

### Q2: Combien de temps attendre avant de tailler une nouvelle plantation?

**Réponse:** Attendez au minimum **2-3 ans** avant une première taille significative d'une nouvelle plantation de cèdre. La plante a besoin de ce temps pour établir des racines profondes et sa structure de base. Après 2-3 ans, une taille légère (5-10 cm) aide à former une haie dense et uniforme pour les années à venir.

### Q3: Est-il bon de faire tailler la haie chaque année?

**Réponse:** **Oui, absolument.** Une taille annuelle est fortement recommandée pour maintenir une haie saine, esthétique et uniforme. Une seule taille bien faite par année (généralement fin mai-juin) suffit. Cela:
- Favorise une croissance dense
- Maintient la forme et le contrôle de taille
- Prévient le vieillissement et l'élagage excessif
- Améliore l'apparence générale

### Q4: Quelle quantité enlever pour la taille de haie?

**Réponse:** La règle générale est:
- **Taille annuelle standard:** 15-30 cm (6-12 pouces)
- **Taille agressive (rabattage):** Maximum le tiers de la croissance totale
- **Conseil:** Ne jamais enlever plus du tiers de la croissance nouvelle en une seule taille
- Une taille trop agressive peut causer des dégâts sérieux et ralentir la repousse pendant plusieurs mois

### Q5: Combien coûte le taillage de haie de cèdre?

**Réponse:** Le coût varie selon plusieurs facteurs:
- **Longueur de la haie:** Par mètre linéaire
- **Hauteur:** Plus haute = plus cher (équipement/temps)
- **État de la haie:** Haie négligée = travail supplémentaire
- **Prix moyen:** 200 $ à 800 $ par projet dans la région
- **Conseil:** Nous offrons des **soumissions gratuites**. Appelez-nous pour une estimation précise

### Q6: Quelles zones desservez-vous?

**Réponse:** Nous desservons toute la **région métropolitaine de Montréal et environs**:
- Montréal
- Laval
- Longueuil
- Terrebonne
- Repentigny
- Blainville
- Saint-Jérôme

Si vous êtes en doute, contactez-nous — nous desservons peut-être votre secteur!

### Q7: Offrez-vous des soumissions gratuites?

**Réponse:** **Oui, toujours.** Nos soumissions sont:
- Gratuites et sans engagement
- Basées sur une évaluation sur place
- Détaillées et honnêtes
- Valides 30 jours

Contactez-nous par téléphone (+1 514-813-8956) ou courriel (joannettehenri06@gmail.com) pour prendre rendez-vous.

### Q8: Peut-on obtenir un crédit d'impôt pour le taillage de haie?

**Réponse:** Au Québec:
- Le **taillage de haie seul** ne qualifie pas pour les crédits d'impôt fédéraux ou provinciaux
- Le **RénoVéhicule** (anciennement Réno-Climat) couvre certaines rénovations énergétiques, mais pas le taillage général
- **Si vous combinez:** Taillage + travaux d'efficacité énergétique, vous pourriez qualifier
- **Conseil:** Consulter un expert fiscal pour évaluer votre situation complète
- Nous fournirons une **facture détaillée** pour vos dossiers

### Q9: Combien de fois par année faut-il tailler sa haie de cèdre?

**Réponse:** **Une fois par année suffit généralement:**
- Taille principale: **fin mai / début juin**
- Elle permet à la haie de se rétablir avant l'hiver
- Certains propriétaires préfèrent une petite **taille légère à la fin août** pour maintenir la forme avant l'automne, mais ce n'est pas essentiel
- Une taille bien faite par année = résultats optimaux

### Q10: Que faire si ma haie de cèdre est devenue trop large?

**Réponse:** Si la haie est trop large, un **rabattage progressif sur 2-3 ans** est essentiel:

**Année 1:** Réduire de 30-40 cm (côtés + haut)
**Année 2:** Réduire à nouveau de 20-30 cm
**Année 3:** Ajustement final si nécessaire

**Pourquoi progressif?**
- Une taille drastique unique risque de tuer la haie
- Le cèdre a besoin de temps pour récupérer
- Les branches anciennes internes sont souvent creuses/mortes

**Alternative:** Enlever des sections complètes de la haie et les remplacer par de jeunes plants (parfois plus rentable que le rabattage agressif).

---

## Checklist d'Implémentation

### Avant de lancer:

- [ ] Vérifier que le site est en HTTPS
- [ ] Configurer Google Business Profile (https://business.google.com)
- [ ] Installer Yoast SEO ou Schema plugin
- [ ] Créer/mettre à jour les pages: Services, FAQ, À propos, Contact, Zones
- [ ] Ajouter les images correspondantes (min. 1200x630px pour OG)

### Implémentation des schemas:

- [ ] LocalBusiness (page d'accueil) ✓
- [ ] FAQPage (page FAQ) ✓
- [ ] 3 Service schemas (taillage, élagage, fertilisation) ✓
- [ ] BreadcrumbList (toutes les pages) ✓
- [ ] WebSite + SearchAction (page d'accueil) ✓
- [ ] Article template (si blog actif) ✓
- [ ] AggregateRating (page d'accueil + services) ✓

### Validation:

- [ ] Valider chaque schema avec https://search.google.com/test/rich-results
- [ ] Vérifier dans Google Search Console (Coverage)
- [ ] Tester mobil et desktop
- [ ] Attendre 48-72h pour indexation

### Maintenance:

- [ ] Mettre à jour les avis clients mensuellement
- [ ] Ajuster les zones desservies si changement
- [ ] Ajouter de nouveaux articles de blog (avec Article schema)
- [ ] Revalider annuellement

---

## Notes importantes

**Priorités SEO Local:**
1. **Google Business Profile** = #1 critère pour local SEO
2. **Avis clients** (Google, Facebook) = Très important
3. **Structured data** (schemas) = Améliore le CTR dans les résultats
4. **Backlins locaux** = Annuaires locaux, partenaires régionaux
5. **Contenu local** = Pages par zone, articles sur l'entretien saisonnier

**Timeline réaliste:**
- Semaine 1: Implémentation des schemas
- Semaine 2-3: Validation et correction
- Mois 2: Indexation et apparition dans rich results
- Mois 3+: Amélioration progressive du CTR et des clics

---

**Document généré:** Mars 2026
**Auteur:** Claude (Haiku 4.5)
**Mise à jour:** À réviser mensuellement
