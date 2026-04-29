import { useState } from "react";

const TIERS = [
  { id: "basic", name: "Basique", price: 299, delay: "3 jours", emoji: "⚡", features: ["Site 1 page", "Formulaire contact", "Design responsive", "Hébergement 1 an"] },
  { id: "standard", name: "Standard", price: 599, delay: "5 jours", emoji: "🚀", rec: true, features: ["Site 3-5 pages", "Galerie photos", "SEO optimisé", "Hébergement 1 an"] },
  { id: "premium", name: "Premium", price: 999, delay: "7 jours", emoji: "👑", features: ["Site complet", "Boutique en ligne", "SEO avancé", "Support 3 mois"] },
];

const TYPES = ["Restaurant", "Boutique", "Coiffeur", "Boulangerie", "Garage", "Pressing", "Bijouterie", "Épicerie", "Tatouage", "Autre"];

const STATUS = {
  nouveau: { label: "Nouveau", bg: "#1a2332", color: "#64748b" },
  envoyé: { label: "Envoyé", bg: "#1e3a5f", color: "#3b82f6" },
  répondu: { label: "Répondu", bg: "#3f2c00", color: "#f59e0b" },
  accepté: { label: "Accepté", bg: "#064e3b", color: "#10b981" },
  refusé: { label: "Refusé", bg: "#450a0a", color: "#ef4444" },
};

const CLIENT_ITEMS = [
  { id: "photos", label: "📸 Photos du commerce / produits" },
  { id: "products", label: "🛍️ Liste produits/services + prix" },
  { id: "contact", label: "📞 Numéro de contact public" },
  { id: "hours", label: "🕐 Horaires d'ouverture" },
  { id: "logo", label: "🎨 Logo (si disponible)" },
  { id: "colors", label: "🎨 Couleurs préférées / charte" },
];

function mockSearch(city, type) {
  const pools = {
    restaurant: ["Le Bon Vivant", "Chez Mama Rosa", "La Table du Chef", "Au Vieux Comptoir", "Le Bistrot d'en Face"],
    boutique: ["La Belle Mode", "Style & Cie", "L'Atelier Sophie", "Tendance Plus", "Chic & Unique"],
    coiffeur: ["Salon Élégance", "Hair Studio", "Coiff Avenue", "Beauty & Co", "L'Art du Cheveu"],
    boulangerie: ["Boulangerie Martin", "Au Pain Doré", "La Mie Croustillante", "Artisan du Pain"],
    garage: ["Garage Dupont", "Auto Service Plus", "Mécanique Express", "Carrosserie Pro"],
    pressing: ["Pressing du Quartier", "Net & Propre", "Blanchisserie Express"],
    bijouterie: ["Bijoux d'Art", "La Perle Fine", "Éclat & Lumière"],
    épicerie: ["Épicerie du Coin", "Primeurs Martinez", "Le Marché Frais"],
    tatouage: ["Ink Studio", "Black Rose Tattoo", "Le Tatoueur Pro"],
    autre: ["Commerce Martin", "Établissement Dubois", "Affaire Durand"],
  };
  const streets = ["du Commerce", "de la Paix", "Victor Hugo", "du Marché", "Jean Jaurès", "de la République"];
  const key = type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const pool = pools[key] || pools.autre;
  const n = Math.floor(Math.random() * 2) + 3;
  return pool.slice(0, n).map((name, i) => ({
    id: `${Date.now()}-${i}`,
    name, type, city,
    address: `${Math.floor(Math.random() * 80) + 1} rue ${streets[i % streets.length]}, ${city}`,
    phone: `06 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
    email: `${name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8)}@gmail.com`,
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    reviews: Math.floor(Math.random() * 80) + 10,
    status: "nouveau", message: null, channel: null, tier: null, collected: {}, addedAt: Date.now(),
  }));
}

const S = {
  card: { background: "#0f1623", border: "1px solid #1a2332", borderRadius: 14, padding: 16, marginBottom: 12 },
  input: { background: "#0f1623", border: "1px solid #1a2332", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" },
  btn: (bg = "#3b82f6", color = "#fff") => ({ background: bg, color, border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }),
};

export default function App() {
  const [tab, setTab] = useState("search");
  const [prospects, setProspects] = useState([]);
  const [detail, setDetail] = useState(null);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const upsertProspect = (p) => setProspects(prev => prev.find(x => x.id === p.id) ? prev : [p, ...prev]);

  const updateProspect = (id, updates) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setDetail(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  };

  const doSearch = async () => {
    if (!city.trim() || !type) return;
    setSearching(true);
    setResults([]);
    await new Promise(r => setTimeout(r, 1400));
    setResults(mockSearch(city, type));
    setSearching(false);
  };

  const generateMsg = async (prospect, channel) => {
    setGenerating(true);
    setGenMsg("");
    const isEmail = channel === "email";
    const sys = isEmail
      ? `Tu es un expert en prospection commerciale pour la création de sites web. Génère un email professionnel et chaleureux. Structure: commence par "Objet: [accrocheur]" puis une ligne vide puis le corps. 100-130 mots. Mentionne les 3 formules: Basique 299€, Standard 599€, Premium 999€. Signe "L'équipe WebHunter". Français, ton humain et pro.`
      : `Génère un message WhatsApp court et percutant. Max 4 phrases. Personnalisé avec le nom du commerce. Propose à partir de 299€. Invite à répondre pour en savoir plus. Ton décontracté mais sérieux. Commence directement sans "Bonjour,".`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: sys,
          messages: [{ role: "user", content: `Commerce: "${prospect.name}", Type: ${prospect.type}, Ville: ${prospect.city}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Erreur de génération.";
      setGenMsg(text);
      updateProspect(prospect.id, { message: text, channel });
    } catch {
      setGenMsg("Erreur de connexion. Réessaie.");
    }
    setGenerating(false);
  };

  const stats = {
    total: prospects.length,
    sent: prospects.filter(p => ["envoyé", "répondu", "accepté"].includes(p.status)).length,
    replied: prospects.filter(p => ["répondu", "accepté"].includes(p.status)).length,
    accepted: prospects.filter(p => p.status === "accepté").length,
    revenue: prospects.filter(p => p.status === "accepté").reduce((s, p) => s + (TIERS.find(t => t.id === p.tier)?.price || 0), 0),
  };

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (detail) {
    const p = detail;
    return (
      <div style={{ background: "#080c14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif", maxWidth: 430, margin: "0 auto" }}>
        <div style={{ background: "#0f1623", borderBottom: "1px solid #1a2332", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
          <button onClick={() => { setDetail(null); setGenMsg(""); }} style={{ ...S.btn("#1a2332", "#e2e8f0"), padding: "8px 14px", fontSize: 13 }}>← Retour</button>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{p.type} · {p.city}</div>
          </div>
        </div>

        <div style={{ padding: "16px 16px 120px", overflowY: "auto" }}>
          {/* Info */}
          <div style={S.card}>
            {[["📍", p.address], ["📞", p.phone], ["📧", p.email], ["⭐", `${p.rating}/5 · ${p.reviews} avis Google`]].map(([icon, val]) => (
              <div key={icon} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #1a2332", alignItems: "flex-start" }}>
                <span>{icon}</span>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Statut</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(STATUS).map(([key, cfg]) => (
                <button key={key} onClick={() => updateProspect(p.id, { status: key })} style={{
                  padding: "7px 13px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: p.status === key ? cfg.color : cfg.bg,
                  color: p.status === key ? "#fff" : cfg.color, transition: "all 0.15s",
                }}>{cfg.label}</button>
              ))}
            </div>
          </div>

          {/* Message generator */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Générer un message IA</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => generateMsg(p, "email")} disabled={generating} style={{ ...S.btn("#0a1e3d", "#3b82f6"), flex: 1, border: "1px solid #1e3a8a", opacity: generating ? 0.5 : 1 }}>
                📧 Email
              </button>
              <button onClick={() => generateMsg(p, "whatsapp")} disabled={generating} style={{ ...S.btn("#022c22", "#10b981"), flex: 1, border: "1px solid #065f46", opacity: generating ? 0.5 : 1 }}>
                💬 WhatsApp
              </button>
            </div>

            {generating && (
              <div style={{ background: "#1a2332", borderRadius: 10, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Génération du message personnalisé...</div>
              </div>
            )}

            {genMsg && !generating && (
              <div>
                <div style={{ background: "#060d1a", border: "1px solid #1e3a5f", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.7, color: "#cbd5e1", whiteSpace: "pre-wrap", marginBottom: 10 }}>
                  {genMsg}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(genMsg); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ ...S.btn(copied ? "#064e3b" : "#1a2332", copied ? "#10b981" : "#e2e8f0"), flex: 1 }}>
                    {copied ? "✓ Copié !" : "📋 Copier"}
                  </button>
                  <button onClick={() => updateProspect(p.id, { status: "envoyé" })}
                    style={{ ...S.btn("#1e3a5f", "#3b82f6"), flex: 1 }}>
                    ✅ Marquer envoyé
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing tiers */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, padding: "0 2px" }}>Choisir une formule</div>
          {TIERS.map(t => (
            <div key={t.id} onClick={() => updateProspect(p.id, { tier: p.tier === t.id ? null : t.id })} style={{
              ...S.card, cursor: "pointer", marginBottom: 8,
              border: `1px solid ${p.tier === t.id ? (t.rec ? "#8b5cf6" : "#3b82f6") : "#1a2332"}`,
              background: p.tier === t.id ? "#0a1628" : "#0f1623",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{t.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      {t.name}
                      {t.rec && <span style={{ fontSize: 10, background: "#8b5cf6", color: "#fff", padding: "2px 7px", borderRadius: 10 }}>⭐ Recommandé</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Livraison {t.delay}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, fontSize: 20 }}>{t.price}€</div>
                  {p.tier === t.id && <div style={{ fontSize: 11, color: "#10b981" }}>✓ Sélectionné</div>}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                {t.features.map(f => (
                  <span key={f} style={{ fontSize: 11, background: "#1a2332", color: "#94a3b8", padding: "3px 8px", borderRadius: 20 }}>{f}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Client accepted checklist */}
          {p.status === "accepté" && (
            <div style={{ ...S.card, border: "1px solid #065f46", marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>✅ Client accepté — Infos à collecter</div>
              {CLIENT_ITEMS.map(item => {
                const checked = p.collected?.[item.id];
                return (
                  <div key={item.id} onClick={() => updateProspect(p.id, { collected: { ...(p.collected || {}), [item.id]: !checked } })}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid #064e3b", cursor: "pointer" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: checked ? "#10b981" : "#1a2332", border: `2px solid ${checked ? "#10b981" : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, transition: "all 0.15s" }}>
                      {checked ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 13, color: checked ? "#64748b" : "#e2e8f0", textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 12, fontSize: 12, color: "#10b981", textAlign: "center" }}>
                {Object.values(p.collected || {}).filter(Boolean).length} / {CLIENT_ITEMS.length} éléments reçus
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#080c14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "#0f1623", borderBottom: "1px solid #1a2332", padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🌐</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px" }}>WebHunter Pro</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Prospection automatisée · {prospects.length} prospect{prospects.length > 1 ? "s" : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {[{ id: "search", label: "🔍 Recherche" }, { id: "prospects", label: "📋 Prospects" }, { id: "stats", label: "📊 Stats" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 2px", background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
              color: tab === t.id ? "#e2e8f0" : "#64748b",
              fontSize: 12, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>

        {/* ── SEARCH ── */}
        {tab === "search" && (
          <div>
            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Trouver des commerces sans site web</div>
              <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} placeholder="Ville (ex: Paris, Lyon, Marseille...)" style={{ ...S.input, marginBottom: 10 }} />
              <select value={type} onChange={e => setType(e.target.value)} style={{ ...S.input, marginBottom: 14 }}>
                <option value="">Type de commerce...</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={doSearch} disabled={searching || !city.trim() || !type} style={{ ...S.btn(), width: "100%", opacity: (!city.trim() || !type || searching) ? 0.4 : 1 }}>
                {searching ? "🔍 Scan en cours..." : "🔍 Lancer la recherche"}
              </button>
            </div>

            {searching && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🗺️</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Scan Google Maps en cours...</div>
                <div style={{ fontSize: 12 }}>Détection des commerces sans site web</div>
              </div>
            )}

            {results.length > 0 && !searching && (
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>{results.length}</span> commerces trouvés sans site à <strong style={{ color: "#e2e8f0" }}>{city}</strong>
                </div>
                {results.map(b => {
                  const added = prospects.find(p => p.id === b.id);
                  return (
                    <div key={b.id} style={S.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>⭐ {b.rating} · {b.reviews} avis · {b.type}</div>
                        </div>
                        <span style={{ fontSize: 10, background: "#3f0000", color: "#f87171", padding: "4px 8px", borderRadius: 8, height: "fit-content", whiteSpace: "nowrap" }}>🚫 Pas de site</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>📍 {b.address}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {added ? (
                          <button onClick={() => { setDetail(prospects.find(p => p.id === b.id)); setGenMsg(prospects.find(p => p.id === b.id)?.message || ""); }} style={{ ...S.btn("#022c22", "#10b981"), flex: 1 }}>
                            ✓ Voir prospect
                          </button>
                        ) : (
                          <button onClick={() => upsertProspect(b)} style={{ ...S.btn("#0a1e3d", "#3b82f6"), flex: 1 }}>
                            + Ajouter
                          </button>
                        )}
                        <button onClick={() => { if (!added) upsertProspect(b); const target = added || b; setDetail(target); setGenMsg(target.message || ""); }} style={{ ...S.btn("#1a2332", "#e2e8f0"), flex: 1 }}>
                          📩 Contacter
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROSPECTS ── */}
        {tab === "prospects" && (
          <div>
            {prospects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Aucun prospect encore</div>
                <div style={{ fontSize: 13 }}>Lance une recherche pour trouver des commerces sans site web</div>
              </div>
            ) : (
              Object.entries(STATUS).map(([key, cfg]) => {
                const list = prospects.filter(p => p.status === key);
                if (!list.length) return null;
                return (
                  <div key={key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 6, padding: "0 2px" }}>
                      {cfg.label} · {list.length}
                    </div>
                    {list.map(p => (
                      <div key={p.id} onClick={() => { setDetail(p); setGenMsg(p.message || ""); }}
                        style={{ ...S.card, cursor: "pointer", borderLeft: `3px solid ${cfg.color}`, paddingLeft: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ overflow: "hidden" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.type} · {p.city}</div>
                            {p.tier && (
                              <div style={{ fontSize: 11, color: "#8b5cf6", marginTop: 3 }}>
                                {TIERS.find(t => t.id === p.tier)?.emoji} {TIERS.find(t => t.id === p.tier)?.name} — {TIERS.find(t => t.id === p.tier)?.price}€
                              </div>
                            )}
                          </div>
                          <span style={{ color: "#64748b", fontSize: 18, marginLeft: 8 }}>›</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Prospects total", value: stats.total, icon: "👥", color: "#3b82f6" },
                { label: "Messages envoyés", value: stats.sent, icon: "📤", color: "#8b5cf6" },
                { label: "Clients acceptés", value: stats.accepted, icon: "✅", color: "#10b981" },
                { label: "CA potentiel", value: `${stats.revenue}€`, icon: "💰", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, marginBottom: 0, textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 26, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Taux de conversion</div>
              {[
                { label: "Contactés → Répondus", a: stats.sent, b: stats.replied },
                { label: "Répondus → Acceptés", a: stats.replied, b: stats.accepted },
              ].map(({ label, a, b }) => {
                const rate = a > 0 ? Math.round((b / a) * 100) : 0;
                return (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 }}>
                      <span style={{ color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontWeight: 800, color: "#e2e8f0" }}>{rate}%</span>
                    </div>
                    <div style={{ height: 7, background: "#1a2332", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${rate}%`, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.revenue > 0 ? (
              <div style={{ ...S.card, background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", border: "1px solid #10b981" }}>
                <div style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>💰 Chiffre d'affaires généré</div>
                <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", marginTop: 4 }}>{stats.revenue}€</div>
                <div style={{ fontSize: 12, color: "#a7f3d0", marginTop: 4 }}>{stats.accepted} site{stats.accepted > 1 ? "s" : ""} vendu{stats.accepted > 1 ? "s" : ""}</div>
              </div>
            ) : (
              <div style={{ ...S.card, textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Lance ta première prospection</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Recherche des commerces et envoie tes premiers messages pour débloquer tes stats</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
