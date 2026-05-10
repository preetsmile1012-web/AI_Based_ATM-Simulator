import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
import { useState, useEffect } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const genCard = () => {
  const base = 44502428700000000n;
  const rand = BigInt(Math.floor(Math.random() * 90000000));
  return String(base + rand);
};
const genPin = () => String(Math.floor(1000 + Math.random() * 9000));
const genForm = () => String(Math.floor(1000 + Math.random() * 9000));
const fmt = (n) => n.toString().replace(/\B(?=(\d{4})+(?!\d))/g, " ");

// ── tiny DB (in-memory) ───────────────────────────────────────────────────────
const DB = {
  users: [],          // { formNo, personal, additional, account }
  logins: [],         // { formNo, cardNum, pinNum }
  transactions: [],   // { pin, date, type, amount }

  signup(personal, additional, accountType, facilities) {
    const formNo = genForm();
    const cardNum = genCard();
    const pinNum = genPin();
    this.users.push({ formNo, personal, additional, account: { accountType, cardNum, pinNum, facilities } });
    this.logins.push({ formNo, cardNum, pinNum });
    this.transactions.push({ pin: pinNum, date: new Date(), type: "Deposit", amount: 0 });
    return { cardNum, pinNum };
  },

  login(cardNum, pinNum) {
    return this.logins.find(l => l.cardNum === cardNum && l.pinNum === pinNum) || null;
  },

  balance(pin) {
    return this.transactions
      .filter(t => t.pin === pin)
      .reduce((acc, t) => t.type === "Deposit" ? acc + t.amount : acc - t.amount, 0);
  },

  deposit(pin, amount) {
    this.transactions.push({ pin, date: new Date(), type: "Deposit", amount });
  },

  withdraw(pin, amount) {
    this.transactions.push({ pin, date: new Date(), type: "Withdraw", amount });
  },

  changePin(oldPin, newPin) {
    this.logins.forEach(l => { if (l.pinNum === oldPin) l.pinNum = newPin; });
    this.transactions.forEach(t => { if (t.pin === oldPin) t.pin = newPin; });
    const user = this.users.find(u => u.account.pinNum === oldPin);
    if (user) user.account.pinNum = newPin;
  },

  history(pin) {
    return this.transactions.filter(t => t.pin === pin && t.amount > 0).slice(-6).reverse();
  }
};

// ── styles ────────────────────────────────────────────────────────────────────
const S = {
  wrap: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0a0a0f 0%,#0d1117 50%,#0a0f1a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Courier New', Courier, monospace",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  machine: {
    width: 420,
    background: "linear-gradient(160deg,#1c1c2e 0%,#16213e 100%)",
    borderRadius: 24,
    boxShadow: "0 0 60px rgba(0,200,255,0.15), 0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
    border: "1px solid rgba(0,200,255,0.15)",
    overflow: "hidden",
    position: "relative",
  },
  header: {
    background: "linear-gradient(90deg,#0f3460,#16213e)",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid rgba(0,200,255,0.2)",
  },
  bankName: {
    color: "#00c8ff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  bankSub: { color: "rgba(0,200,255,0.5)", fontSize: 9, letterSpacing: 2 },
  screen: {
    margin: "16px",
    background: "#0a1628",
    borderRadius: 12,
    border: "2px solid rgba(0,200,255,0.2)",
    minHeight: 340,
    padding: "20px",
    position: "relative",
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,200,255,0.05)",
  },
  screenTitle: {
    color: "#00c8ff",
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.7,
  },
  label: { color: "rgba(0,200,255,0.6)", fontSize: 11, marginBottom: 4, letterSpacing: 1 },
  input: {
    width: "100%",
    background: "rgba(0,200,255,0.05)",
    border: "1px solid rgba(0,200,255,0.25)",
    borderRadius: 6,
    color: "#00c8ff",
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    marginBottom: 14,
    boxSizing: "border-box",
    transition: "border-color .2s",
  },
  select: {
    width: "100%",
    background: "#0d1f3c",
    border: "1px solid rgba(0,200,255,0.25)",
    borderRadius: 6,
    color: "#00c8ff",
    padding: "10px 12px",
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
    marginBottom: 14,
    boxSizing: "border-box",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg,#0077b6,#00b4d8)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 2,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 4,
    transition: "opacity .2s, transform .1s",
  },
  btnSecondary: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "1px solid rgba(0,200,255,0.3)",
    borderRadius: 8,
    color: "rgba(0,200,255,0.7)",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 8,
    letterSpacing: 1,
    transition: "background .2s",
  },
  btnGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 },
  btnTxn: {
    padding: "14px 8px",
    background: "rgba(0,200,255,0.07)",
    border: "1px solid rgba(0,200,255,0.2)",
    borderRadius: 8,
    color: "#00c8ff",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "center",
    transition: "background .2s, transform .1s",
  },
  btnFast: {
    padding: "12px 6px",
    background: "rgba(0,100,180,0.15)",
    border: "1px solid rgba(0,150,255,0.25)",
    borderRadius: 6,
    color: "#66d9ff",
    fontSize: 13,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .2s",
  },
  msg: { color: "#00c8ff", fontSize: 12, textAlign: "center", padding: "8px 0" },
  error: { color: "#ff4d6d", fontSize: 11, marginBottom: 8, textAlign: "center" },
  success: { color: "#06d6a0", fontSize: 12, textAlign: "center", padding: "10px", background: "rgba(6,214,160,0.1)", borderRadius: 6, marginBottom: 10 },
  balBig: { color: "#06d6a0", fontSize: 36, fontWeight: "bold", textAlign: "center", padding: "20px 0 4px", letterSpacing: 2 },
  balSub: { color: "rgba(0,200,255,0.4)", fontSize: 11, textAlign: "center", letterSpacing: 2, marginBottom: 16 },
  divider: { borderColor: "rgba(0,200,255,0.1)", margin: "14px 0" },
  cardDisplay: {
    background: "rgba(0,200,255,0.05)",
    border: "1px solid rgba(0,200,255,0.15)",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 10,
    color: "#00c8ff",
    fontSize: 13,
    letterSpacing: 2,
  },
  step: {
    color: "rgba(0,200,255,0.35)",
    fontSize: 9,
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 10,
  },
  histRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "7px 0",
    borderBottom: "1px solid rgba(0,200,255,0.08)",
    fontSize: 11,
  },
  histType: (t) => ({ color: t === "Deposit" ? "#06d6a0" : "#ff6b8a", fontWeight: "bold", letterSpacing: 1 }),
  histAmt: (t) => ({ color: t === "Deposit" ? "#06d6a0" : "#ff6b8a" }),
  ledLights: {
    display: "flex", gap: 6, padding: "10px 24px",
    borderTop: "1px solid rgba(0,200,255,0.1)",
    justifyContent: "flex-end",
  },
  led: (c) => ({
    width: 8, height: 8, borderRadius: "50%",
    background: c, boxShadow: `0 0 6px ${c}`,
  }),
  radioGroup: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  radioBtn: (sel) => ({
    display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
    color: sel ? "#00c8ff" : "rgba(0,200,255,0.4)", fontSize: 11, fontWeight: sel ? "bold" : "normal",
  }),
  checkGroup: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 },
  checkItem: (sel) => ({
    display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
    color: sel ? "#00c8ff" : "rgba(0,200,255,0.35)", fontSize: 10,
    padding: "4px 0",
  }),
  pinDots: {
    display: "flex", gap: 12, justifyContent: "center",
    padding: "14px 0 20px",
  },
  dot: (filled) => ({
    width: 14, height: 14, borderRadius: "50%",
    background: filled ? "#00c8ff" : "transparent",
    border: "2px solid rgba(0,200,255,0.4)",
    boxShadow: filled ? "0 0 8px #00c8ff" : "none",
    transition: "all .15s",
  }),
  numPad: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8, marginTop: 8,
  },
  numKey: {
    padding: "12px",
    background: "rgba(0,200,255,0.06)",
    border: "1px solid rgba(0,200,255,0.15)",
    borderRadius: 8,
    color: "#00c8ff",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "center",
    transition: "background .15s",
  },
};

// ── Reusable Input ────────────────────────────────────────────────────────────
const Field = ({ label, ...props }) => (
  <div>
    <div style={S.label}>{label}</div>
    <input style={S.input} {...props} />
  </div>
);

// ── Toast/Modal ───────────────────────────────────────────────────────────────
const Toast = ({ msg, type = "info", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  const colors = { info: "#00c8ff", success: "#06d6a0", error: "#ff4d6d" };
  return (
    <div style={{
      position: "fixed", top: 30, left: "50%", transform: "translateX(-50%)",
      background: "#0a1628", border: `1px solid ${colors[type]}`,
      color: colors[type], padding: "14px 28px", borderRadius: 10,
      fontSize: 13, letterSpacing: 1, boxShadow: `0 0 20px ${colors[type]}40`,
      zIndex: 999, textAlign: "center", maxWidth: 340,
      animation: "fadeIn .2s ease",
    }}>
      {msg}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════════════════

// ── Login ─────────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, onSignup }) => {
  const [card, setCard] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    setErr("");
    const rec = DB.login(card.trim(), pin.trim());
    if (rec) onLogin(rec.pinNum);
    else setErr("❌ Incorrect card number or PIN");
  };

  return (
    <div>
      <div style={S.screenTitle}>◈ SECURE LOGIN ◈</div>
      {err && <div style={S.error}>{err}</div>}
      <Field label="CARD NUMBER" value={card} onChange={e => setCard(e.target.value)} placeholder="Enter 17-digit card number" />
      <Field label="PIN" type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="●●●●" />
      <button style={S.btnPrimary} onClick={handle}>SIGN IN</button>
      <button style={S.btnSecondary} onClick={() => { setCard(""); setPin(""); }}>CLEAR</button>
      <button style={{ ...S.btnSecondary, marginTop: 16, borderColor: "rgba(0,200,255,0.15)", fontSize: 10, letterSpacing: 2 }} onClick={onSignup}>
        NEW USER? SIGN UP →
      </button>
    </div>
  );
};

// ── Signup Step 1 ─────────────────────────────────────────────────────────────
const Signup1 = ({ onNext, onBack }) => {
  const [f, setF] = useState({ name: "", father: "", dob: "", gender: "", email: "", address: "", city: "", state: "", pincode: "" });
  const [err, setErr] = useState("");
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const handle = () => {
    if (!f.name || !f.email || !f.gender) { setErr("Please fill required fields (Name, Email, Gender)"); return; }
    setErr("");
    onNext(f);
  };

  return (
    <div style={{ overflowY: "auto", maxHeight: 320 }}>
      <div style={S.step}>STEP 1 OF 3 — PERSONAL DETAILS</div>
      {err && <div style={S.error}>{err}</div>}
      <Field label="FULL NAME *" value={f.name} onChange={set("name")} placeholder="Your name" />
      <Field label="FATHER'S NAME" value={f.father} onChange={set("father")} />
      <Field label="DATE OF BIRTH" type="date" value={f.dob} onChange={set("dob")} />
      <div style={S.label}>GENDER *</div>
      <div style={S.radioGroup}>
        {["MALE", "FEMALE", "OTHER"].map(g => (
          <label key={g} style={S.radioBtn(f.gender === g)}>
            <input type="radio" name="gender" value={g} checked={f.gender === g} onChange={set("gender")} style={{ accentColor: "#00c8ff" }} />
            {g}
          </label>
        ))}
      </div>
      <Field label="EMAIL ADDRESS *" type="email" value={f.email} onChange={set("email")} />
      <Field label="ADDRESS" value={f.address} onChange={set("address")} />
      <Field label="CITY" value={f.city} onChange={set("city")} />
      <Field label="STATE" value={f.state} onChange={set("state")} />
      <Field label="PIN CODE" value={f.pincode} onChange={set("pincode")} maxLength={6} />
      <button style={S.btnPrimary} onClick={handle}>NEXT →</button>
      <button style={S.btnSecondary} onClick={onBack}>← BACK TO LOGIN</button>
    </div>
  );
};

// ── Signup Step 2 ─────────────────────────────────────────────────────────────
const Signup2 = ({ onNext, onBack }) => {
  const [f, setF] = useState({ religion: "HINDU", category: "GENERAL", income: "", existAccount: "", occupation: "", pan: "", aadhar: "", mobile: "", senior: "" });
  const set = k => e => setF({ ...f, [k]: e.target.value });

  return (
    <div style={{ overflowY: "auto", maxHeight: 320 }}>
      <div style={S.step}>STEP 2 OF 3 — ADDITIONAL DETAILS</div>
      <div style={S.label}>RELIGION</div>
      <select style={S.select} value={f.religion} onChange={set("religion")}>
        {["HINDU", "MUSLIM", "SIKH", "CHRISTIAN", "OTHERS"].map(r => <option key={r}>{r}</option>)}
      </select>
      <div style={S.label}>CATEGORY</div>
      <select style={S.select} value={f.category} onChange={set("category")}>
        {["GENERAL", "SC", "BC-A", "BC-B", "OBC", "ST"].map(c => <option key={c}>{c}</option>)}
      </select>
      <Field label="ANNUAL INCOME (₹)" value={f.income} onChange={set("income")} placeholder="e.g. 240000" />
      <div style={S.label}>EXISTING ACCOUNT?</div>
      <div style={S.radioGroup}>
        {["YES", "NO"].map(v => (
          <label key={v} style={S.radioBtn(f.existAccount === v)}>
            <input type="radio" name="exist" value={v} checked={f.existAccount === v} onChange={set("existAccount")} style={{ accentColor: "#00c8ff" }} />
            {v}
          </label>
        ))}
      </div>
      <Field label="OCCUPATION" value={f.occupation} onChange={set("occupation")} />
      <Field label="PAN NUMBER" value={f.pan} onChange={set("pan")} maxLength={10} />
      <Field label="AADHAR NUMBER" value={f.aadhar} onChange={set("aadhar")} maxLength={12} />
      <Field label="MOBILE NUMBER" value={f.mobile} onChange={set("mobile")} maxLength={10} />
      <div style={S.label}>SENIOR CITIZEN?</div>
      <div style={S.radioGroup}>
        {["YES", "NO"].map(v => (
          <label key={v} style={S.radioBtn(f.senior === v)}>
            <input type="radio" name="senior" value={v} checked={f.senior === v} onChange={set("senior")} style={{ accentColor: "#00c8ff" }} />
            {v}
          </label>
        ))}
      </div>
      <button style={S.btnPrimary} onClick={() => onNext(f)}>NEXT →</button>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── Signup Step 3 ─────────────────────────────────────────────────────────────
const Signup3 = ({ p1, p2, onDone, onBack }) => {
  const [accountType, setAccountType] = useState("SAVING ACCOUNT");
  const [facilities, setFacilities] = useState([]);
  const [done, setDone] = useState(null);

  const facilityList = ["DEBIT CARD", "INTERNET BANKING", "E-MAIL & SMS ALERT", "MOBILE BANKING", "CHEQUE BOOK", "E-STATEMENT"];
  const togFac = f => setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handle = () => {
    const result = DB.signup(p1, p2, accountType, facilities);
    setDone(result);
  };

  if (done) return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "#06d6a0", fontSize: 28, marginBottom: 8 }}>✓</div>
      <div style={{ color: "#06d6a0", fontSize: 13, letterSpacing: 2, marginBottom: 20 }}>SIGNUP COMPLETE</div>
      <div style={S.cardDisplay}>
        <div style={{ fontSize: 10, color: "rgba(0,200,255,0.4)", marginBottom: 8 }}>YOUR CREDENTIALS</div>
        <div style={{ fontSize: 10, marginBottom: 4, opacity: 0.6 }}>CARD NUMBER</div>
        <div style={{ fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>{fmt(done.cardNum)}</div>
        <div style={{ fontSize: 10, marginBottom: 4, opacity: 0.6 }}>PIN</div>
        <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 6 }}>{done.pinNum}</div>
        <div style={{ fontSize: 9, marginTop: 10, color: "#ff4d6d", opacity: 0.7 }}>⚠ MEMORISE AND DO NOT SHARE</div>
      </div>
      <button style={S.btnPrimary} onClick={() => onDone()}>→ PROCEED TO LOGIN</button>
    </div>
  );

  return (
    <div style={{ overflowY: "auto", maxHeight: 320 }}>
      <div style={S.step}>STEP 3 OF 3 — ACCOUNT DETAILS</div>
      <div style={S.label}>ACCOUNT TYPE</div>
      <div style={S.radioGroup}>
        {["SAVING ACCOUNT", "CURRENT ACCOUNT", "RECURRING DEPOSIT ACCOUNT", "FIXED DEPOSIT ACCOUNT"].map(t => (
          <label key={t} style={S.radioBtn(accountType === t)}>
            <input type="radio" name="acct" value={t} checked={accountType === t} onChange={() => setAccountType(t)} style={{ accentColor: "#00c8ff" }} />
            {t}
          </label>
        ))}
      </div>
      <div style={S.label}>SERVICES REQUIRED</div>
      <div style={S.checkGroup}>
        {facilityList.map(f => (
          <label key={f} style={S.checkItem(facilities.includes(f))}>
            <input type="checkbox" checked={facilities.includes(f)} onChange={() => togFac(f)} style={{ accentColor: "#00c8ff" }} />
            {f}
          </label>
        ))}
      </div>
      <button style={S.btnPrimary} onClick={handle}>SUBMIT & CREATE ACCOUNT</button>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── Transaction Menu ──────────────────────────────────────────────────────────
const TxnMenu = ({ pin, onSelect, onExit }) => {
  const bal = DB.balance(pin);
  return (
    <div>
      <div style={S.screenTitle}>SELECT TRANSACTION</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: "rgba(0,200,255,0.4)", fontSize: 9, letterSpacing: 2 }}>AVAILABLE BALANCE</div>
        <div style={{ color: "#06d6a0", fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>₹ {bal.toLocaleString()}</div>
      </div>
      <div style={S.btnGrid}>
        {[
          ["DEPOSIT", "deposit"],
          ["CASH WITHDRAWAL", "withdraw"],
          ["FAST CASH", "fastcash"],
          ["BALANCE ENQUIRY", "balance"],
          ["PIN CHANGE", "pinchange"],
          ["MINI STATEMENT", "statement"],
        ].map(([lbl, key]) => (
          <button key={key} style={S.btnTxn} onClick={() => onSelect(key)}
            onMouseEnter={e => e.target.style.background = "rgba(0,200,255,0.14)"}
            onMouseLeave={e => e.target.style.background = "rgba(0,200,255,0.07)"}>
            {lbl}
          </button>
        ))}
      </div>
      <button style={{ ...S.btnSecondary, marginTop: 16, color: "#ff6b8a", borderColor: "rgba(255,100,100,0.2)" }}
        onClick={onExit}>EXIT SESSION</button>
    </div>
  );
};

// ── Deposit ───────────────────────────────────────────────────────────────────
const DepositScreen = ({ pin, onBack, showToast }) => {
  const [amt, setAmt] = useState("");
  const handle = () => {
    const n = parseInt(amt);
    if (!n || n <= 0) { showToast("Enter a valid amount", "error"); return; }
    DB.deposit(pin, n);
    showToast(`₹${n.toLocaleString()} DEPOSITED SUCCESSFULLY`, "success");
    setAmt("");
  };
  return (
    <div>
      <div style={S.screenTitle}>◈ DEPOSIT ◈</div>
      <Field label="ENTER AMOUNT (₹)" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
      <button style={S.btnPrimary} onClick={handle}>DEPOSIT</button>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── Withdraw ──────────────────────────────────────────────────────────────────
const WithdrawScreen = ({ pin, onBack, showToast }) => {
  const [amt, setAmt] = useState("");
  const handle = () => {
    const n = parseInt(amt);
    if (!n || n <= 0) { showToast("Enter a valid amount", "error"); return; }
    if (DB.balance(pin) < n) { showToast("INSUFFICIENT BALANCE", "error"); return; }
    DB.withdraw(pin, n);
    showToast(`₹${n.toLocaleString()} WITHDRAWN SUCCESSFULLY`, "success");
    setAmt("");
  };
  return (
    <div>
      <div style={S.screenTitle}>◈ CASH WITHDRAWAL ◈</div>
      <div style={{ color: "rgba(0,200,255,0.4)", fontSize: 10, marginBottom: 12, textAlign: "center" }}>
        BAL: ₹{DB.balance(pin).toLocaleString()}
      </div>
      <Field label="ENTER AMOUNT (₹)" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
      <button style={S.btnPrimary} onClick={handle}>WITHDRAW</button>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── Fast Cash ─────────────────────────────────────────────────────────────────
const FastCashScreen = ({ pin, onBack, showToast }) => {
  const amounts = [100, 500, 1000, 2000, 5000, 10000];
  const handle = n => {
    if (DB.balance(pin) < n) { showToast("INSUFFICIENT BALANCE", "error"); return; }
    DB.withdraw(pin, n);
    showToast(`₹${n.toLocaleString()} WITHDRAWN SUCCESSFULLY`, "success");
  };
  return (
    <div>
      <div style={S.screenTitle}>◈ FAST CASH ◈</div>
      <div style={{ ...S.btnGrid, gap: 10 }}>
        {amounts.map(a => (
          <button key={a} style={S.btnFast} onClick={() => handle(a)}
            onMouseEnter={e => e.target.style.background = "rgba(0,150,255,0.25)"}
            onMouseLeave={e => e.target.style.background = "rgba(0,100,180,0.15)"}>
            ₹ {a.toLocaleString()}
          </button>
        ))}
      </div>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── Balance ───────────────────────────────────────────────────────────────────
const BalanceScreen = ({ pin, onBack }) => {
  const bal = DB.balance(pin);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={S.screenTitle}>◈ BALANCE ENQUIRY ◈</div>
      <div style={{ color: "rgba(0,200,255,0.4)", fontSize: 10, letterSpacing: 2, marginTop: 20 }}>AVAILABLE BALANCE</div>
      <div style={S.balBig}>₹ {bal.toLocaleString()}</div>
      <div style={S.balSub}>RUPEES {bal === 0 ? "ZERO" : bal.toLocaleString()}</div>
      <div style={{ color: "rgba(0,200,255,0.3)", fontSize: 9, marginBottom: 20 }}>
        AS OF {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </div>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── Mini Statement ────────────────────────────────────────────────────────────
const StatementScreen = ({ pin, onBack }) => {
  const hist = DB.history(pin);
  return (
    <div>
      <div style={S.screenTitle}>◈ MINI STATEMENT ◈</div>
      {hist.length === 0
        ? <div style={S.msg}>No transactions yet.</div>
        : hist.map((t, i) => (
          <div key={i} style={S.histRow}>
            <div style={S.histType(t.type)}>{t.type === "Deposit" ? "▲ CR" : "▼ DR"}</div>
            <div style={{ color: "rgba(0,200,255,0.4)", fontSize: 10 }}>
              {new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </div>
            <div style={S.histAmt(t.type)}>₹ {t.amount.toLocaleString()}</div>
          </div>
        ))
      }
      <div style={{ ...S.histRow, borderBottom: "none", paddingTop: 10 }}>
        <div style={{ color: "rgba(0,200,255,0.4)", fontSize: 10 }}>CURRENT BALANCE</div>
        <div style={{ color: "#06d6a0", fontWeight: "bold" }}>₹ {DB.balance(pin).toLocaleString()}</div>
      </div>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ── PIN Change ────────────────────────────────────────────────────────────────
const PinChangeScreen = ({ pin, onPinChanged, onBack, showToast }) => {
  const [step, setStep] = useState("new"); // new | confirm
  const [newPin, setNewPin] = useState("");
  const [rePin, setRePin] = useState("");
  const current = step === "new" ? newPin : rePin;
  const setC = step === "new" ? setNewPin : setRePin;

  const press = k => {
    if (k === "DEL") { setC(p => p.slice(0, -1)); return; }
    if (current.length < 4) setC(p => p + k);
  };

  const next = () => {
    if (newPin.length < 4) { showToast("Enter 4-digit PIN", "error"); return; }
    if (step === "new") { setStep("confirm"); return; }
    if (newPin !== rePin) { showToast("PINs do not match", "error"); setRePin(""); setStep("new"); setNewPin(""); return; }
    DB.changePin(pin, newPin);
    showToast("PIN CHANGED SUCCESSFULLY", "success");
    onPinChanged(newPin);
  };

  return (
    <div>
      <div style={S.screenTitle}>◈ CHANGE PIN ◈</div>
      <div style={{ color: "rgba(0,200,255,0.5)", fontSize: 10, textAlign: "center", marginBottom: 4, letterSpacing: 2 }}>
        {step === "new" ? "ENTER NEW PIN" : "RE-ENTER NEW PIN"}
      </div>
      <div style={S.pinDots}>
        {[0, 1, 2, 3].map(i => <div key={i} style={S.dot(i < current.length)} />)}
      </div>
      <div style={S.numPad}>
        {["1","2","3","4","5","6","7","8","9","DEL","0","OK"].map(k => (
          <button key={k} style={{ ...S.numKey, color: k === "DEL" ? "#ff6b8a" : k === "OK" ? "#06d6a0" : "#00c8ff" }}
            onClick={() => k === "OK" ? next() : press(k)}
            onMouseEnter={e => e.target.style.background = "rgba(0,200,255,0.14)"}
            onMouseLeave={e => e.target.style.background = "rgba(0,200,255,0.06)"}>
            {k}
          </button>
        ))}
      </div>
      <button style={S.btnSecondary} onClick={onBack}>← BACK</button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("login");
  const [pin, setPin] = useState(null);
  const [signup1, setSignup1] = useState(null);
  const [signup2, setSignup2] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  // pre-load a demo account
  useEffect(() => {
    const { pinNum } = DB.signup(
      { name: "DEMO USER", gender: "MALE", email: "demo@atm.in", city: "New Delhi", state: "Delhi" },
      { religion: "OTHER", category: "GENERAL", income: "500000", occupation: "ENGINEER", mobile: "9999999999" },
      "SAVING ACCOUNT",
      ["DEBIT CARD", "INTERNET BANKING"]
    );
    DB.deposit(pinNum, 25000);
    DB.withdraw(pinNum, 5000);
    DB.deposit(pinNum, 10000);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen onLogin={p => { setPin(p); setScreen("txnmenu"); }} onSignup={() => setScreen("signup1")} />;
      case "signup1":
        return <Signup1 onNext={d => { setSignup1(d); setScreen("signup2"); }} onBack={() => setScreen("login")} />;
      case "signup2":
        return <Signup2 onNext={d => { setSignup2(d); setScreen("signup3"); }} onBack={() => setScreen("signup1")} />;
      case "signup3":
        return <Signup3 p1={signup1} p2={signup2} onDone={() => setScreen("login")} onBack={() => setScreen("signup2")} />;
      case "txnmenu":
        return <TxnMenu pin={pin} onSelect={setScreen} onExit={() => { setPin(null); setScreen("login"); }} />;
      case "deposit":
        return <DepositScreen pin={pin} onBack={() => setScreen("txnmenu")} showToast={showToast} />;
      case "withdraw":
        return <WithdrawScreen pin={pin} onBack={() => setScreen("txnmenu")} showToast={showToast} />;
      case "fastcash":
        return <FastCashScreen pin={pin} onBack={() => setScreen("txnmenu")} showToast={showToast} />;
      case "balance":
        return <BalanceScreen pin={pin} onBack={() => setScreen("txnmenu")} />;
      case "statement":
        return <StatementScreen pin={pin} onBack={() => setScreen("txnmenu")} />;
      case "pinchange":
        return <PinChangeScreen pin={pin} onPinChanged={np => { setPin(np); setScreen("txnmenu"); }} onBack={() => setScreen("txnmenu")} showToast={showToast} />;
      default:
        return null;
    }
  };

  return (
    <div style={S.wrap}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px) translateX(-50%); } to { opacity:1; transform:translateY(0) translateX(-50%); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:rgba(0,200,255,0.2); border-radius:4px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={S.machine}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0077b6,#00b4d8)", borderRadius: 8, display:"flex",alignItems:"center",justifyContent:"center", fontSize:16 }}>◈</div>
          <div>
            <div style={S.bankName}>NeoBank ATM</div>
            <div style={S.bankSub}>AUTOMATED TELLER MACHINE</div>
          </div>
          <div style={{ marginLeft: "auto", display:"flex", gap:4 }}>
            <div style={S.led("#06d6a0")} />
            <div style={S.led("#00c8ff")} />
          </div>
        </div>

        {/* Screen */}
        <div style={S.screen}>
          {/* Screen glow overlay */}
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(0,200,255,0.03),transparent 70%)", borderRadius:10, pointerEvents:"none" }} />
          {renderScreen()}
        </div>

        {/* Card slot decoration */}
        <div style={{ display:"flex", alignItems:"center", padding:"8px 24px", gap:10 }}>
          <div style={{ flex:1, height:1, background:"rgba(0,200,255,0.1)" }} />
          <div style={{ fontSize:9, color:"rgba(0,200,255,0.25)", letterSpacing:3 }}>CARD SLOT</div>
          <div style={{ flex:1, height:1, background:"rgba(0,200,255,0.1)" }} />
        </div>
        <div style={{ margin:"0 24px 8px", height:6, background:"rgba(0,0,0,0.4)", borderRadius:2, border:"1px solid rgba(0,200,255,0.08)" }} />

        {/* LED strip */}
        <div style={S.ledLights}>
          {["#06d6a0","#00c8ff","#ffd60a","#ff4d6d"].map((c,i) => <div key={i} style={S.led(c)} />)}
        </div>
      </div>

      {/* Demo hint */}
      <div style={{ position:"fixed", bottom:16, left:"50%", transform:"translateX(-50%)", color:"rgba(0,200,255,0.3)", fontSize:10, letterSpacing:2, textAlign:"center" }}>
        DEMO ACCOUNT PRE-LOADED — CHECK SIGNUP FOR YOUR OWN ACCOUNT
      </div>
    </div>