import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardList, Globe2, Lightbulb, LockKeyhole, LogOut, MessageSquare, QrCode, Send, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

type Lang = "fr" | "en";
type Category = "academic" | "campus" | "events" | "sports" | "administration" | "other";
type Status = "new" | "reviewing" | "considered" | "done";
type Suggestion = {
  id: string; created_at: string; category: Category; message: string;
  is_anonymous: boolean; student_name: string | null; student_class: string | null;
  status: Status; admin_note: string | null;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const copy = {
  en: {
    eyebrow: "THE STUDENT VOICE PLATFORM", title: "Your voice. Your ideas. Our IPEIN.",
    intro: "A better campus starts with a conversation. Share an idea, raise an issue or suggest something new.",
    cta: "Share an idea", trust: "Your suggestion goes directly to the student delegate.",
    anonymous: "Submit anonymously", named: "Add my name", name: "Your name", class: "Class / group (optional)",
    category: "What is your idea about?", message: "Tell us about your idea", placeholder: "Describe your suggestion, the problem it solves, or how it could improve student life…",
    submit: "Send my suggestion", sending: "Sending…", success: "Your idea has been sent. Thank you for helping improve IPEIN!",
    error: "Something went wrong. Please try again.", required: "Please write at least 5 characters.",
    categories: { academic: "Academic life", campus: "Campus & facilities", events: "Events & activities", sports: "Sports", administration: "Administration", other: "Other" },
    footer: "A student initiative • IPEIN", delegate: "Delegate access", dashboard: "Delegate dashboard",
    login: "Sign in", email: "Delegate email", password: "Password", loginError: "Sign-in failed. Check your email and password.",
    inbox: "Suggestion inbox", total: "Total", new: "New", reviewing: "Reviewing", considered: "Considered", done: "Completed",
    all: "All suggestions", search: "Search suggestions…", noItems: "No suggestions yet.", private: "Only the authorized delegate account can view submissions.",
    status: "Status", note: "Private delegate note", save: "Save", delete: "Delete", logout: "Log out",
    qrTitle: "Your QR code", qrText: "Print this code and place it around campus. Students can scan it to open the suggestion form.",
    download: "Download QR code", copyLink: "Copy website link", copied: "Link copied", back: "Back to form",
    anonymousLabel: "Anonymous", namedLabel: "Named submission", submitted: "Submitted",
    setupTitle: "Connect your database", setupText: "This website needs your Supabase project settings before submissions and the private dashboard can work. Follow the setup guide included in the project.",
    statusLabels: { new: "New", reviewing: "Reviewing", considered: "Considered", done: "Completed" },
    emptySearch: "No matching suggestions."
  },
  fr: {
    eyebrow: "LA PLATEFORME DE LA VOIX ÉTUDIANTE", title: "Votre voix. Vos idées. Notre IPEIN.",
    intro: "Un meilleur campus commence par le dialogue. Partagez une idée, signalez un problème ou proposez une nouveauté.",
    cta: "Proposer une idée", trust: "Votre suggestion est transmise directement au délégué des étudiants.",
    anonymous: "Envoyer anonymement", named: "Ajouter mon nom", name: "Votre nom", class: "Classe / groupe (facultatif)",
    category: "Votre idée concerne quel domaine ?", message: "Parlez-nous de votre idée", placeholder: "Décrivez votre proposition, le problème à résoudre ou son intérêt pour la vie étudiante…",
    submit: "Envoyer ma suggestion", sending: "Envoi…", success: "Votre idée a été envoyée. Merci de contribuer à améliorer l'IPEIN !",
    error: "Une erreur est survenue. Veuillez réessayer.", required: "Veuillez écrire au moins 5 caractères.",
    categories: { academic: "Vie académique", campus: "Campus & équipements", events: "Événements & activités", sports: "Sport", administration: "Administration", other: "Autre" },
    footer: "Une initiative étudiante • IPEIN", delegate: "Accès délégué", dashboard: "Espace du délégué",
    login: "Se connecter", email: "E-mail du délégué", password: "Mot de passe", loginError: "Connexion impossible. Vérifiez vos identifiants.",
    inbox: "Boîte à suggestions", total: "Total", new: "Nouvelles", reviewing: "En cours", considered: "À l'étude", done: "Traitées",
    all: "Toutes les suggestions", search: "Rechercher une suggestion…", noItems: "Aucune suggestion pour le moment.", private: "Seul le compte délégué autorisé peut consulter les propositions.",
    status: "Statut", note: "Note privée du délégué", save: "Enregistrer", delete: "Supprimer", logout: "Déconnexion",
    qrTitle: "Votre QR code", qrText: "Imprimez ce code et affichez-le sur le campus. Les étudiants pourront scanner pour accéder au formulaire.",
    download: "Télécharger le QR code", copyLink: "Copier le lien du site", copied: "Lien copié", back: "Retour au formulaire",
    anonymousLabel: "Anonyme", namedLabel: "Avec identité", submitted: "Envoyée",
    statusLabels: { new: "Nouvelle", reviewing: "En cours", considered: "À l'étude", done: "Traitée" },
    emptySearch: "Aucune suggestion correspondante."
  }
};

const categories: Category[] = ["academic", "campus", "events", "sports", "administration", "other"];
const statuses: Status[] = ["new", "reviewing", "considered", "done"];

export default function App() {
  const [lang, setLang] = useState<Lang>("fr");
  const [page, setPage] = useState<"home" | "login" | "dashboard" | "qr">("home");
  const [identity, setIdentity] = useState<"anonymous" | "named">("anonymous");
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [category, setCategory] = useState<Category>("academic");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{type:"success"|"error",text:string}|null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<"all"|Status>("all");
  const [search, setSearch] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [authError, setAuthError] = useState("");
  const t = copy[lang];
  const siteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim() || window.location.origin;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => setLoggedIn(!!data.session));
    const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (page === "dashboard" && loggedIn) void loadSuggestions();
  }, [page, loggedIn]);

  async function loadSuggestions() {
    if (!supabase) return;
    setLoadingItems(true);
    const {data, error} = await supabase.from("suggestions").select("*").order("created_at", {ascending:false});
    if (!error && data) setItems(data as Suggestion[]);
    setLoadingItems(false);
  }

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (message.trim().length < 5 || (identity === "named" && !name.trim())) {
      setNotice({type:"error", text:t.required}); return;
    }
    if (!supabase) { setNotice({type:"error", text:t.setupText}); return; }
    setSending(true);
    const payload = {
      category, message: message.trim(), is_anonymous: identity === "anonymous",
      student_name: identity === "named" ? name.trim() : null,
      student_class: identity === "named" && studentClass.trim() ? studentClass.trim() : null
    };
    const {error} = await supabase.from("suggestions").insert(payload);
    setSending(false);
    if (error) setNotice({type:"error", text:t.error});
    else {
      setNotice({type:"success", text:t.success});
      setMessage(""); setName(""); setStudentClass(""); setIdentity("anonymous"); setCategory("academic");
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setAuthError("");
    if (!supabase) return;
    const {error} = await supabase.auth.signInWithPassword({email:email.trim(), password});
    if (error) setAuthError(t.loginError);
    else { setPage("dashboard"); setPassword(""); }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setLoggedIn(false); setPage("home");
  }

  async function updateItem(id: string, patch: Partial<Suggestion>) {
    if (!supabase) return;
    const {error} = await supabase.from("suggestions").update(patch).eq("id", id);
    if (!error) setItems(old => old.map(item => item.id === id ? {...item, ...patch} : item));
  }

  async function deleteItem(id: string) {
    if (!supabase || !window.confirm(lang === "fr" ? "Supprimer définitivement cette suggestion ?" : "Permanently delete this suggestion?")) return;
    const {error} = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) setItems(old => old.filter(item => item.id !== id));
  }

  function downloadQr() {
    const svg = document.querySelector("#site-qr svg") as SVGSVGElement | null;
    if (!svg) return;
    const copySvg = svg.cloneNode(true) as SVGSVGElement;
    copySvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([new XMLSerializer().serializeToString(copySvg)], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ipein-student-voice-qr.svg"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => items.filter(item =>
    (filter === "all" || item.status === filter) &&
    (item.message.toLowerCase().includes(search.toLowerCase()) ||
      (item.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      t.categories[item.category].toLowerCase().includes(search.toLowerCase()))
  ), [items, filter, search, t]);

  const stats = statuses.map(s => ({status:s, count:items.filter(i=>i.status===s).length}));

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>setPage("home")} aria-label="IPEIN Student Voice home">
        <span className="brand-mark">I</span><span>IPEIN <b>Student Voice</b></span>
      </button>
      <div className="top-actions">
        <button className="language" onClick={()=>setLang(lang==="fr"?"en":"fr")}><Globe2 size={16}/>{lang==="fr"?"FR":"EN"}<ChevronDown size={13}/></button>
        {loggedIn ? <button className="top-link" onClick={()=>setPage("dashboard")}><ClipboardList size={16}/>{t.dashboard}</button> :
          <button className="top-link" onClick={()=>setPage("login")}><LockKeyhole size={15}/>{t.delegate}</button>}
      </div>
    </header>

    {page === "home" && <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/>{t.eyebrow}</div>
          <h1>{t.title.split(" ").slice(0,2).join(" ")} <span>{t.title.split(" ").slice(2).join(" ")}</span></h1>
          <p>{t.intro}</p>
          <button className="primary-btn" onClick={()=>document.getElementById("suggestion-form")?.scrollIntoView({behavior:"smooth"})}>{t.cta}<ArrowRight size={18}/></button>
          <div className="trust-line"><ShieldCheck size={16}/>{t.trust}</div>
        </div>
        <div className="hero-art">
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <div className="idea-card"><div className="idea-icon"><Lightbulb size={27}/></div><span className="idea-small">IPEIN / 2026</span><strong>Ideas make<br/>things better.</strong><div className="idea-bottom"><span/><span/><span/></div></div>
          <div className="floating-note note-a"><Sparkles size={17}/><span>Think. Share. Improve.</span></div>
          <div className="floating-note note-b"><MessageSquare size={17}/><span>Every voice counts</span></div>
        </div>
      </section>

      <section className="form-section" id="suggestion-form">
        <div className="section-heading"><div><div className="eyebrow dark-eyebrow">01 / {lang==="fr"?"PARTICIPER":"TAKE PART"}</div><h2>{lang==="fr"?"Une idée à partager ?":"Got an idea to share?"}</h2><p>{lang==="fr"?"Quelques instants suffisent pour faire entendre votre voix.":"It only takes a moment to make your voice heard."}</p></div><div className="heading-icon"><Lightbulb size={23}/></div></div>
        {!supabase && <div className="setup-banner"><ShieldCheck size={18}/><div><b>{t.setupTitle}</b><span>{t.setupText}</span></div></div>}
        <form className="suggestion-form" onSubmit={submitSuggestion}>
          <div className="form-label">{t.category}</div>
          <div className="category-grid">
            {categories.map((c,i)=><button type="button" key={c} className={`category-option ${category===c?"selected":""}`} onClick={()=>setCategory(c)}><span className="category-number">0{i+1}</span><span>{t.categories[c]}</span>{category===c&&<Check size={16}/>}</button>)}
          </div>
          <div className="form-label identity-label">{lang==="fr"?"Comment souhaitez-vous participer ?":"How would you like to submit?"}</div>
          <div className="identity-switch">
            <button type="button" className={identity==="anonymous"?"active":""} onClick={()=>setIdentity("anonymous")}><span className="radio-dot"/>{t.anonymous}</button>
            <button type="button" className={identity==="named"?"active":""} onClick={()=>setIdentity("named")}><span className="radio-dot"/>{t.named}</button>
          </div>
          {identity==="named"&&<div className="named-fields">
            <label>{t.name}<input value={name} onChange={e=>setName(e.target.value)} placeholder={lang==="fr"?"Votre nom et prénom":"Your full name"} required maxLength={100}/></label>
            <label>{t.class}<input value={studentClass} onChange={e=>setStudentClass(e.target.value)} placeholder={lang==="fr"?"Ex. 1A / Groupe 2":"e.g. 1A / Group 2"} maxLength={80}/></label>
          </div>}
          <label className="form-label message-label" htmlFor="message">{t.message}</label>
          <textarea id="message" value={message} onChange={e=>setMessage(e.target.value)} placeholder={t.placeholder} rows={5} maxLength={3000} required minLength={5}/>
          <div className="form-bottom"><span>{message.length}/3000</span><button className="primary-btn submit-btn" type="submit" disabled={sending||!supabase}>{sending?t.sending:t.submit}<Send size={16}/></button></div>
          {notice&&<div className={`notice ${notice.type}`}>{notice.type==="success"?<Check size={17}/>:<ShieldCheck size={17}/>}<span>{notice.text}</span></div>}
        </form>
      </section>
      <section className="bottom-quote"><span className="quote-mark">“</span><p>{lang==="fr"?"L'IPEIN avance lorsque ses étudiants prennent la parole.":"IPEIN moves forward when its students speak up."}</p><span className="quote-caption">IPEIN STUDENT VOICE</span></section>
    </main>}

    {page === "login" && <main className="auth-wrap"><button className="back-link" onClick={()=>setPage("home")}><ArrowLeft size={16}/>{t.back}</button><div className="auth-card"><div className="auth-icon"><LockKeyhole size={24}/></div><div className="eyebrow dark-eyebrow">{t.delegate}</div><h2>{t.dashboard}</h2><p>{t.private}</p><form onSubmit={signIn}><label>{t.email}<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>{t.password}<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="primary-btn full-btn" type="submit">{t.login}<ArrowRight size={17}/></button>{authError&&<div className="notice error">{authError}</div>}</form></div></main>}

    {page === "dashboard" && loggedIn && <main className="dashboard-wrap">
      <div className="dashboard-head"><div><div className="eyebrow dark-eyebrow">IPEIN / DELEGATE SPACE</div><h2>{t.inbox}</h2><p>{t.private}</p></div><div className="dashboard-actions"><button className="outline-btn" onClick={()=>setPage("qr")}><QrCode size={16}/>{t.qrTitle}</button><button className="icon-btn" onClick={signOut} title={t.logout}><LogOut size={17}/></button></div></div>
      <div className="stats-grid"><div className="stat-card"><span>{t.total}</span><b>{items.length}</b><small>{lang==="fr"?"Toutes les propositions":"All submissions"}</small></div>{stats.map(s=><div className="stat-card" key={s.status}><span>{t.statusLabels[s.status]}</span><b>{s.count}</b><small>{lang==="fr"?"Suggestions":"Suggestions"}</small></div>)}</div>
      <div className="inbox-panel"><div className="inbox-toolbar"><h3>{t.all}</h3><input className="search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}/></div>
        <div className="filter-row"><button className={filter==="all"?"filter-active":""} onClick={()=>setFilter("all")}>{t.all}</button>{statuses.map(s=><button key={s} className={filter===s?"filter-active":""} onClick={()=>setFilter(s)}>{t.statusLabels[s]}</button>)}</div>
        {loadingItems?<div className="empty-state">{lang==="fr"?"Chargement…":"Loading…"}</div>:filtered.length===0?<div className="empty-state">{items.length===0?t.noItems:t.emptySearch}</div>:
        <div className="suggestion-list">{filtered.map(item=><article className="suggestion-card" key={item.id}>
          <div className="suggestion-meta"><span className="category-pill">{t.categories[item.category]}</span><span>{new Date(item.created_at).toLocaleString(lang==="fr"?"fr-FR":"en-GB")}</span><span className="identity-pill">{item.is_anonymous?t.anonymousLabel:(item.student_name||t.namedLabel)}</span></div>
          <p className="suggestion-message">{item.message}</p>
          {!item.is_anonymous&&item.student_class&&<div className="student-class">{item.student_class}</div>}
          <div className="manage-row"><label>{t.status}<select value={item.status} onChange={e=>updateItem(item.id,{status:e.target.value as Status})}>{statuses.map(s=><option key={s} value={s}>{t.statusLabels[s]}</option>)}</select></label><label className="note-field">{t.note}<input value={item.admin_note||""} onChange={e=>setItems(old=>old.map(x=>x.id===item.id?{...x,admin_note:e.target.value}:x))} onBlur={e=>updateItem(item.id,{admin_note:e.target.value})} placeholder={lang==="fr"?"Ajouter une note interne…":"Add an internal note…"}/></label><button className="delete-btn" onClick={()=>deleteItem(item.id)} title={t.delete}><Trash2 size={16}/></button></div>
        </article>)}</div>}
      </div>
    </main>}

    {page === "qr" && <main className="qr-wrap"><button className="back-link" onClick={()=>setPage("dashboard")}><ArrowLeft size={16}/>{t.dashboard}</button><div className="qr-card"><div className="eyebrow dark-eyebrow">IPEIN / SHARE THE PLATFORM</div><h2>{t.qrTitle}</h2><p>{t.qrText}</p><div className="qr-frame" id="site-qr"><QRCodeSVG value={siteUrl} size={240} level="H" includeMargin bgColor="#ffffff" fgColor="#101b32"/></div><div className="qr-url">{siteUrl}</div><div className="qr-actions"><button className="primary-btn" onClick={downloadQr}><QrCode size={17}/>{t.download}</button><button className="outline-btn" onClick={()=>{void navigator.clipboard.writeText(siteUrl);}}>{t.copyLink}</button></div><div className="qr-tip"><ShieldCheck size={17}/>{lang==="fr"?"Le QR code ne doit être imprimé qu'après le déploiement du site.":"Only print the QR code after the website has been deployed."}</div></div></main>}

    <footer className="footer"><span>© 2026 IPEIN Student Voice</span><span>{t.footer}</span><button onClick={()=>setPage("login")}>{t.delegate} <ArrowRight size={13}/></button></footer>
  </div>;
}