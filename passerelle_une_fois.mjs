// Connexion unique à la passerelle Discord (lit le jeton sur l'entrée standard), puis se ferme.
let token = "";
for await (const c of process.stdin) token += c;
token = token.trim();
const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
const fin = setTimeout(() => { console.log("Passerelle : délai dépassé"); process.exit(1); }, 30000);
ws.onmessage = (ev) => {
  const p = JSON.parse(ev.data);
  if (p.op === 10) ws.send(JSON.stringify({ op: 2, d: { token, intents: 512, properties: { os: "windows", browser: "file-videos", device: "file-videos" } } }));
  if (p.t === "READY") { console.log("Passerelle : connecté"); clearTimeout(fin); ws.close(); process.exit(0); }
  if (p.op === 9) { console.log("Passerelle : jeton refusé"); process.exit(1); }
};
ws.onclose = (ev) => { if (ev.code >= 4000) { console.log("Passerelle fermée :", ev.code, ev.reason); process.exit(1); } };
