import { useState } from 'react';
import { ABOUT_CARDS, FAQ_CATS, FAQS, SUPPORT_EMAIL } from '../lib/content';
import { useApp } from '../state/AppContext';

export function FaqBlock() {
  const [fq, setFq] = useState<string>('All');
  return (
    <>
      <div className="fcats">
        {FAQ_CATS.map((c) => (
          <button key={c} type="button" className={`chip${c === fq ? ' on' : ''}`} onClick={() => setFq(c)}>{c}</button>
        ))}
      </div>
      <div className="faq">
        {FAQS.filter((f) => fq === 'All' || f[0] === fq).map((f) => (
          <details key={f[1]}><summary>{f[1]}</summary><p>{f[2]}</p></details>
        ))}
      </div>
    </>
  );
}

export function ContactBlock() {
  const { toast } = useApp();
  const [n, setN] = useState('');
  const [e, setE] = useState('');
  const [m, setM] = useState('');

  const send = () => {
    if (!n.trim() || !/^\S+@\S+\.\S+$/.test(e.trim()) || m.trim().length < 5) {
      toast('Please add your name, a valid email and a message');
      return;
    }
    const body = `${m.trim()}\n\n— ${n.trim()} (${e.trim()})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Pamir AI enquiry from ' + n.trim())}&body=${encodeURIComponent(body)}`;
    toast('Opening your email app…');
    setN(''); setE(''); setM('');
  };

  return (
    <div className="row ct">
      <div className="cinfo">
        {[['📧', 'Email', SUPPORT_EMAIL], ['📍', 'Location', 'Islamabad, Pakistan'], ['🕘', 'Response time', '1–2 working days']].map((c) => (
          <div className="card cinf" key={c[1]}>
            <div className="ic">{c[0]}</div>
            <div><b>{c[1]}</b><br /><span className="mut">{c[2]}</span></div>
          </div>
        ))}
      </div>
      <div className="card">
        <label htmlFor="cn">Name</label>
        <input id="cn" placeholder="Your name" value={n} onChange={(x) => setN(x.target.value)} />
        <label htmlFor="ce">Email</label>
        <input id="ce" type="email" placeholder="you@example.com" value={e} onChange={(x) => setE(x.target.value)} />
        <label htmlFor="cm">Message</label>
        <textarea id="cm" rows={4} placeholder="How can we help?" value={m} onChange={(x) => setM(x.target.value)} />
        <button className="btn" type="button" onClick={send}>Send Message</button>
        <p className="mut small" style={{ marginTop: 10 }}>This opens your email app with the message ready to send.</p>
      </div>
    </div>
  );
}

export function AboutBlock() {
  return (
    <div className="row ab">
      <div>
        <p className="sub" style={{ fontSize: 17 }}>
          Pamir AI helps first-time Pakistani entrepreneurs evaluate China import opportunities: discovery, landed cost, viability, suppliers, RFQs and launch support in one workflow.
        </p>
        <p className="sub">Every estimate is labeled, every number is explained, and you stay in control of every decision.</p>
      </div>
      <div className="g2">
        {ABOUT_CARDS.map((a) => (
          <div className="card lift" key={a[1]}>
            <div className="ic">{a[0]}</div>
            <b>{a[1]}</b>
            <p className="sub" style={{ margin: '4px 0 0', fontSize: 13 }}>{a[2]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
