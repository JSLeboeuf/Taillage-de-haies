# Haie Lite — Brand Guidelines

> Design system extrait de `plan-complet.html`

---

## COULEURS

### Palette Principale

| Nom | Hex | Usage |
|-----|-----|-------|
| **Vert Primary** | `#4a7c43` | Titres H1, bordures, accents principaux |
| **Vert Light** | `#6b9b37` | Titres H2, highlights, valeurs numeriques |
| **Vert Dark** | `#2d5a27` | Gradients, arriere-plans fonces |
| **Background** | `#0a0a0a` | Fond principal (quasi-noir) |
| **White** | `#ffffff` | Texte principal |
| **White 70%** | `rgba(255,255,255,0.7)` | Sous-titres, texte secondaire |
| **White 50%** | `rgba(255,255,255,0.5)` | Labels, texte tertiaire |
| **White 30%** | `rgba(255,255,255,0.3)` | Numeros de slides, elements discrets |

### Gradients

```css
/* Gradient principal (hero/highlight) */
background: linear-gradient(135deg, #2d5a27, #4a7c43);

/* Gradient radial (slides background) */
background: radial-gradient(ellipse at 50% 50%, rgba(45, 90, 39, 0.15) 0%, transparent 70%);

/* Gradient card highlight */
background: linear-gradient(135deg, rgba(45, 90, 39, 0.3), rgba(45, 90, 39, 0.1));
```

### Background Cards

```css
/* Card standard */
background: rgba(45, 90, 39, 0.15);
border: 1px solid rgba(74, 124, 67, 0.3);

/* Card hover */
background: rgba(45, 90, 39, 0.25);
border-color: #4a7c43;

/* Table header */
background: rgba(45, 90, 39, 0.3);

/* Year header row */
background: rgba(45, 90, 39, 0.15);
```

---

## TYPOGRAPHIE

### Font Family

```css
font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
```

### Tailles

| Element | Taille | Poids | Couleur |
|---------|--------|-------|---------|
| **H1** | 72px | 800 | #4a7c43 |
| **H2** | 48px | 700 | #6b9b37 |
| **H3** | 28px | 600 | #4a7c43 |
| **H4 (Card)** | 20px | 600 | #6b9b37 |
| **Subtitle** | 28px | 300 | rgba(255,255,255,0.7) |
| **Body** | 15-16px | 400 | rgba(255,255,255,0.7) |
| **Big Number** | 100px | 800 | #6b9b37 |
| **Quote** | 32px | 400 italic | rgba(255,255,255,0.9) |
| **Small** | 12-14px | 400 | rgba(255,255,255,0.5) |

### Letter Spacing

```css
/* H1 uniquement */
letter-spacing: -2px;
```

---

## COMPOSANTS

### Cards

```css
.card {
    background: rgba(45, 90, 39, 0.15);
    border: 1px solid rgba(74, 124, 67, 0.3);
    border-radius: 16px;
    padding: 30px;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    border-color: #4a7c43;
    background: rgba(45, 90, 39, 0.25);
}
```

### Highlight Box

```css
.highlight-box {
    background: linear-gradient(135deg, rgba(45, 90, 39, 0.3), rgba(45, 90, 39, 0.1));
    border: 2px solid #4a7c43;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
}
```

### Quote

```css
.quote {
    font-size: 32px;
    font-style: italic;
    color: rgba(255,255,255,0.9);
    border-left: 4px solid #4a7c43;
    padding-left: 30px;
    max-width: 900px;
    line-height: 1.5;
}
```

### Tables

```css
.table th {
    background: rgba(45, 90, 39, 0.3);
    padding: 14px 16px;
    font-size: 14px;
    color: #6b9b37;
    border-bottom: 2px solid #4a7c43;
}

.table td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-size: 16px;
}

.table tr:hover td {
    background: rgba(45, 90, 39, 0.1);
}

.table .highlight {
    color: #6b9b37;
    font-weight: 600;
}
```

### Navigation Footer

```css
.footer-nav {
    background: rgba(10, 10, 10, 0.95);
    border-top: 1px solid rgba(45, 90, 39, 0.3);
}

.footer-nav a {
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 20px;
}

.footer-nav a:hover {
    color: #fff;
    background: rgba(45, 90, 39, 0.3);
}
```

### Service Timeline Item

```css
.service-item {
    background: rgba(45, 90, 39, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(74, 124, 67, 0.2);
    padding: 20px 15px;
}

.service-item.active {
    background: rgba(45, 90, 39, 0.3);
    border-color: #4a7c43;
}
```

### Formula Display

```css
.formula .element {
    background: rgba(45, 90, 39, 0.2);
    padding: 15px 25px;
    border-radius: 12px;
    border: 1px solid rgba(74, 124, 67, 0.3);
}

.formula .operator {
    color: #4a7c43;
    font-weight: 300;
}

.formula .result {
    background: linear-gradient(135deg, #2d5a27, #4a7c43);
    padding: 15px 25px;
    border-radius: 12px;
    font-weight: 700;
}
```

---

## GRILLES

```css
/* 2 colonnes */
.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    max-width: 1200px;
}

/* 3 colonnes */
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    max-width: 1200px;
}

/* 4 colonnes */
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 25px;
    max-width: 1200px;
}

/* 5 colonnes */
.grid-5 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    max-width: 1200px;
}
```

### Responsive

```css
@media (max-width: 1024px) {
    .grid-2, .grid-3, .grid-4, .grid-5 {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 768px) {
    .grid-2, .grid-3, .grid-4, .grid-5 {
        grid-template-columns: 1fr;
    }
}
```

---

## SLIDES

```css
.slide {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 80px;
    position: relative;
    border-bottom: 1px solid rgba(45, 90, 39, 0.3);
}

/* Overlay gradient */
.slide::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, rgba(45, 90, 39, 0.15) 0%, transparent 70%);
    pointer-events: none;
}

/* Slide number */
.slide-number {
    position: absolute;
    top: 30px;
    right: 40px;
    font-size: 14px;
    color: rgba(255,255,255,0.3);
    font-weight: 300;
}
```

---

## ICONOGRAPHIE

### Emojis utilises

| Contexte | Emoji |
|----------|-------|
| Haies/Taillage | 🌿 |
| Acquisitions/Business | 🏢 |
| Hiver/Neige | ❄️ |
| Vitres | 🪟 |
| Gouttieres/Automne | 🍂 |
| Arbres/Landscaping | 🌳 |
| Partenariat | 🤝 |
| Cible/Objectif | 🎯 |

### Arrow character

```
→ (U+2192) pour les listes
```

---

## TRANSITIONS & ANIMATIONS

```css
/* Cards, boutons */
transition: all 0.3s ease;

/* Hover effect */
transform: translateY(-5px);

/* Smooth scroll */
behavior: 'smooth'
```

---

## RESUME RAPIDE

```
VERTS:
- Primary:  #4a7c43
- Light:    #6b9b37
- Dark:     #2d5a27

BACKGROUND:
- Main:     #0a0a0a
- Card:     rgba(45, 90, 39, 0.15)
- Overlay:  rgba(45, 90, 39, 0.3)

FONT:
- Family:   Segoe UI, system-ui
- H1:       72px / 800 / -2px tracking
- Body:     15-16px / 400

RADIUS:
- Cards:    16px
- Buttons:  20px
- Small:    12px

SPACING:
- Slide padding:     60px 80px
- Card padding:      30px
- Grid gaps:         20-40px
```

---

## CSS COMPLET (Copier-Coller)

```css
:root {
    --color-primary: #4a7c43;
    --color-primary-light: #6b9b37;
    --color-primary-dark: #2d5a27;
    --color-bg: #0a0a0a;
    --color-card: rgba(45, 90, 39, 0.15);
    --color-card-hover: rgba(45, 90, 39, 0.25);
    --color-border: rgba(74, 124, 67, 0.3);
    --color-text: #ffffff;
    --color-text-muted: rgba(255, 255, 255, 0.7);
    --color-text-subtle: rgba(255, 255, 255, 0.5);
    --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    --radius-lg: 16px;
    --radius-md: 12px;
    --radius-sm: 8px;
    --radius-pill: 20px;
}
```
