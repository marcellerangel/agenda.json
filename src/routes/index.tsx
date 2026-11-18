import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import agenda from "@/data/agenda.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agendas Rio Radical — Rapel, trilhas e expedições" },
      { name: "description", content: "Agenda de eventos da Rio Radical: rapel, trilhas e expedições com saída marcada no Rio de Janeiro." },
      { property: "og:title", content: "Agendas Rio Radical" },
      { property: "og:description", content: "Rapel, trilhas e expedições com saída marcada. Vagas limitadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Ev = { data: string; fim?: string; nome: string; obs?: string };
type Grupo = { destaque?: boolean; eventos: Ev[] };

const WD = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MON = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WA = "https://wa.me/5521981639455?text=Ol%C3%A1!%20Vi%20a%20agenda%20da%20Rio%20Radical%20e%20quero%20reservar.";
const SITE = "https://www.rioradical.rio.br";

const parse = (s: string) => { const [y = 0, m = 1, d = 1] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const pad = (n: number) => String(n).padStart(2, "0");
const dm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
function chip(e: Ev) {
  const d = parse(e.data);
  if (!e.fim) return `${WD[d.getDay()]} ${dm(d)}`;
  const f = parse(e.fim);
  return `${WD[d.getDay()]}-${WD[f.getDay()]} ${pad(d.getDate())}–${pad(f.getDate())}/${pad(d.getMonth() + 1)}`;
}

const TABS: [string, string][] = [
  ...agenda.meses.map((m) => [m.id, m.aba] as [string, string]),
  ["expedicoes", "Expedições"],
  ["todos-os-dias", "Todos os dias"],
];

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}

function Index() {
  const [today, setToday] = useState<Date | null>(null);
  const [tab, setTab] = useState(TABS[0]![0]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = new Date();
    const td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    setToday(td);
    const firstOpen = () =>
      agenda.meses.find((m) => (m.finaisDeSemana as Grupo[]).some((g) => g.eventos.some((e) => parse(e.fim || e.data) >= td)))?.id ??
      agenda.meses[agenda.meses.length - 1]!.id;
    const sync = () => {
      const h = location.hash.replace("#", "");
      setTab(TABS.some((x) => x[0] === h) ? h : firstOpen());
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const copy = (txt: string) =>
    navigator.clipboard?.writeText(txt).then(() => setMsg("Copiado."), () => setMsg("Selecione e copie pelo menu do aparelho."));

  const mes = agenda.meses.find((m) => m.id === tab);

  return (
    <div className="rr-vars rr">
      <header>
        <div className="in">
          <div className="kicker">Rio Radical</div>
          <h1>Agendas <span>Rio Radical</span></h1>
          <p className="sub">Rapel, trilhas e expedições com saída marcada. Vagas limitadas em cada evento.</p>
          <div className="hbtns">
            <a className="site" href={SITE} target="_blank" rel="noopener">www.rioradical.rio.br →</a>
            <a className="wabtn" href={WA} target="_blank" rel="noopener"><WaIcon />Chamar no WhatsApp</a>
          </div>
        </div>
      </header>

      <div className="wrap">
        <nav role="tablist" aria-label="Agendas">
          {TABS.map(([k, l]) => (
            <button key={k} className="tab" type="button" role="tab" aria-selected={tab === k}
              onClick={() => { location.hash = k; setTab(k); }}>{l}</button>
          ))}
        </nav>

        <main key={tab}>
          {mes && (
            <section className="panel">
              <h2 style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 800 }}>{mes.titulo}</h2>
              <p className="lead">{mes.descricao}</p>
              {(mes.finaisDeSemana as Grupo[]).map((g, i) => {
                const first = parse(g.eventos[0]!.data);
                const le = g.eventos[g.eventos.length - 1]!;
                const last = parse(le.fim || le.data);
                const a = first.getDate(), b = last.getDate();
                return (
                  <div className="group" key={i}>
                    <div className="gdate">
                      <b>{a === b ? pad(a) : `${pad(a)}–${pad(b)}`}</b>
                      <small>{a === b ? `${WD[first.getDay()]} · ${MON[first.getMonth()]}` : `Fim de semana · ${MON[first.getMonth()]}`}</small>
                    </div>
                    <div className="events">
                      {g.eventos.map((e, j) => {
                        const past = !!today && parse(e.fim || e.data) < today;
                        return (
                          <div key={j} className={`ev${past ? " past" : ""}${g.destaque ? " star" : ""}`}>
                            <span className="d">{chip(e)}</span>
                            <span className="n">{e.nome}{(e.obs || past) && <span className="t">{e.obs}</span>}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
          {tab === "expedicoes" && (
            <section className="panel">
              <h2 style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 800 }}>Próximas expedições</h2>
              <p className="lead">Expedições abertas com saída marcada.</p>
              <div className="cards">
                {(agenda.expedicoes as { nome: string; inicio: string; fim?: string; preco: number; obs?: string }[]).map((x) => {
                  const s = parse(x.inicio);
                  const days = today ? Math.round((s.getTime() - today.getTime()) / 86400000) : null;
                  const when = x.fim
                    ? `${WD[s.getDay()]} ${pad(s.getDate())}–${pad(parse(x.fim).getDate())}/${pad(s.getMonth() + 1)}/${s.getFullYear()}`
                    : `${WD[s.getDay()]} ${dm(s)}/${s.getFullYear()}`;
                  return (
                    <article className="card" key={x.nome}>
                      <span className="soon">{days === null ? "\u00a0" : days > 0 ? `Em ${days} dias` : "Em andamento"}</span>
                      <h3>{x.nome}</h3>
                      <div className="when">{when}</div>
                      <div className="price">a partir de <b>R$ {x.preco.toLocaleString("pt-BR")}</b> por pessoa</div>
                      {x.obs && <p className="note">{x.obs}</p>}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
          {tab === "todos-os-dias" && (
            <section className="panel">
              <h2 style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 800 }}>Disponíveis todos os dias</h2>
              <p className="lead">Atividades com saída diária, de aventura a passeios pelo Rio. Estas e outras estão no site.</p>
              <ul className="daily">{agenda.todosOsDias.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          )}
        </main>

        <div className="cta">
          <p>Reserve sua vaga pelo site ou chame no WhatsApp.<small>Descontos exclusivos para cariocas e aniversariantes.</small></p>
          <a className="site" href={SITE} target="_blank" rel="noopener">Reservar no site</a>
        </div>

        <footer>
          <div className="contacts">
            <div className="crow"><span className="lab">Site</span><a className="val" href={SITE} target="_blank" rel="noopener">www.rioradical.rio.br</a></div>
            <div className="crow"><span className="lab">WhatsApp</span><span className="val">+55 21 98163-9455</span>
              <a className="wa" href="https://wa.me/5521981639455" target="_blank" rel="noopener">Abrir conversa</a>
              <button className="btn" type="button" onClick={() => copy("+55 21 98163-9455")}>Copiar</button></div>
            <div className="crow"><span className="lab">E-mail</span><span className="val">contato@rioradical.tur.br</span>
              <button className="btn" type="button" onClick={() => copy("contato@rioradical.tur.br")}>Copiar</button></div>
            <span className="msg" role="status">{msg}</span>
          </div>
          Rio Radical Experiências Turísticas Ltda · CNPJ 69.278.674/0001-59
        </footer>
      </div>

      <a className="wabtn wafloat" href={WA} target="_blank" rel="noopener" aria-label="Chamar no WhatsApp"><WaIcon />WhatsApp</a>
    </div>
  );
}
