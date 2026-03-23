import Anthropic from "@anthropic-ai/sdk";

interface Env {
  ANTHROPIC_API_KEY: string;
}

const SYSTEM_PROMPT = `Tu es l'assistant de bienvenue de l'entreprise Taillage Haie Lite, une compagnie d'entretien de haies de cèdres basée au Québec, Canada.

Tu accueilles les travailleurs temporaires guatémaltèques (programme TET) et tu réponds à toutes leurs questions.

LANGUE : Détecte automatiquement si le travailleur écrit en français ou en espagnol et réponds TOUJOURS dans la même langue. Si le message est ambigu, utilise l'espagnol par défaut.

INFORMATIONS SUR L'ENTREPRISE :
- Nom : Taillage Haie Lite (aussi appelée "Haie Lite" ou "Haielite")
- Activité : Taillage et entretien de haies de cèdres résidentielles et commerciales
- Saison : Printemps/Été/Automne (avril à novembre environ)
- Province : Québec, Canada
- Responsables :
  - Henri Leboeuf — Superviseur terrain, contact principal pour les problèmes quotidiens
  - Jean-Samuel Leboeuf — Directeur, contact pour les urgences importantes
- Agence de recrutement : Equinox World (programme TET)

TRAVAILLEURS ACTUELS SAISON 2026 :
- Juan Luis — Permis de travail EW 1907, possède un permis de conduire, parle espagnol
- Julio Cesar — Permis de travail EW G33, 11 ans d'expérience en taillage, parle espagnol

VOCABULAIRE TECHNIQUE (Cèdres / Haies) :
- Haie de cèdre = seto de cedro / cerca viva de cedro
- Taille / taillage = poda / recorte
- Cisailles = tijeras de podar
- Tronçonneuse = motosierra
- Escabeau / échelle = escalera
- Branche = rama / cime = cima / Côté = lado / Base = base
- Ligne droite = línea recta / Souffleur = soplador

SUJETS COUVERTS :

1. ACCUEIL ET ARRIVÉE
   - Bienvenue au Québec, bienvenue dans l'équipe
   - Documents à avoir sur soi : permis de travail, pièce d'identité
   - Logement fourni par l'employeur — contacter Henri pour les détails

2. TRAVAIL ET HORAIRES
   - Heures de travail : généralement 7h00–17h00, lundi à vendredi (peut varier selon météo)
   - Travail en équipe de 2 à 3 personnes par véhicule
   - Port d'équipement de protection obligatoire (lunettes, gants, bottes)

3. PAYE ET CONDITIONS
   - Paye à la quinzaine (aux 2 semaines)
   - Taux horaire selon le contrat signé avec Equinox World
   - Déductions légales : impôt fédéral, provincial, RRQ, AE, RQAP
   - Pour questions de paye : contacter Jean-Samuel

4. SÉCURITÉ
   - Toujours porter les EPI (équipements de protection individuelle)
   - Ne jamais travailler seul près des fils électriques
   - En cas d'accident : appeler le 911 immédiatement, puis avertir Henri
   - Premiers soins : trousse dans chaque véhicule

5. LOGEMENT
   - Hébergement fourni par l'employeur, coût déduit du salaire selon le contrat
   - Propreté et respect des règles de la maison obligatoires

6. URGENCES ET CONTACTS
   - Urgences (police, ambulance, pompiers) : 911
   - Henri Leboeuf (superviseur) : contact quotidien
   - Jean-Samuel Leboeuf (direction) : urgences importantes seulement
   - CSST (accidents de travail) : 1-844-838-0808

7. VIE AU QUÉBEC
   - Météo : préparation au froid le matin, chaleur l'après-midi
   - Langue locale : français, mais tu peux communiquer en espagnol avec l'assistant

8. RÈGLES DE L'ENTREPRISE
   - Ponctualité obligatoire / Respect des clients et de leurs propriétés
   - Alcool/drogues : strictement interdits pendant les heures de travail
   - Signaler tout problème immédiatement au superviseur

TON STYLE : Chaleureux, accueillant, patient, simple et clair. Si tu ne connais pas la réponse exacte, dirige vers Henri ou Jean-Samuel.

IMPORTANT : Si urgence médicale ou sécurité immédiate → appeler le 911 EN PREMIER.`;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>Haie Lite — Assistant / Asistente</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green: #2d6a4f; --green-light: #40916c; --green-pale: #d8f3dc;
      --gray-bg: #f4f4f4; --text-dark: #1b1b1b; --text-muted: #666; --radius: 18px;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--gray-bg); height: 100dvh; display: flex; flex-direction: column; max-width: 640px; margin: 0 auto; }
    header { background: var(--green); color: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.15); flex-shrink: 0; }
    .logo { width: 42px; height: 42px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .header-text h1 { font-size: 16px; font-weight: 700; }
    .header-text p { font-size: 12px; opacity: .85; }
    .status-dot { width: 8px; height: 8px; background: #74c69d; border-radius: 50%; display: inline-block; margin-right: 4px; }
    #messages { flex: 1; overflow-y: auto; padding: 16px 12px; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
    .welcome-card { background: white; border-radius: var(--radius); padding: 20px; border-left: 4px solid var(--green-light); }
    .welcome-card h2 { font-size: 15px; color: var(--green); margin-bottom: 10px; }
    .welcome-card p { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 6px; }
    .quick-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .quick-btn { background: white; border: 1.5px solid var(--green-light); color: var(--green); border-radius: 20px; padding: 7px 14px; font-size: 13px; cursor: pointer; transition: background .15s; white-space: nowrap; }
    .quick-btn:hover, .quick-btn:active { background: var(--green-pale); }
    .message { display: flex; align-items: flex-end; gap: 8px; max-width: 85%; }
    .message.user { align-self: flex-end; flex-direction: row-reverse; }
    .message.bot { align-self: flex-start; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; background: var(--green-pale); }
    .bubble { padding: 10px 14px; border-radius: var(--radius); font-size: 14px; line-height: 1.5; word-break: break-word; }
    .message.user .bubble { background: var(--green); color: white; border-bottom-right-radius: 4px; }
    .message.bot .bubble { background: white; color: var(--text-dark); border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .message.bot .bubble p { margin-bottom: 6px; }
    .message.bot .bubble p:last-child { margin-bottom: 0; }
    .message.bot .bubble ul { padding-left: 18px; margin: 4px 0; }
    .message.bot .bubble strong { color: var(--green); }
    .typing { display: flex; align-items: center; gap: 4px; padding: 12px 14px; }
    .typing span { width: 7px; height: 7px; background: var(--green-light); border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing span:nth-child(2) { animation-delay: .2s; }
    .typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes bounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-5px) } }
    .input-area { background: white; border-top: 1px solid #e5e5e5; padding: 10px 12px; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }
    #input { flex: 1; border: 1.5px solid #ddd; border-radius: 22px; padding: 10px 16px; font-size: 15px; outline: none; resize: none; max-height: 120px; line-height: 1.4; font-family: inherit; transition: border-color .15s; }
    #input:focus { border-color: var(--green-light); }
    #send-btn { width: 42px; height: 42px; background: var(--green); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s; }
    #send-btn:hover { background: var(--green-light); }
    #send-btn:disabled { background: #ccc; cursor: default; }
    #send-btn svg { width: 18px; height: 18px; fill: white; }
  </style>
</head>
<body>
<header>
  <div class="logo">🌿</div>
  <div class="header-text">
    <h1>Haie Lite — Assistant</h1>
    <p><span class="status-dot"></span>En ligne / En línea</p>
  </div>
</header>
<div id="messages">
  <div class="welcome-card">
    <h2>🇨🇦 Bienvenue / Bienvenido</h2>
    <p><strong>FR:</strong> Je suis ton assistant Haie Lite. Pose-moi toutes tes questions sur le travail, la paye, la sécurité ou la vie au Québec.</p>
    <p><strong>ES:</strong> Soy tu asistente de Haie Lite. Hazme cualquier pregunta sobre el trabajo, el pago, la seguridad o la vida en Quebec.</p>
  </div>
  <div class="quick-actions">
    <button class="quick-btn" onclick="quickSend('¿Cuáles son mis horarios de trabajo?')">⏰ Horarios</button>
    <button class="quick-btn" onclick="quickSend('¿Cuándo me pagan?')">💵 Pago</button>
    <button class="quick-btn" onclick="quickSend('¿Qué hago en caso de accidente?')">🚑 Urgencias</button>
    <button class="quick-btn" onclick="quickSend('Quels équipements dois-je porter?')">🥽 Sécurité</button>
    <button class="quick-btn" onclick="quickSend('¿Quién es mi supervisor?')">👷 Contactos</button>
    <button class="quick-btn" onclick="quickSend('Comment fonctionne le logement?')">🏠 Logement</button>
  </div>
</div>
<div class="input-area">
  <textarea id="input" placeholder="Écris un message / Escribe un mensaje..." rows="1" onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
  <button id="send-btn" onclick="sendMessage()">
    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
  </button>
</div>
<script>
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');
let history = [];
let streaming = false;

function autoResize(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }
function handleKey(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }
function quickSend(t) { inputEl.value=t; sendMessage(); }
function scrollBottom() { messagesEl.scrollTop=messagesEl.scrollHeight; }

function addMsg(role, content) {
  const wrap=document.createElement('div'); wrap.className='message '+role;
  const av=document.createElement('div'); av.className='avatar'; av.textContent=role==='user'?'👤':'🌿';
  const bub=document.createElement('div'); bub.className='bubble';
  if(role==='bot') bub.innerHTML=fmt(content); else bub.textContent=content;
  wrap.appendChild(av); wrap.appendChild(bub);
  messagesEl.appendChild(wrap); scrollBottom(); return bub;
}

function addTyping() {
  const wrap=document.createElement('div'); wrap.className='message bot'; wrap.id='typing';
  const av=document.createElement('div'); av.className='avatar'; av.textContent='🌿';
  const bub=document.createElement('div'); bub.className='bubble typing';
  bub.innerHTML='<span></span><span></span><span></span>';
  wrap.appendChild(av); wrap.appendChild(bub); messagesEl.appendChild(wrap); scrollBottom();
}

function removeTyping() { const el=document.getElementById('typing'); if(el) el.remove(); }

function fmt(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/,'<ul>$1</ul>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>')
    .replace(/^(.+)$/,'<p>$1</p>');
}

async function sendMessage() {
  const text=inputEl.value.trim();
  if(!text||streaming) return;
  addMsg('user',text);
  history.push({role:'user',content:text});
  inputEl.value=''; inputEl.style.height='auto';
  streaming=true; sendBtn.disabled=true;
  addTyping();
  try {
    const res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history})});
    removeTyping();
    if(!res.ok) throw new Error('HTTP '+res.status);
    const bub=addMsg('bot','');
    let full='';
    const reader=res.body.getReader(); const dec=new TextDecoder();
    while(true){
      const{done,value}=await reader.read(); if(done) break;
      for(const line of dec.decode(value).split('\n')){
        if(!line.startsWith('data: ')) continue;
        const d=line.slice(6); if(d==='[DONE]') break;
        try{ const p=JSON.parse(d); if(p.text){full+=p.text; bub.innerHTML=fmt(full); scrollBottom();} }catch{}
      }
    }
    history.push({role:'assistant',content:full});
  } catch(err) {
    removeTyping(); addMsg('bot','⚠️ Erreur / Error: '+err.message);
  }
  streaming=false; sendBtn.disabled=false; inputEl.focus();
}
</script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve HTML
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // Handle chat SSE stream
    if (request.method === "POST" && url.pathname === "/chat") {
      let body: { messages: Anthropic.MessageParam[] };
      try {
        body = await request.json();
      } catch {
        return new Response("Bad request", { status: 400 });
      }

      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Run streaming in background
      (async () => {
        try {
          const stream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: body.messages,
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: event.delta.text });
              await writer.write(encoder.encode(`data: ${data}\n\n`));
            }
          }

          await writer.write(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
