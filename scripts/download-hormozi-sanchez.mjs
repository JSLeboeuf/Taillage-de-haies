/**
 * 📚 Download Books - Alex Hormozi & Codie Sanchez
 * 
 * Télécharge les livres d'Alex Hormozi et Codie Sanchez
 * depuis Anna's Archive et Library Genesis
 * Usage: node scripts/download-hormozi-sanchez.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);
const BOOKS_DIR = path.join(ROOT_DIR, 'books');

// Livres à télécharger
const BOOKS_TO_DOWNLOAD = [
  // Alex Hormozi
  { title: '$100M Offers', author: 'Alex Hormozi', priority: 1 },
  { title: '$100M Leads', author: 'Alex Hormozi', priority: 1 },
  { title: '$100M Leads How To Get', author: 'Alex Hormozi', priority: 1 },
  { title: 'Gym Launch Secrets', author: 'Alex Hormozi', priority: 2 },
  
  // Codie Sanchez
  { title: 'Main Street Millionaire', author: 'Codie Sanchez', priority: 1 },
  { title: 'Main Street Millionaire How', author: 'Codie Sanchez', priority: 1 },
];

// Anna's Archive base URL
const ANNAS_ARCHIVE = 'https://annas-archive.org';

// LibGen mirrors
const LIBGEN_MIRRORS = [
  'https://libgen.is',
  'https://libgen.rs',
  'https://libgen.st'
];

const LIBGEN_DOWNLOAD_MIRRORS = [
  'https://library.lol',
  'http://library.lol',
  'https://libgen.lc'
];

// Headers pour simuler un navigateur
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive',
};

// ═══════════════════════════════════════════════════════════
// RECHERCHE ANNA'S ARCHIVE
// ═══════════════════════════════════════════════════════════

async function searchAnnasArchive(query) {
  try {
    const searchUrl = `${ANNAS_ARCHIVE}/search?q=${encodeURIComponent(query)}&ext=pdf&ext=epub`;
    console.log(`   🔗 ${searchUrl}`);
    
    const response = await fetch(searchUrl, { headers: HEADERS });
    
    if (!response.ok) {
      console.log(`   ⚠️ HTTP ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const results = [];
    
    // Parser les résultats - chercher les liens MD5
    const resultBlockPattern = /href="(\/md5\/[a-f0-9]+)"[\s\S]*?<div[^>]*>([^<]{10,})<\/div>/gi;
    const blockMatches = [...html.matchAll(resultBlockPattern)];
    
    for (const match of blockMatches.slice(0, 5)) {
      results.push({
        url: ANNAS_ARCHIVE + match[1],
        md5: match[1].replace('/md5/', ''),
        title: match[2].trim().slice(0, 100)
      });
    }
    
    // Alternative parsing
    if (results.length === 0) {
      const md5Pattern = /<a[^>]*href="(\/md5\/[a-f0-9]+)"[^>]*>/gi;
      const md5Matches = [...html.matchAll(md5Pattern)];
      const titlePattern = /<div[^>]*class="[^"]*truncate[^"]*"[^>]*>([^<]+)<\/div>/gi;
      const titles = [...html.matchAll(titlePattern)].map(m => m[1].trim());
      
      for (let i = 0; i < Math.min(md5Matches.length, 5); i++) {
        const md5Url = md5Matches[i][1];
        results.push({
          url: ANNAS_ARCHIVE + md5Url,
          md5: md5Url.replace('/md5/', ''),
          title: titles[i] || query
        });
      }
    }
    
    return results;
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
    return [];
  }
}

async function getBookDetails(md5Url) {
  try {
    const response = await fetch(md5Url, { headers: HEADERS });
    if (!response.ok) return null;
    
    const html = await response.text();
    const details = {
      title: '',
      downloadLinks: []
    };
    
    // Extraire le titre
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) details.title = titleMatch[1].trim();
    
    // Extraire les liens de téléchargement
    // Liens directs (slow download)
    const slowDownloadPattern = /href="(https?:\/\/[^"]*\/slow_download[^"]*)"/gi;
    const slowMatches = [...html.matchAll(slowDownloadPattern)];
    for (const match of slowMatches) {
      details.downloadLinks.push({
        type: 'slow',
        url: match[1]
      });
    }
    
    // Liens library.lol / libgen
    const libgenPattern = /href="(https?:\/\/library\.lol[^"]*)"/gi;
    const libgenMatches = [...html.matchAll(libgenPattern)];
    for (const match of libgenMatches) {
      details.downloadLinks.push({
        type: 'libgen',
        url: match[1]
      });
    }
    
    // Liens directs vers fichiers
    const directPattern = /href="(https?:\/\/[^"]*\.(pdf|epub|mobi|azw3)[^"]*)"/gi;
    const directMatches = [...html.matchAll(directPattern)];
    for (const match of directMatches) {
      if (!details.downloadLinks.find(l => l.url === match[1])) {
        details.downloadLinks.push({
          type: 'direct',
          url: match[1],
          format: match[2]
        });
      }
    }
    
    return details;
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// RECHERCHE LIBGEN
// ═══════════════════════════════════════════════════════════

async function searchLibGen(query) {
  console.log(`🔍 Searching LibGen for: "${query}"`);
  
  for (const mirror of LIBGEN_MIRRORS) {
    try {
      const searchUrl = `${mirror}/search.php?req=${encodeURIComponent(query)}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`;
      
      const response = await fetch(searchUrl, {
        headers: HEADERS
      });
      
      if (!response.ok) continue;
      
      const html = await response.text();
      const results = [];
      
      // Parse table rows - extract MD5 hashes and book info
      const rowPattern = /<tr[^>]*>[\s\S]*?<td>(\d+)<\/td>[\s\S]*?<a[^>]*href="[^"]*md5=([A-Fa-f0-9]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<\/tr>/gi;
      
      let match;
      while ((match = rowPattern.exec(html)) !== null) {
        results.push({
          id: match[1],
          md5: match[2],
          title: match[3].trim(),
          mirror
        });
      }
      
      // Alternative parsing
      if (results.length === 0) {
        const md5Pattern = /md5=([A-Fa-f0-9]{32})/gi;
        const titlePattern = /<a[^>]*href="[^"]*md5=[^"]*"[^>]*>([^<]+)<\/a>/gi;
        
        const md5s = [...html.matchAll(md5Pattern)].map(m => m[1]);
        const titles = [...html.matchAll(titlePattern)].map(m => m[1].trim());
        
        for (let i = 0; i < Math.min(md5s.length, titles.length, 10); i++) {
          results.push({
            md5: md5s[i],
            title: titles[i],
            mirror
          });
        }
      }
      
      if (results.length > 0) {
        console.log(`   ✅ Found ${results.length} results on ${mirror}`);
        return results;
      }
    } catch (e) {
      console.log(`   ⚠️ ${mirror} failed: ${e.message}`);
      continue;
    }
  }
  
  return [];
}

async function getDownloadUrl(md5) {
  // Essayer library.lol en premier
  const libraryLolUrl = `https://library.lol/main/${md5}`;
  
  try {
    const response = await fetch(libraryLolUrl, { headers: HEADERS });
    if (response.ok) {
      const html = await response.text();
      
      // Chercher le lien GET
      const getMatch = html.match(/<a[^>]*href="([^"]+)"[^>]*>\s*GET\s*<\/a>/i);
      if (getMatch) {
        let url = getMatch[1];
        if (url.startsWith('//')) url = 'https:' + url;
        if (url.startsWith('/')) url = 'https://library.lol' + url;
        return { url, source: 'library.lol' };
      }
      
      // Chercher lien direct vers fichier
      const directMatch = html.match(/href="(https?:\/\/[^"]*\.(pdf|epub|mobi)[^"]*)"/i);
      if (directMatch) {
        return { url: directMatch[1], source: 'library.lol-direct' };
      }
    }
  } catch (e) {
    console.log(`   ⚠️ library.lol failed: ${e.message}`);
  }
  
  // Essayer Anna's Archive slow download
  try {
    const annasUrl = `https://annas-archive.org/md5/${md5}`;
    const response = await fetch(annasUrl, { headers: HEADERS });
    
    if (response.ok) {
      const html = await response.text();
      
      // Chercher slow_download link
      const slowMatch = html.match(/href="(\/slow_download\/[^"]+)"/i);
      if (slowMatch) {
        return { url: 'https://annas-archive.org' + slowMatch[1], source: 'annas-slow' };
      }
      
      // Chercher lien externe
      const externalMatch = html.match(/href="(https:\/\/download\.library\.lol[^"]+)"/i);
      if (externalMatch) {
        return { url: externalMatch[1], source: 'library.lol-external' };
      }
    }
  } catch (e) {
    console.log(`   ⚠️ annas-archive failed: ${e.message}`);
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════
// TÉLÉCHARGEMENT
// ═══════════════════════════════════════════════════════════

async function downloadFile(url, filename, outputDir) {
  try {
    console.log(`   📥 Downloading from: ${url.slice(0, 60)}...`);
    
    const response = await fetch(url, {
      headers: {
        ...HEADERS,
        'Referer': 'https://library.lol/'
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    // Déterminer l'extension
    let ext = '.pdf';
    if (contentType.includes('epub') || url.includes('.epub') || contentDisposition.includes('.epub')) {
      ext = '.epub';
    } else if (contentType.includes('mobi') || url.includes('.mobi')) {
      ext = '.mobi';
    }
    
    const safeFilename = filename.replace(/[^a-zA-Z0-9 \-_]/g, '').slice(0, 80) + ext;
    const outputPath = path.join(outputDir, safeFilename);
    
    // Vérifier si déjà téléchargé
    if (existsSync(outputPath)) {
      console.log(`   ⏭️  Already exists: ${safeFilename}`);
      return outputPath;
    }
    
    const buffer = await response.arrayBuffer();
    
    // Vérifier que c'est un vrai fichier (pas une page HTML)
    const firstBytes = new Uint8Array(buffer.slice(0, 10));
    const firstChars = String.fromCharCode(...firstBytes);
    
    if (firstChars.includes('<!DOCTYPE') || firstChars.includes('<html')) {
      console.log(`   ❌ Received HTML instead of file`);
      return null;
    }
    
    writeFileSync(outputPath, Buffer.from(buffer));
    const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Saved: ${safeFilename} (${sizeMB} MB)`);
    
    return outputPath;
  } catch (e) {
    console.log(`   ❌ Download error: ${e.message}`);
    return null;
  }
}

async function downloadBook(book, source = 'annas') {
  console.log(`\n📖 ${book.title}`);
  console.log(`   Author: ${book.author || 'N/A'}`);
  
  let downloadInfo = null;
  
  if (source === 'annas') {
    // Rechercher sur Anna's Archive
    const searchQuery = book.author 
      ? `${book.title} ${book.author}` 
      : book.title;
    
    const results = await searchAnnasArchive(searchQuery);
    
    if (results.length === 0) {
      console.log(`   ❌ No results found on Anna's Archive`);
      // Essayer LibGen
      return await downloadBook(book, 'libgen');
    }
    
    console.log(`   ✅ Found ${results.length} results on Anna's Archive`);
    const bestMatch = results[0];
    console.log(`   📖 Best match: ${bestMatch.title}`);
    
    // Récupérer les détails et liens de téléchargement
    const details = await getBookDetails(bestMatch.url);
    
    if (details && details.downloadLinks.length > 0) {
      console.log(`   📥 ${details.downloadLinks.length} download links found`);
      
      // Essayer chaque lien jusqu'à ce qu'un fonctionne
      for (const link of details.downloadLinks.slice(0, 3)) {
        const result = await downloadFile(link.url, book.title, BOOKS_DIR);
        if (result) {
          return { ...book, status: 'downloaded', path: result, source: 'annas' };
        }
        await delay(2000);
      }
    }
    
    // Si les liens directs ne fonctionnent pas, essayer avec le MD5
    const md5 = bestMatch.md5;
    downloadInfo = await getDownloadUrl(md5);
    
  } else {
    // Rechercher sur LibGen
    const searchQuery = book.author 
      ? `${book.title} ${book.author}` 
      : book.title;
    
    const results = await searchLibGen(searchQuery);
    
    if (results.length === 0) {
      console.log(`   ❌ No results found on LibGen`);
      return { ...book, status: 'not_found' };
    }
    
    console.log(`   ✅ Found ${results.length} results on LibGen`);
    const bestMatch = results[0];
    console.log(`   📖 Best match: ${bestMatch.title}`);
    
    downloadInfo = await getDownloadUrl(bestMatch.md5);
  }
  
  if (!downloadInfo) {
    console.log(`   ❌ No download URL found`);
    return { ...book, status: 'no_url' };
  }
  
  console.log(`   🔗 Source: ${downloadInfo.source}`);
  
  const result = await downloadFile(downloadInfo.url, book.title, BOOKS_DIR);
  
  if (result) {
    return { ...book, status: 'downloaded', path: result, source: downloadInfo.source };
  } else {
    return { ...book, status: 'failed', url: downloadInfo.url };
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadAllBooks() {
  console.log('\n' + '═'.repeat(70));
  console.log('📚 DOWNLOAD BOOKS - ALEX HORMOZI & CODIE SANCHEZ');
  console.log('═'.repeat(70));
  console.log(`📁 Output: ${BOOKS_DIR}`);
  console.log(`📚 Books: ${BOOKS_TO_DOWNLOAD.length}`);
  console.log('═'.repeat(70));
  
  // Créer le dossier
  if (!existsSync(BOOKS_DIR)) {
    mkdirSync(BOOKS_DIR, { recursive: true });
  }
  
  const results = {
    downloaded: [],
    failed: [],
    notFound: [],
    noUrl: []
  };
  
  // Trier par priorité
  const sortedBooks = [...BOOKS_TO_DOWNLOAD].sort((a, b) => a.priority - b.priority);
  
  for (let i = 0; i < sortedBooks.length; i++) {
    const book = sortedBooks[i];
    console.log(`\n[${i + 1}/${sortedBooks.length}]`);
    
    // Essayer Anna's Archive en premier
    const result = await downloadBook(book, 'annas');
    
    if (result.status === 'downloaded') {
      results.downloaded.push(result);
    } else if (result.status === 'not_found') {
      results.notFound.push(result);
    } else if (result.status === 'no_url') {
      results.noUrl.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Rate limiting - très important
    const delayMs = 3000 + Math.random() * 4000; // 3-7 secondes
    console.log(`   ⏳ Waiting ${(delayMs/1000).toFixed(1)}s...`);
    await delay(delayMs);
  }
  
  // Résumé
  console.log('\n' + '═'.repeat(70));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('═'.repeat(70));
  console.log(`✅ Downloaded: ${results.downloaded.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Not Found: ${results.notFound.length}`);
  console.log(`⚠️  No URL: ${results.noUrl.length}`);
  console.log(`📁 Location: ${BOOKS_DIR}`);
  
  if (results.downloaded.length > 0) {
    console.log('\n✅ Successfully downloaded:');
    results.downloaded.forEach(b => console.log(`   - ${b.title} (${b.author || 'N/A'})`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed downloads (try manually):');
    results.failed.forEach(b => {
      console.log(`   - ${b.title}`);
      if (b.url) console.log(`     ${b.url}`);
    });
  }
  
  if (results.notFound.length > 0) {
    console.log('\n⚠️  Not found:');
    results.notFound.forEach(b => {
      console.log(`   - ${b.title} (${b.author || 'N/A'})`);
    });
  }
  
  if (results.noUrl.length > 0) {
    console.log('\n⚠️  No download URL found:');
    results.noUrl.forEach(b => {
      console.log(`   - ${b.title} (${b.author || 'N/A'})`);
    });
  }
  
  console.log('═'.repeat(70) + '\n');
  
  // Sauvegarder le rapport
  const reportPath = path.join(BOOKS_DIR, `download-report-${new Date().toISOString().slice(0,10)}.json`);
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Report saved: ${reportPath}\n`);
  
  return results;
}

// Lancer
downloadAllBooks().catch(console.error);
