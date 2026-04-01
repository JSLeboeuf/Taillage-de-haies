<?php
/**
 * Plugin Name: Haie Elite - Tracking Scripts
 * Description: GA4 + GTM + Clarity + Meta Pixel pour taillagehaielite.com
 * Version: 1.0
 * Author: Taillage Haielite
 *
 * INSTALLATION:
 * 1. Remplacer les IDs ci-dessous par vos IDs reels
 * 2. Uploader ce fichier dans /wp-content/mu-plugins/haielite-tracking.php
 * 3. Le plugin est actif immediatement (pas besoin d'activer)
 */

// ============================================================
// REMPLACER CES VALEURS PAR VOS IDS REELS
// ============================================================
define('HAIELITE_GA4_ID', 'G-XXXXXXXXXX');          // Google Analytics 4
define('HAIELITE_GTM_ID', 'GTM-XXXXXXX');            // Google Tag Manager
define('HAIELITE_CLARITY_ID', 'w4plzkeqkr');          // Microsoft Clarity
define('HAIELITE_META_PIXEL_ID', '123456789012345');  // Meta/Facebook Pixel
// ============================================================

// Ne pas tracker les admins/editeurs (fausse les donnees)
function haielite_should_track() {
    if ( is_user_logged_in() && current_user_can( 'edit_posts' ) ) {
        return false;
    }
    return true;
}

// === SCRIPTS DANS <HEAD> ===
add_action( 'wp_head', function () {
    if ( ! haielite_should_track() ) {
        return;
    }

    // --- Google Tag Manager ---
    if ( HAIELITE_GTM_ID !== 'GTM-XXXXXXX' ) : ?>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','<?php echo esc_js( HAIELITE_GTM_ID ); ?>');</script>
    <?php endif;

    // --- Google Analytics 4 ---
    if ( HAIELITE_GA4_ID !== 'G-XXXXXXXXXX' ) : ?>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( HAIELITE_GA4_ID ); ?>"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','<?php echo esc_js( HAIELITE_GA4_ID ); ?>',{'send_page_view':true});

// Track phone clicks as conversions
document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="tel:"]');
    if(a){gtag('event','phone_click',{'event_category':'contact','event_label':a.href});}
});
// Track email clicks
document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="mailto:"]');
    if(a){gtag('event','email_click',{'event_category':'contact','event_label':a.href});}
});
// Track Formidable Forms submissions
document.addEventListener('frmFormComplete',function(e){
    gtag('event','form_submission',{'event_category':'conversion','event_label':'contact_form'});
});
</script>
    <?php endif;

    // --- Microsoft Clarity ---
    if ( HAIELITE_CLARITY_ID !== 'abcdef1234' ) : ?>
<script type="text/javascript">
(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","<?php echo esc_js( HAIELITE_CLARITY_ID ); ?>");
</script>
    <?php endif;

    // --- Meta Pixel (Facebook) ---
    if ( HAIELITE_META_PIXEL_ID !== '123456789012345' ) : ?>
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','<?php echo esc_js( HAIELITE_META_PIXEL_ID ); ?>');
fbq('track','PageView');
document.addEventListener('frmFormComplete',function(){fbq('track','Lead');});
document.addEventListener('click',function(e){
    if(e.target.closest('a[href^="tel:"]')){fbq('track','Contact');}
});
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=<?php echo esc_attr( HAIELITE_META_PIXEL_ID ); ?>&ev=PageView&noscript=1"/></noscript>
    <?php endif;

}, 1 );

// === GTM NOSCRIPT (juste apres <body>) ===
add_action( 'wp_body_open', function () {
    if ( ! haielite_should_track() ) {
        return;
    }
    if ( HAIELITE_GTM_ID !== 'GTM-XXXXXXX' ) : ?>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo esc_attr( HAIELITE_GTM_ID ); ?>"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <?php endif;
} );
