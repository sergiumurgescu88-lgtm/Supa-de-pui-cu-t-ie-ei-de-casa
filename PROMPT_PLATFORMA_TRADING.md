# 🤖 PROMPT COMPLET — Platformă Trading AI Agent
**Folosește acest prompt pentru a construi platforma cu orice AI (Claude, GPT-4, Gemini etc.)**

---

## PROMPT PRINCIPAL

```
Ești un dezvoltator full-stack expert specializat în platforme de trading algoritmice.

Construiește o platformă web completă de tip "Trading Dashboard" pentru un agent AI
de trading automat (bazat pe Freqtrade + Binance API).

═══════════════════════════════════════════
CONTEXT TEHNIC
═══════════════════════════════════════════

Agentul AI existent:
- Framework: Freqtrade (Python)
- Exchange: Binance Futures (USDT-M)
- Strategii: EMA Crossover, RSI Mean Reversion, Breakout ATR, 
             MTF Trend Following, Smart Combo Score
- API disponibil: Freqtrade REST API (port 8080, JWT auth)
- Capital initial: 1000 EUR
- Perechi: BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT

═══════════════════════════════════════════
CERINTE PLATFORMA
═══════════════════════════════════════════

STACK TEHNIC:
- Frontend: React + TypeScript + TailwindCSS
- Charts: TradingView Lightweight Charts sau Recharts
- Backend: FastAPI (Python) sau Node.js/Express
- WebSocket: pentru date live
- Auth: JWT
- DB: SQLite (dev) / PostgreSQL (prod)

DESIGN:
- Dark mode profesional (#080c14 background)
- Font: Space Mono (mono) + Outfit (UI)
- Accent: #00d4ff (cyan) + #7c3aed (purple)
- Green: #10b981 | Red: #ef4444
- Stil: Bloomberg Terminal meets modern SaaS

═══════════════════════════════════════════
SECTIUNI PLATFORMĂ
═══════════════════════════════════════════

1. DASHBOARD LIVE
   - Equity curve chart (timp real)
   - Stat cards: Profit Total, Capital Activ, Win Rate, Trades Azi
   - Tabel trades deschise cu P&L live
   - Agent log feed (WebSocket)
   - Ticker strip (BTC/ETH/BNB prețuri live)
   - Butoane: Start/Stop Agent, Trade Manual

2. ISTORIC TRANZACȚII
   - Tabel complet cu toate trades
   - Filtre: dată, pereche, strategie, win/loss
   - Export CSV/Excel
   - Detalii per trade (entry, exit, durată, fees, P&L)

3. STATISTICI & ANALIZĂ
   - Profit Factor, Sharpe Ratio, Max Drawdown, Avg Trade
   - Grafic P&L zilnic/săptămânal/lunar (bar chart)
   - Win Rate per strategie (progress bars)
   - Distribuție trades pe ore (heatmap)
   - Comparație strategii (radar chart)
   - Consecutive wins/losses tracker

4. SETĂRI AGENT AI
   - Configurare API Keys (criptat în DB)
   - Capital per trade, max trades simultane
   - Toggle: Stop Loss, Trailing Stop, Paper Mode
   - Circuit breaker: oprire la drawdown X%
   - Notificări Telegram (token + chat_id)
   - Whitelist perechi tranzacționate
   - Leverage setting (1x - 5x)

5. MANAGER STRATEGII
   - Lista tuturor strategiilor (card UI)
   - Toggle ON/OFF per strategie
   - Afișare metrici per strategie (din backtest)
   - Upload strategie nouă (.py file)
   - Configurare parametri custom per strategie

═══════════════════════════════════════════
INTEGRARE FREQTRADE API
═══════════════════════════════════════════

Conectează-te la Freqtrade REST API:

// Endpoints principale:
GET  /api/v1/status          → trades deschise
GET  /api/v1/profit          → statistici profit
GET  /api/v1/trades          → istoric trades
GET  /api/v1/performance     → performance per pereche
POST /api/v1/forcebuy        → deschide trade manual
POST /api/v1/forcesell/{id}  → închide trade
POST /api/v1/stopbuy         → opreste noi intrari
GET  /api/v1/balance         → sold portofoliu
WS   /api/v1/message/ws      → WebSocket date live

Autentificare:
POST /api/v1/token → JWT token (username/password din config)
Header: Authorization: Bearer {token}

═══════════════════════════════════════════
FUNCTIONALITATI SPECIALE
═══════════════════════════════════════════

1. ALERTING SYSTEM
   - Alertă vizuală + sunet la deschidere/închidere trade
   - Alertă roșie la drawdown > limita setată
   - Notificare browser push

2. PROFIT CALCULATOR
   - Simulare "dacă aș fi investit X" 
   - Proiecție profit lunar bazat pe istoricul curent

3. DARK/LIGHT MODE TOGGLE

4. RESPONSIVE
   - Desktop (principal)
   - Tablet (funcțional)
   - Mobile (vizualizare read-only)

5. KEYBOARD SHORTCUTS
   - D → Dashboard
   - H → History  
   - S → Statistics
   - ESC → Închide modale

═══════════════════════════════════════════
SECURITATE
═══════════════════════════════════════════

- API Keys criptate cu AES-256 în baza de date
- JWT cu expirare 24h + refresh token
- Rate limiting pe endpoints
- HTTPS obligatoriu în producție
- Nu expune niciodată API keys în frontend

═══════════════════════════════════════════
DELIVERABLES
═══════════════════════════════════════════

Livrează:
1. Cod complet frontend (React/TypeScript)
2. Cod backend (FastAPI sau Express)
3. Schema baza de date
4. Docker Compose pentru deployment
5. README cu instrucțiuni de instalare
6. .env.example cu toate variabilele necesare

Comentează codul în română unde e posibil.
Folosește TypeScript strict mode.
Adaugă loading states și error handling pentru toate request-urile.
```

---

## PROMPTURI SECUNDARE (pentru sectiuni individuale)

### Prompt Dashboard Live:
```
Creează componenta React "LiveDashboard" care:
- Se conectează la Freqtrade WebSocket (ws://localhost:8080/api/v1/message/ws)
- Afișează equity curve cu TradingView Lightweight Charts (actualizare la fiecare minut)
- Stat cards animate cu react-countup
- Tabel trades deschise cu P&L calculat live pe baza prețului curent
- Log feed cu auto-scroll și culori diferite per tip mesaj (INFO/TRADE/WARN/ERROR)
Design: dark mode, accent cyan #00d4ff, font Space Mono pentru numere
```

### Prompt Statistici:
```
Creează pagina de statistici pentru un bot de trading cu:
- Calculează automat: Profit Factor, Sharpe Ratio, Max Drawdown, Avg Win, Avg Loss
- Bar chart P&L pe ultimele 30 zile (Recharts)
- Heatmap trades per oră din zi (când botul tranzacționează cel mai profitabil)
- Scatter plot Entry vs Exit price pentru toate trades
- Datele vin din array-ul de trades: [{pair, profit_ratio, profit_abs, open_date, close_date, is_open, strategy}]
```

### Prompt Setări:
```
Creează formularul de setări pentru trading bot cu:
- Toate câmpurile validate cu Zod + React Hook Form  
- API Keys mascate cu reveal button
- Toggle switches custom (nu native checkbox)
- Confirm dialog înainte de salvare modificări critice
- Toast notifications la succes/eroare
- Preset-uri rapide: "Conservative" / "Balanced" / "Aggressive"
```

---

## STRUCTURA FISIERE RECOMANDATA

```
trading-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── History/
│   │   │   ├── Statistics/
│   │   │   ├── Settings/
│   │   │   └── Strategies/
│   │   ├── hooks/
│   │   │   ├── useFreqtradeAPI.ts
│   │   │   ├── useWebSocket.ts
│   │   │   └── useLivePrices.ts
│   │   ├── stores/          (Zustand)
│   │   └── types/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── trades.py
│   │   ├── settings.py
│   │   └── strategies.py
│   ├── services/
│   │   └── freqtrade_client.py
│   └── models/
└── docker-compose.yml
```

---

*Prompt creat de Claude Trading Agent pentru Minu | February 2026*