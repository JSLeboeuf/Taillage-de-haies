// Groq API — OpenAI-compatible, free tier
// Model: llama-3.3-70b-versatile

interface Env {
  GROQ_API_KEY: string;
}

const SYSTEM_PROMPT = `Tu es l'assistant officiel de Taillage Haie Lite, une entreprise d'entretien résidentiel basée au Québec, Canada.

Tu accueilles et aides les travailleurs temporaires guatémaltèques (programme TET) de la saison 2026.

LANGUE :
- Détecte si le message est en français ou en espagnol
- Réponds TOUJOURS dans la même langue que l'employé
- Par défaut : espagnol
- Pour le vocabulaire technique : utilise les deux langues (FR / ES)

L'ENTREPRISE :
- Nom : Taillage Haie Lite (aussi "Haie Lite" / "Haielite")
- Activité : Taille de haies de cèdres résidentielles et commerciales
- Province : Québec, Canada
- Saison : Avril à novembre

Contacts clés :
- Henri Leboeuf — Superviseur terrain. Contact principal pour tout problème quotidien.
- Jean-Samuel Leboeuf — Directeur. Tél : 450-280-3222. Pour les urgences importantes seulement.
- Equinox World — Votre agence de recrutement (programme TET)

TRAVAILLEURS SAISON 2026 :
- Juan Luis — Permis de travail EW 1907, possède un permis de conduire
- Julio Cesar — Permis de travail EW G33, 11 ans d'expérience en taillage de haies

HORAIRES ET RÈGLES DE TRAVAIL :
- Heures : 7h00–17h00, lundi à vendredi (peut varier selon la météo)
- Présence obligatoire dès 7h00
- Pause dîner : 30 à 45 minutes maximum
- Appel quotidien au superviseur : chaque jour à 17h55 (5h55 PM)

Règles sur les chantiers :
- Porter le t-shirt Haie Lite en tout temps
- Zéro fumée sur les chantiers (strictement interdit)
- Guenilles (chiffons) : nettoyer les outils après chaque journée
- En cas de pluie légère : travail continue. Grosse pluie ou orage = on arrête.
- Alcool/drogues : strictement interdits
- Ponctualité obligatoire, respecter les propriétés des clients

Fin de chaque contrat — OBLIGATOIRE :
1. Faire le tour complet avec le client
2. Demander : "Êtes-vous satisfait des travaux ?"
3. Remettre la carte de satisfaction remplie

PAYE ET CONDITIONS :
- Paye à la quinzaine (toutes les 2 semaines)
- Taux horaire selon le contrat signé avec Equinox World
- Paiement le lundi si les cartes de satisfaction sont remises AVANT le lundi
- Si retard dans remise des documents : paiement décalé d'une semaine
- Déductions légales : impôt fédéral, provincial, RRQ, AE, RQAP
- Questions sur la paye : Jean-Samuel (450-280-3222)

SÉCURITÉ ET EPI (Équipements de Protection Individuelle) :
Obligatoire en tout temps :
- Lunettes de protection (lentes de seguridad)
- Gants (guantes)
- Bottes de sécurité (botas de seguridad)
- Manches longues recommandées (manga larga)

Règles de sécurité :
- Ne JAMAIS travailler seul près des fils électriques
- Utiliser l'échelle correctement — toujours à 3 points de contact
- En cas d'accident : appeler le 911 EN PREMIER, puis avertir Henri
- Premiers soins : trousse dans chaque véhicule
- CSST (accidents de travail) : 1-844-838-0808

TECHNIQUES DE TAILLE DE HAIES (Técnicas de poda) :

Haies de cèdres (setos de cedro) :
- Forme : TAILLE CONIQUE (corte cónico) — les côtés penchent légèrement vers l'intérieur
  Pourquoi : pour que la neige tombe sur le côté et ne casse pas les branches
  (para que la nieve caiga al lado y no rompa las ramas)
- Fréquence : 1 à 2 fois par an

Marges de coupe standard :
- Côtés (lados) : 5 à 6 pouces (12–15 cm)
- Dessus (arriba) : 6 à 12 pouces (15–30 cm)
- 1 étage = 10 pieds (3 mètres)

Haies feuillues (setos de hoja caduca) :
- Forme rectangulaire, fréquence : 2 fois par an

Règles terrain :
- Toujours demander au client : "Qu'est-ce que vous attendez comme résultat ?"
- Ramassage des branches et résidus TOUJOURS inclus dans le contrat
- Si trou dans la haie : informer le client — environ 8 ans pour que ça repousse
- Branches mortes : prendre une photo et envoyer au superviseur
- Prendre une photo AVANT de commencer chaque contrat
- Accès difficile = extra de 15% sur le prix

VOCABULAIRE TECHNIQUE BILINGUE (FR / ES) :
- Haie de cèdre = seto de cedro / cerca viva de cedro
- Taille / taillage = poda / recorte
- Taille conique = corte cónico
- Cisailles électriques = tijeras eléctricas de podar
- Tronçonneuse = motosierra
- Escabeau / échelle = escalera
- Branche = rama | Cime = cima / copa | Dessus = arriba
- Souffleur = soplador | Râteau = rastrillo
- Bâche = lona | Résidus = residuos / recortes
- Branche morte = rama muerta | Trou = hueco
- Fil électrique = cable eléctrico — DANGER
- Carte de satisfaction = tarjeta de satisfacción

LOGEMENT :
- Hébergement fourni par l'employeur
- Coût déduit du salaire selon le contrat Equinox World
- Propreté et respect des règles obligatoires
- Problèmes de logement : contacter Henri

VIE AU QUÉBEC :
- Météo matin : peut être froid (amener une veste)
- Langue locale : français
- Épiceries : IGA, Metro, Maxi
- Médecin sans rendez-vous : cliniques CLSC

CONTACTS D'URGENCE :
- Urgences (police / ambulance / pompiers) : 911
- Accidents de travail CSST : 1-844-838-0808
- Henri Leboeuf (superviseur) : contact quotidien pour tout
- Jean-Samuel Leboeuf (directeur) : 450-280-3222 — urgences importantes seulement
- Equinox World : pour questions sur permis de travail

DOCUMENTS À AVOIR SUR SOI :
- Permis de travail | Pièce d'identité avec photo
- Juan Luis : permis de conduire (pour véhicules de l'entreprise)

TON STYLE :
- Chaleureux, patient, simple et clair
- Utilise des listes et emojis pour faciliter la lecture
- Si tu ne connais pas la réponse : dirige vers Henri ou Jean-Samuel (450-280-3222)
- Pour toute urgence médicale : 911 EN PREMIER`;

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>Haie Lite \u2014 Assistant / Asistente</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green: #2d6a4f; --green-light: #40916c; --green-pale: #d8f3dc;
      --green-dark: #1b4332; --gray-bg: #f0f2f0;
      --text-dark: #1b1b1b; --text-muted: #666; --radius: 18px;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--gray-bg); height: 100dvh; display: flex; flex-direction: column; max-width: 680px; margin: 0 auto; }
    header { background: linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%); color: white; padding: 14px 18px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.12); flex-shrink: 0; }
    .logo { width: 44px; height: 44px; background: rgba(255,255,255,.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .header-text { flex: 1; }
    .header-text h1 { font-size: 16px; font-weight: 700; }
    .header-text p { font-size: 12px; opacity: .8; margin-top: 2px; }
    .status-dot { width: 8px; height: 8px; background: #74c69d; border-radius: 50%; display: inline-block; margin-right: 5px; }
    .icon-btn { width: 34px; height: 34px; background: rgba(255,255,255,.12); border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 17px; }
    .icon-btn:hover { background: rgba(255,255,255,.22); }
    #messages { flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
    .welcome-card { background: white; border-radius: 16px; padding: 16px; border-left: 4px solid var(--green-light); box-shadow: 0 1px 6px rgba(0,0,0,.07); }
    .welcome-card h2 { font-size: 15px; color: var(--green-dark); margin-bottom: 8px; font-weight: 700; }
    .welcome-card p { font-size: 13px; color: var(--text-muted); line-height: 1.55; margin-bottom: 5px; }
    .emergency-banner { background: #fff8e1; border-left: 4px solid #ffb300; border-radius: 10px; padding: 9px 13px; font-size: 12px; color: #6d4c00; display: flex; align-items: center; gap: 7px; }
    .section-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; padding: 0 2px; }
    .quick-actions { display: flex; flex-wrap: wrap; gap: 7px; padding: 0 2px; }
    .quick-btn { background: white; border: 1.5px solid #c8e6c9; color: var(--green); border-radius: 20px; padding: 7px 13px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .quick-btn:hover, .quick-btn:active { background: var(--green-pale); border-color: var(--green-light); }
    .message { display: flex; align-items: flex-end; gap: 8px; max-width: 88%; }
    .message.user { align-self: flex-end; flex-direction: row-reverse; }
    .message.bot { align-self: flex-start; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; background: var(--green-pale); }
    .bubble { padding: 10px 14px; border-radius: var(--radius); font-size: 14px; line-height: 1.55; word-break: break-word; }
    .message.user .bubble { background: var(--green); color: white; border-bottom-right-radius: 4px; }
    .message.bot .bubble { background: white; color: var(--text-dark); border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .message.bot .bubble p { margin-bottom: 6px; }
    .message.bot .bubble p:last-child { margin-bottom: 0; }
    .message.bot .bubble ul, .message.bot .bubble ol { padding-left: 18px; margin: 5px 0; }
    .message.bot .bubble li { margin-bottom: 3px; }
    .message.bot .bubble strong { color: var(--green-dark); }
    .typing { display: flex; align-items: center; gap: 4px; padding: 12px 14px; }
    .typing span { width: 7px; height: 7px; background: var(--green-light); border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing span:nth-child(2) { animation-delay: .2s; }
    .typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes bounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-5px) } }
    .input-area { background: white; border-top: 1px solid #e8e8e8; padding: 10px 14px 14px; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; }
    #input { flex: 1; border: 1.5px solid #e0e0e0; border-radius: 22px; padding: 10px 16px; font-size: 15px; outline: none; resize: none; max-height: 120px; line-height: 1.4; font-family: inherit; transition: border-color .15s; background: #fafafa; }
    #input:focus { border-color: var(--green-light); background: white; }
    #input::placeholder { color: #aaa; }
    #send-btn { width: 42px; height: 42px; background: var(--green); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .15s; box-shadow: 0 2px 8px rgba(45,106,79,.3); }
    #send-btn:hover { background: var(--green-light); transform: scale(1.05); }
    #send-btn:disabled { background: #ccc; cursor: default; box-shadow: none; transform: none; }
    #send-btn svg { width: 18px; height: 18px; fill: white; }
  </style>
</head>
<body>
<header>
  <div class="logo">🌱</div>
  <div class="header-text">
    <h1>Haie Lite \u2014 Assistant</h1>
    <p><span class="status-dot"></span>En ligne &nbsp;\xb7&nbsp; En l\xednea</p>
  </div>
  <button class="icon-btn" onclick="clearChat()" title="Nouvelle conv. / Nueva conv.">\u21ba</button>
</header>
<div id="messages">
  <div class="welcome-card">
    <h2>🇨🇦 Bienvenue / Bienvenido(a)</h2>
    <p>🇫🇷 <strong>FR :</strong> Je suis ton assistant Haie Lite. Pose-moi toutes tes questions sur le travail, la paye, la s\xe9curit\xe9, les techniques ou la vie au Qu\xe9bec.</p>
    <p>🇬🇹 <strong>ES :</strong> Soy tu asistente de Haie Lite. Hazme cualquier pregunta sobre el trabajo, el pago, la seguridad, las t\xe9cnicas de poda o la vida en Quebec.</p>
  </div>
  <div class="emergency-banner">
    🚨 <span><strong>Emergencia / Urgence :</strong> 911 &nbsp;|&nbsp; Accident travail CSST : 1-844-838-0808 &nbsp;|&nbsp; Jean-Samuel : 450-280-3222</span>
  </div>
  <div class="section-label">Preguntas frecuentes / Questions fr\xe9quentes</div>
  <div class="quick-actions">
    <button class="quick-btn" onclick="quickSend('Cuales son mis horarios de trabajo?')">\u23f0 Horarios</button>
    <button class="quick-btn" onclick="quickSend('Cuando y como me pagan?')">💵 Pago</button>
    <button class="quick-btn" onclick="quickSend('Que hago en caso de accidente?')">🚑 Urgencias</button>
    <button class="quick-btn" onclick="quickSend('Que equipo de proteccion debo usar?')">🦺 Seguridad</button>
    <button class="quick-btn" onclick="quickSend('Como hacer el corte conico del seto de cedro?')">\u2702\ufe0f T\xe9cnica poda</button>
    <button class="quick-btn" onclick="quickSend('Quien es mi supervisor y como contactarlo?')">👷 Contactos</button>
    <button class="quick-btn" onclick="quickSend('Comment fonctionne le logement fourni?')">🏠 Logement</button>
    <button class="quick-btn" onclick="quickSend('Cuales son las reglas en los sitios de trabajo?')">📋 R\xe8gles</button>
  </div>
</div>
<div class="input-area">
  <textarea id="input" placeholder="Escribe tu pregunta / \xc9cris ta question..." rows="1"
    onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
  <button id="send-btn" onclick="sendMessage()">
    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
  </button>
</div>
<script>
const messagesEl=document.getElementById('messages');
const inputEl=document.getElementById('input');
const sendBtn=document.getElementById('send-btn');
let history=[],streaming=false;
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
function handleKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}
function quickSend(t){inputEl.value=t;sendMessage();}
function scrollBottom(){setTimeout(()=>{messagesEl.scrollTop=messagesEl.scrollHeight;},50);}
function clearChat(){
  if(streaming)return;
  history=[];
  const keep=Array.from(messagesEl.querySelectorAll('.welcome-card,.emergency-banner,.section-label,.quick-actions'));
  while(messagesEl.firstChild)messagesEl.removeChild(messagesEl.firstChild);
  keep.forEach(el=>messagesEl.appendChild(el));
}
function addMsg(role,content){
  const wrap=document.createElement('div');wrap.className='message '+role;
  const av=document.createElement('div');av.className='avatar';av.textContent=role==='user'?'👤':'🌱';
  const bub=document.createElement('div');bub.className='bubble';
  if(role==='bot')bub.innerHTML=fmt(content);else bub.textContent=content;
  wrap.appendChild(av);wrap.appendChild(bub);
  messagesEl.appendChild(wrap);scrollBottom();return bub;
}
function addTyping(){
  const wrap=document.createElement('div');wrap.className='message bot';wrap.id='typing';
  const av=document.createElement('div');av.className='avatar';av.textContent='🌱';
  const bub=document.createElement('div');bub.className='bubble typing';
  bub.innerHTML='<span></span><span></span><span></span>';
  wrap.appendChild(av);wrap.appendChild(bub);messagesEl.appendChild(wrap);scrollBottom();
}
function removeTyping(){const el=document.getElementById('typing');if(el)el.remove();}
function fmt(t){
  let s=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  s=s.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*(.*?)\*/g,'<em>$1</em>');
  s=s.replace(/^[•\-] (.+)$/gm,'<li>$1</li>');
  s=s.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');
  s=s.replace(/(<li>[\s\S]*?<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>');
  s=s.replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>');
  return '<p>'+s+'</p>';
}
async function sendMessage(){
  const text=inputEl.value.trim();
  if(!text||streaming)return;
  addMsg('user',text);
  history.push({role:'user',content:text});
  inputEl.value='';inputEl.style.height='auto';
  streaming=true;sendBtn.disabled=true;
  addTyping();
  try{
    const res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-20)})});
    removeTyping();
    if(!res.ok){const err=await res.text();throw new Error(err);}
    const bub=addMsg('bot','');
    let full='';
    const reader=res.body.getReader();const dec=new TextDecoder();
    while(true){
      const{done,value}=await reader.read();if(done)break;
      for(const line of dec.decode(value).split('\n')){
        if(!line.startsWith('data: '))continue;
        const d=line.slice(6);if(d==='[DONE]')break;
        try{const p=JSON.parse(d);if(p.text){full+=p.text;bub.innerHTML=fmt(full);scrollBottom();}if(p.error){bub.innerHTML='\u26a0\ufe0f '+p.error;}}catch{}
      }
    }
    history.push({role:'assistant',content:full});
  }catch(err){
    removeTyping();
    addMsg('bot','\u26a0\ufe0f Erreur / Error: '+err.message+'\n\nContacta a Henri o llama al 450-280-3222.');
  }
  streaming=false;sendBtn.disabled=false;inputEl.focus();
}
</script>
</body>
</html>`;

interface ChatMessage {
  role: string;
  content: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/chat") {
      let body: { messages: ChatMessage[] };
      try {
        body = await request.json();
      } catch {
        return new Response("Bad request", { status: 400 });
      }

      const messages = body.messages.slice(-20);
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        try {
          const groqRes = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                max_tokens: 1024,
                stream: true,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  ...messages,
                ],
              }),
            }
          );

          if (!groqRes.ok) {
            const errText = await groqRes.text();
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({ error: errText })}\n\n`
              )
            );
            return;
          }

          const reader = groqRes.body!.getReader();
          const dec = new TextDecoder();
          let buf = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });

            // Split on double-newline to get complete SSE events
            const events = buf.split("\n\n");
            buf = events.pop() ?? "";

            for (const event of events) {
              for (const line of event.split("\n")) {
                if (!line.startsWith("data: ")) continue;
                const d = line.slice(6).trim();
                if (d === "[DONE]") break;
                try {
                  const chunk = JSON.parse(d);
                  const text = chunk.choices?.[0]?.delta?.content;
                  if (text) {
                    await writer.write(
                      encoder.encode(
                        `data: ${JSON.stringify({ text })}\n\n`
                      )
                    );
                  }
                } catch {}
              }
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
