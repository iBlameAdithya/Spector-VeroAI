// portal_server.js - Mock Exchange Compliance Intake Portal (Port 3000)
// Pure Node.js built-in HTTP server (zero external npm dependencies required)
import http from 'node:http';
import url from 'node:url';

const PORT = process.env.PORT || 3000;

const PORTAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Binance Law Enforcement & Compliance Request Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0e11;
      --card-bg: #181a20;
      --border: #2b313a;
      --primary: #f0b90b;
      --primary-hover: #fcd535;
      --text: #eaecef;
      --text-muted: #848e9c;
      --success: #0ecb81;
      --danger: #f6465d;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      padding: 24px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-badge {
      background: var(--primary);
      color: #000;
      font-weight: 800;
      font-size: 18px;
      padding: 6px 14px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 12px;
      color: var(--text-muted);
    }
    .cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(14, 203, 129, 0.12);
      border: 1px solid var(--success);
      color: var(--success);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .alert-banner {
      background: rgba(240, 185, 11, 0.08);
      border-left: 4px solid var(--primary);
      padding: 14px 18px;
      border-radius: 4px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #e5c158;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group.full {
      grid-column: span 2;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }
    input, select {
      width: 100%;
      background: #0b0e11;
      border: 1px solid var(--border);
      border-radius: 6px;
      color: #fff;
      padding: 12px 14px;
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus {
      border-color: var(--primary);
    }
    .checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin: 20px 0;
      padding: 14px;
      background: #1e2026;
      border-radius: 6px;
      border: 1px solid var(--border);
    }
    .checkbox-group input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
      margin-top: 2px;
      cursor: pointer;
    }
    .checkbox-group label {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 0;
      cursor: pointer;
    }
    .btn-submit {
      width: 100%;
      background: var(--primary);
      color: #0b0e11;
      border: none;
      border-radius: 6px;
      padding: 14px 24px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-submit:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-submit:active {
      transform: translateY(0);
    }
    .warrant-success-confirmation {
      display: none;
      margin-top: 28px;
      background: rgba(14, 203, 129, 0.08);
      border: 1px solid var(--success);
      border-radius: 10px;
      padding: 24px;
      text-align: center;
    }
    .warrant-title {
      color: var(--success);
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .warrant-id-display {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      background: #0b0e11;
      padding: 10px 18px;
      border-radius: 6px;
      border: 1px dashed var(--success);
      display: inline-block;
      margin-bottom: 12px;
    }
    .warrant-meta {
      font-size: 13px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <div class="logo-badge">BINANCE</div>
        <div>
          <div class="brand-title">Law Enforcement Statutory Intake Portal</div>
          <div class="brand-sub">Global Financial Intelligence & Rapid Asset Preservation Desk</div>
        </div>
      </div>
      <div class="cert-badge">
        <span>●</span> SEC-256 MUTUAL LEGAL COMPLIANCE
      </div>
    </header>

    <div class="card">
      <div class="alert-banner">
        ⚖️ <strong>Emergency Asset Freeze Protocol:</strong> Requests filed through this statutory endpoint apply an immediate 72-hour administrative debit lock pending judicial validation.
      </div>

      <form id="freeze-form" onsubmit="event.preventDefault(); handleSubmit();">
        <div class="grid">
          <div class="form-group">
            <label for="input-case-id">Statutory Case ID / Court Reference</label>
            <input type="text" id="input-case-id" placeholder="e.g. SPECTER-2026-9921" required>
          </div>

          <div class="form-group">
            <label for="input-target-wallet">Target Deposit Account (Suspect VASP Node)</label>
            <input type="text" id="input-target-wallet" placeholder="0x3f5ce5fb59e02f43cf8d1326be81a329d448181a" required>
          </div>

          <div class="form-group">
            <label for="input-stolen-amount">Claimed Value & Currency</label>
            <input type="text" id="input-stolen-amount" placeholder="$149,000.00 USDT" required>
          </div>

          <div class="form-group">
            <label for="select-legal-framework">Applicable Legal / Enforcement Framework</label>
            <select id="select-legal-framework">
              <option value="SEC_91_URGENT_PRESERVATION">Section 91 CrPC (Urgent Asset Preservation)</option>
              <option value="FATF_REC_16">FATF Recommendation 16 (Travel Rule Freeze)</option>
              <option value="EU_MICA_ART14">EU MiCA Asset Freeze Directive Art 14</option>
              <option value="US_18_USC_981">18 U.S. Code § 981 Civil Forfeiture Directive</option>
            </select>
          </div>

          <div class="form-group full">
            <label for="input-merkle-proof">Cryptographic Lineage Root (BLAKE3-256 Merkle Proof)</label>
            <input type="text" id="input-merkle-proof" placeholder="0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069" required>
          </div>

          <div class="form-group full">
            <label for="input-officer-id">Authorized Investigating Officer Badge ID</label>
            <input type="text" id="input-officer-id" placeholder="INV-LE-4092" required>
          </div>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="checkbox-statutory-attestation" required>
          <label for="checkbox-statutory-attestation">
            I hereby certify under penalty of perjury and international legal frameworks that the provided Merkle evidence represents verified on-chain stolen asset flow and that this preservation order is issued under lawful authority.
          </label>
        </div>

        <button type="submit" id="btn-submit-freeze-warrant" class="btn-submit">
          🔒 Submit Formal Freeze Request
        </button>
      </form>

      <div class="warrant-success-confirmation" id="success-box">
        <div class="warrant-title">✅ STATUTORY FREEZE WARRANT ISSUED & EXECUTED</div>
        <div class="warrant-id-display" id="warrant-display">WARRANT-BINANCE-2026-9921</div>
        <div class="warrant-meta">
          Target account locked: <strong>TEMPORARY ADMINISTRATIVE HOLD (72h)</strong><br>
          Omnibus sweep prevented. Compliance ticket dispatched to Financial Intelligence Unit.
        </div>
      </div>
    </div>
  </div>

  <script>
    function handleSubmit() {
      const caseId = document.getElementById('input-case-id').value || 'SPECTER-2026-9921';
      const cleanCase = caseId.replace('SPECTER-', '');
      const warrantId = 'WARRANT-BINANCE-' + cleanCase;

      document.getElementById('warrant-display').innerText = warrantId;
      document.getElementById('success-box').style.display = 'block';
      document.getElementById('freeze-form').style.opacity = '0.4';
      document.getElementById('btn-submit-freeze-warrant').disabled = true;
      document.getElementById('btn-submit-freeze-warrant').innerText = '✓ Freeze Order Filed';

      const banner = document.getElementById('specter-hitl-banner');
      if (banner) banner.remove();
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/exchange/compliance-portal' || pathname === '/compliance/portal' || pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PORTAL_HTML);
  } else if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'PORTAL_ONLINE', port: PORT }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[Exchange Portal] Compliance intake portal running at http://localhost:${PORT}/exchange/compliance-portal`);
});
