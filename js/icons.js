// ============================================================
// AppLM — Ícones SVG estilo cartoon (traço grosso + cores vivas)
// ============================================================

const ICONS = {
  // --- Navegação ---
  home: '<svg viewBox="0 0 64 64"><rect x="12" y="26" width="40" height="28" rx="4" fill="#ffd43b" stroke="#33334d" stroke-width="3"/><path d="M6 30 32 8l26 22z" fill="#ff5a5f" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><rect x="26" y="38" width="12" height="16" rx="2" fill="#1cb0f6" stroke="#33334d" stroke-width="3"/></svg>',
  check: '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="16" fill="#58cc02" stroke="#33334d" stroke-width="3"/><path d="M18 34l10 10 18-22" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  brain: '<svg viewBox="0 0 64 64"><path d="M30 8c-6 0-9 4-9 7-5 1-8 5-8 9 0 3 1 5 3 7-2 2-3 4-3 7 0 5 4 9 9 9 1 4 4 6 8 6h4c4 0 7-2 8-6 5 0 9-4 9-9 0-3-1-5-3-7 2-2 3-4 3-7 0-4-3-8-8-9 0-3-3-7-9-7z" fill="#ff86d0" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M32 10v42M24 22c4 2 4 6 0 8m16-2c-4 2-4 6 0 8" stroke="#d15ba8" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 64 64"><path d="M32 14C26 9 16 8 8 10v40c8-2 18-1 24 4 6-5 16-6 24-4V10c-8-2-18-1-24 4z" fill="#1cb0f6" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M32 14v40" stroke="#0e7fb5" stroke-width="3"/><path d="M14 21c4-1 9-1 13 1m-13 8c4-1 9-1 13 1m-13 8c4-1 9-1 13 1" stroke="#e8f8ff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M37 22c4-2 9-2 13-1m-13 10c4-2 9-2 13-1m-13 10c4-2 9-2 13-1" stroke="#e8f8ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  heart: '<svg viewBox="0 0 64 64"><path d="M32 54S8 40 8 23c0-7 5-13 12-13 5 0 9 3 12 7 3-4 7-7 12-7 7 0 12 6 12 13 0 17-24 31-24 31z" fill="#ff5a5f" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><circle cx="21" cy="22" r="4" fill="#fff" opacity=".55"/></svg>',

  // --- Moedas, gemas, fogo ---
  coin: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#ffc800" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="32" r="18" fill="#ffdd57" stroke="#e6a700" stroke-width="3"/><text x="32" y="41" font-size="26" font-weight="bold" text-anchor="middle" fill="#b07d00" font-family="Arial, sans-serif">$</text></svg>',
  gem: '<svg viewBox="0 0 64 64"><path d="M16 8h32l10 16-26 32L6 24z" fill="#1cb0f6" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M22 24 32 56l10-32z" fill="#0fa0e8"/><path d="M16 8l6 16h-16zM48 8l-6 16h16z" fill="#7fd8ff"/><path d="M6 24h52M16 8l6 16M48 8l-6 16M22 24 32 56l10-32" stroke="#33334d" stroke-width="2.5" fill="none" stroke-linejoin="round"/></svg>',
  flame: '<svg viewBox="0 0 64 64"><path d="M32 6c2 10-12 14-12 28 0 10 6 22 12 22s12-12 12-22c0-6-2-10-6-14 0 4-2 6-4 7 2-8-2-16-2-21z" fill="#ff9600" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M32 56c-4 0-7-6-7-12 0-7 5-9 7-14 2 5 7 7 7 14 0 6-3 12-7 12z" fill="#ffc800"/></svg>',

  // --- Interface ---
  lock: '<svg viewBox="0 0 64 64"><path d="M20 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#8a8fa3" stroke-width="7" stroke-linecap="round"/><rect x="12" y="26" width="40" height="28" rx="9" fill="#ffc800" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="38" r="4" fill="#33334d"/><rect x="30" y="38" width="4" height="9" rx="2" fill="#33334d"/></svg>',
  back: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#1cb0f6" stroke="#33334d" stroke-width="3"/><path d="M36 20 24 32l12 12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg viewBox="0 0 64 64"><circle cx="32" cy="7" r="4" fill="#ffc800" stroke="#33334d" stroke-width="3"/><path d="M32 8c-10 0-16 8-16 18 0 12-4 16-6 18h44c-2-2-6-6-6-18 0-10-6-18-16-18z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M26 50a6 6 0 0 0 12 0" fill="#ffc800" stroke="#33334d" stroke-width="3"/></svg>',
  chest: '<svg viewBox="0 0 64 64"><path d="M8 26c0-8 6-14 24-14s24 6 24 14v6H8z" fill="#a5673f" stroke="#33334d" stroke-width="3"/><rect x="8" y="32" width="48" height="22" rx="4" fill="#c07d4e" stroke="#33334d" stroke-width="3"/><rect x="26" y="26" width="12" height="14" rx="3" fill="#ffc800" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="33" r="2.5" fill="#8a5a00"/></svg>',
  gamepad: '<svg viewBox="0 0 64 64"><path d="M18 20h28c8 0 12 8 12 16 0 6-3 10-8 10-4 0-6-3-8-6H22c-2 3-4 6-8 6-5 0-8-4-8-10 0-8 4-16 12-16z" fill="#ce82ff" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M22 28v8m-4-4h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="27" r="3.5" fill="#ffc800"/><circle cx="50" cy="34" r="3.5" fill="#58cc02"/></svg>',
  bulb: '<svg viewBox="0 0 64 64"><path d="M32 6a17 17 0 0 0-9 31c2 2 3 4 3 7h12c0-3 1-5 3-7a17 17 0 0 0-9-31z" fill="#ffdd57" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><rect x="25" y="46" width="14" height="6" rx="3" fill="#8a8fa3" stroke="#33334d" stroke-width="2.5"/><rect x="27" y="53" width="10" height="5" rx="2.5" fill="#8a8fa3" stroke="#33334d" stroke-width="2.5"/><path d="M26 21a8 8 0 0 1 6-4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  trophy: '<svg viewBox="0 0 64 64"><path d="M18 12h-8a10 10 0 0 0 11 13M46 12h8a10 10 0 0 1-11 13" fill="none" stroke="#e6a700" stroke-width="5"/><path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="#ffc800" stroke="#33334d" stroke-width="3"/><path d="M28 34h8v8h-8z" fill="#e6a700"/><rect x="20" y="42" width="24" height="8" rx="2" fill="#a5673f" stroke="#33334d" stroke-width="3"/><rect x="16" y="50" width="32" height="7" rx="2" fill="#8a5530" stroke="#33334d" stroke-width="3"/></svg>',
  star: '<svg viewBox="0 0 64 64"><path d="M32 6l8 16 18 3-13 12 3 18-16-8-16 8 3-18L6 25l18-3z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 64 64"><path d="M10 14 20 6M54 14 44 6" stroke="#1cb0f6" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="34" r="22" fill="#fff" stroke="#33334d" stroke-width="3"/><path d="M32 22v12l8 6" fill="none" stroke="#ff5a5f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  rocket: '<svg viewBox="0 0 64 64"><path d="M18 32 8 42l12-2zM46 32l10 10-12-2z" fill="#ff5a5f" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M32 4c10 6 14 18 14 28l-6 10H24l-6-10C18 22 22 10 32 4z" fill="#e8f0ff" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="24" r="6" fill="#1cb0f6" stroke="#33334d" stroke-width="3"/><path d="M28 44c0 6 1 10 4 14 3-4 4-8 4-14z" fill="#ff9600" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/></svg>',
  calendar: '<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="44" rx="6" fill="#fff" stroke="#33334d" stroke-width="3"/><rect x="8" y="12" width="48" height="12" rx="6" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><path d="M20 8v8m24-8v8" stroke="#33334d" stroke-width="4" stroke-linecap="round"/><path d="M18 34h8m8 0h8M18 44h8m8 0h8" stroke="#9aa0b5" stroke-width="4" stroke-linecap="round"/></svg>',
  gift: '<svg viewBox="0 0 64 64"><rect x="10" y="26" width="44" height="30" rx="4" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><rect x="8" y="18" width="48" height="10" rx="3" fill="#ff8085" stroke="#33334d" stroke-width="3"/><path d="M32 18v38" stroke="#ffc800" stroke-width="6"/><path d="M32 18c-6 0-14-2-14-8 0-4 6-6 9-3 3 2 5 7 5 11zm0 0c6 0 14-2 14-8 0-4-6-6-9-3-3 2-5 7-5 11z" fill="#ffc800" stroke="#33334d" stroke-width="3"/></svg>',
  map: '<svg viewBox="0 0 64 64"><path d="M8 14l16-6 16 6 16-6v42l-16 6-16-6-16 6z" fill="#7be03c" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M24 8v42m16-36v42" stroke="#46a302" stroke-width="3"/><path d="M16 30c6-6 12 2 18-4m4 14c4-4 8-2 10-6" stroke="#ff5a5f" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="4 4"/><circle cx="48" cy="20" r="4" fill="#ff5a5f" stroke="#33334d" stroke-width="2.5"/></svg>',
  money: '<svg viewBox="0 0 64 64"><path d="M14 22c8-6 14 2 22-2 4-2 8-4 12-2v24c-8 6-14-2-22 2-4 2-8 4-12 2z" fill="#58cc02" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><circle cx="31" cy="32" r="7" fill="#7be03c" stroke="#33334d" stroke-width="2.5"/><path d="M20 50l-6 6m36-48-6 6" stroke="none"/></svg>',

  // --- Tarefas ---
  tooth: '<svg viewBox="0 0 64 64"><path d="M20 8C12 8 8 14 8 22c0 10 5 14 6 22 1 6 3 12 7 12 3 0 4-6 5-11 1-5 2-7 6-7s5 2 6 7c1 5 2 11 5 11 4 0 6-6 7-12 1-8 6-12 6-22 0-8-4-14-12-14-4 0-8 3-12 3s-8-3-12-3z" fill="#fff" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M17 18c-2 1-4 3-4 6" stroke="#cfe3ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  bed: '<svg viewBox="0 0 64 64"><rect x="6" y="14" width="8" height="34" rx="3" fill="#a5673f" stroke="#33334d" stroke-width="3"/><path d="M14 30h38a6 6 0 0 1 6 6v12H14z" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><rect x="17" y="21" width="15" height="10" rx="4" fill="#fff" stroke="#33334d" stroke-width="3"/><path d="M7 48v8m50-8v8" stroke="#33334d" stroke-width="4" stroke-linecap="round"/><path d="M14 40h44" stroke="#c93f47" stroke-width="3"/></svg>',
  pencil: '<svg viewBox="0 0 64 64"><path d="M44 10l10 10-30 30-14 4 4-14z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M14 40l10 10" stroke="#33334d" stroke-width="3"/><path d="M10 54l3-9 6 6z" fill="#33334d"/><path d="M48 6a5 5 0 0 1 7 0l3 3a5 5 0 0 1 0 7l-4 4L44 10z" fill="#ff86d0" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 64 64"><path d="M26 8h12" stroke="#33334d" stroke-width="4" stroke-linecap="round"/><rect x="10" y="12" width="44" height="8" rx="4" fill="#46a302" stroke="#33334d" stroke-width="3"/><path d="M15 22h34l-3 30a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill="#58cc02" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M26 30l1.5 20M38 30l-1.5 20" stroke="#2f7a00" stroke-width="3" stroke-linecap="round"/></svg>',
  spray: '<svg viewBox="0 0 64 64"><path d="M26 24v-6h8l8-6h6" fill="none" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="10" width="13" height="8" rx="2" fill="#ffc800" stroke="#33334d" stroke-width="3"/><rect x="19" y="24" width="22" height="32" rx="7" fill="#1cb0f6" stroke="#33334d" stroke-width="3"/><path d="M25 38c3-2 7-2 10 0" stroke="#e8f8ff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M52 6l2 5m5 0-5 2m5 6-5-1" stroke="#7fd8ff" stroke-width="3" stroke-linecap="round"/></svg>',
  scissors: '<svg viewBox="0 0 64 64"><path d="M24 38 46 10m-28 0 22 28" stroke="#8a8fa3" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="46" r="8" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><circle cx="46" cy="46" r="8" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="28" r="3" fill="#33334d"/></svg>',
  soap: '<svg viewBox="0 0 64 64"><circle cx="48" cy="16" r="6" fill="none" stroke="#7fd8ff" stroke-width="3"/><circle cx="57" cy="27" r="3.5" fill="none" stroke="#7fd8ff" stroke-width="3"/><circle cx="54" cy="7" r="2.5" fill="none" stroke="#7fd8ff" stroke-width="3"/><rect x="6" y="26" width="42" height="26" rx="10" fill="#1cb0f6" stroke="#33334d" stroke-width="3"/><path d="M15 35c4-2 12-2 16 0" stroke="#e8f8ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  shoe: '<svg viewBox="0 0 64 64"><path d="M8 40c0-4 2-8 6-8h10l10-10c10 2 20 8 24 14 2 3 1 6-3 6H10c-1 0-2 0-2-2z" fill="#ff5a5f" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M6 44h52v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#fff" stroke="#33334d" stroke-width="3"/><path d="M28 28l4 4m2-8 4 4" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',

  // --- Descontos ---
  envelope: '<svg viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="6" fill="#fff" stroke="#33334d" stroke-width="3"/><path d="M8 18l24 18 24-18" fill="none" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="44" r="10" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><path d="M50 38v7m0 3.5v.5" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>',
  warn: '<svg viewBox="0 0 64 64"><path d="M32 8 60 54H4z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M32 24v14" stroke="#33334d" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="46" r="3" fill="#33334d"/></svg>',
  bible: '<svg viewBox="0 0 64 64"><path d="M14 8h34a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H14a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z" fill="#3b5bdb" stroke="#33334d" stroke-width="3"/><path d="M32 18v18m-8-12h16" stroke="#ffc800" stroke-width="4" stroke-linecap="round"/><path d="M8 48a6 6 0 0 1 6-6h38" fill="none" stroke="#33334d" stroke-width="3"/></svg>',
  minus: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><rect x="16" y="27" width="32" height="10" rx="5" fill="#fff"/></svg>',
  plus: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#58cc02" stroke="#33334d" stroke-width="3"/><rect x="16" y="27" width="32" height="10" rx="5" fill="#fff"/><rect x="27" y="16" width="10" height="32" rx="5" fill="#fff"/></svg>',

  // --- Competências emocionais ---
  shield: '<svg viewBox="0 0 64 64"><path d="M32 6l22 8v16c0 14-9 24-22 28C19 54 10 44 10 30V14z" fill="#1cb0f6" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M22 32l7 7 13-14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bubble: '<svg viewBox="0 0 64 64"><path d="M32 8C17 8 6 17 6 29c0 7 4 13 10 17l-2 10 11-6c2 1 4 1 7 1 15 0 26-9 26-21S47 8 32 8z" fill="#58cc02" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><circle cx="22" cy="29" r="3" fill="#fff"/><circle cx="32" cy="29" r="3" fill="#fff"/><circle cx="42" cy="29" r="3" fill="#fff"/></svg>',
  sprout: '<svg viewBox="0 0 64 64"><path d="M32 52V28" stroke="#46a302" stroke-width="5" stroke-linecap="round"/><path d="M32 32c0-12-8-18-20-18 0 12 8 18 20 18z" fill="#58cc02" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M32 26c0-10 6-16 16-16 0 10-6 16-16 16z" fill="#7be03c" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M20 50h24l-2 8H22z" fill="#a5673f" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/></svg>',
  target: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#fff" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="32" r="16" fill="#ff5a5f" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="#fff" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="32" r="3" fill="#33334d"/></svg>',

  // --- Avatares ---
  lion: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#ff9600" stroke="#33334d" stroke-width="3"/><path d="M32 5v6M18 9l3 6M46 9l-3 6M9 20l6 4M55 20l-6 4M7 34h6M57 34h-6M12 48l5-4M52 48l-5-4" stroke="#e07800" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="34" r="17" fill="#ffc800" stroke="#33334d" stroke-width="3"/><circle cx="25" cy="30" r="2.5" fill="#33334d"/><circle cx="39" cy="30" r="2.5" fill="#33334d"/><ellipse cx="32" cy="41" rx="8" ry="6" fill="#fff" stroke="#33334d" stroke-width="2.5"/><path d="M29 38h6l-3 3.5z" fill="#33334d"/><path d="M32 41v3m0 0c-2 2-4 2-5 1m5-1c2 2 4 2 5 1" stroke="#33334d" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  wolf: '<svg viewBox="0 0 64 64"><path d="M14 8l9 11h18l9-11 5 17c2 8 0 17-6 23-4 4-10 7-17 7s-13-3-17-7c-6-6-8-15-6-23z" fill="#8a8fa3" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><path d="M17 12l5 6m25-6-5 6" stroke="#5d6275" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="31" r="2.5" fill="#33334d"/><circle cx="40" cy="31" r="2.5" fill="#33334d"/><path d="M24 41c2 4 5 6 8 6s6-2 8-6c-2-3-5-4-8-4s-6 1-8 4z" fill="#fff" stroke="#33334d" stroke-width="2.5" stroke-linejoin="round"/><path d="M29 40h6l-3 3.5z" fill="#33334d"/></svg>',
  eagle: '<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="26" fill="#a5673f" stroke="#33334d" stroke-width="3"/><path d="M12 28c4-11 12-17 20-17s16 6 20 17c0 10-6 17-20 17S12 38 12 28z" fill="#fff" stroke="#33334d" stroke-width="3"/><circle cx="24" cy="27" r="3" fill="#33334d"/><circle cx="40" cy="27" r="3" fill="#33334d"/><path d="M26 35h12c0 6-3 10-6 10s-6-4-6-10z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/></svg>',
  tiger: '<svg viewBox="0 0 64 64"><circle cx="13" cy="13" r="8" fill="#ff9600" stroke="#33334d" stroke-width="3"/><circle cx="51" cy="13" r="8" fill="#ff9600" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="34" r="25" fill="#ff9600" stroke="#33334d" stroke-width="3"/><path d="M32 10v7M22 12l3 7M42 12l-3 7M9 30c4 1 6 2 9 4M55 30c-4 1-6 2-9 4" stroke="#33334d" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="32" r="2.5" fill="#33334d"/><circle cx="40" cy="32" r="2.5" fill="#33334d"/><ellipse cx="32" cy="43" rx="9" ry="7" fill="#fff" stroke="#33334d" stroke-width="2.5"/><path d="M29 41h6l-3 3.5z" fill="#33334d"/></svg>',
  dragon: '<svg viewBox="0 0 64 64"><path d="M18 4c4 2 7 6 8 12H14c0-5 1-9 4-12zM46 4c-4 2-7 6-8 12h12c0-5-1-9-4-12z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="37" r="22" fill="#58cc02" stroke="#33334d" stroke-width="3"/><circle cx="24" cy="32" r="3" fill="#33334d"/><circle cx="40" cy="32" r="3" fill="#33334d"/><ellipse cx="32" cy="46" rx="10" ry="7" fill="#7be03c" stroke="#33334d" stroke-width="2.5"/><circle cx="28" cy="45" r="1.8" fill="#33334d"/><circle cx="36" cy="45" r="1.8" fill="#33334d"/></svg>',
  crown: '<svg viewBox="0 0 64 64"><path d="M8 18l12 10 12-16 12 16 12-10-4 30H12z" fill="#ffc800" stroke="#33334d" stroke-width="3" stroke-linejoin="round"/><rect x="10" y="48" width="44" height="8" rx="3" fill="#e6a700" stroke="#33334d" stroke-width="3"/><circle cx="32" cy="38" r="4" fill="#ff5a5f" stroke="#33334d" stroke-width="2.5"/><circle cx="20" cy="40" r="3" fill="#1cb0f6" stroke="#33334d" stroke-width="2.5"/><circle cx="44" cy="40" r="3" fill="#58cc02" stroke="#33334d" stroke-width="2.5"/></svg>',
};

// ---------- Avatares em PIXEL ART (estilo gamer 8-bit) ----------
// px(linhas, paleta): cada caractere vira um "pixel"; '.' é transparente
function px(rows, pal) {
  const size = 64 / rows.length;
  let r = '';
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (pal[ch]) r += `<rect x="${(x * size).toFixed(2)}" y="${(y * size).toFixed(2)}" width="${size + 0.05}" height="${size + 0.05}" fill="${pal[ch]}"/>`;
    });
  });
  return `<svg viewBox="0 0 64 64" shape-rendering="crispEdges">${r}</svg>`;
}

ICONS.lion = px([
  '.MMMMMMMMMM.',
  'MMMMMMMMMMMM',
  'MMFFFFFFFFMM',
  'MFFFFFFFFFFM',
  'MFEEFFFFEEFM',
  'MFFFFFFFFFFM',
  'MFFWWWWWWFFM',
  'MFWWWNNWWWFM',
  'MFWWWWWWWWFM',
  'MMFWWWWWWFMM',
  'MMMFFFFFFMMM',
  '.MMMMMMMMMM.',
], { M: '#b45309', F: '#f59e0b', E: '#1f2937', N: '#7c2d12', W: '#fde68a' });

ICONS.wolf = px([
  'DD........DD',
  'DDD......DDD',
  'DGGGGGGGGGGD',
  'GGGGGGGGGGGG',
  'GGEEGGGGEEGG',
  'GGGGGGGGGGGG',
  'GGGWWWWWWGGG',
  'GGWWWNNWWWGG',
  '.GGWWWWWWGG.',
  '..GGWWWWGG..',
  '...GGGGGG...',
  '............',
], { D: '#475569', G: '#94a3b8', W: '#e2e8f0', E: '#0f172a', N: '#0f172a' });

ICONS.eagle = px([
  '....WWWW....',
  '..WWWWWWWW..',
  '.WWWWWWWWWW.',
  'WWWWWWWWWWWW',
  'WWEEWWWWEEWW',
  'WWWWYYYYWWWW',
  '.WWWYYYYWWW.',
  '.WWWWYYWWWW.',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
], { W: '#f1f5f9', B: '#92400e', Y: '#f59e0b', E: '#0f172a' });

ICONS.tiger = px([
  'OO..OOOO..OO',
  'OOOOOOOOOOOO',
  'OSOOOSSOOOSO',
  'OOOOOOOOOOOO',
  'OOEEOOOOEEOO',
  'OOOOOOOOOOOO',
  'SOOWWWWWWOOS',
  'OOWWWNNWWWOO',
  'OOWWWWWWWWOO',
  '.OOWWWWWWOO.',
  '..OOOOOOOO..',
  '............',
], { O: '#ea580c', S: '#1c1917', W: '#fef3c7', E: '#1c1917', N: '#7c2d12' });

ICONS.dragon = px([
  '.H........H.',
  'HHH......HHH',
  '.HGGGGGGGGH.',
  '.GGGGGGGGGG.',
  'GGEEGGGGEEGG',
  'GGGGGGGGGGGG',
  'GGLLLLLLLLGG',
  'GGLLNLLNLLGG',
  'GGLLLLLLLLGG',
  '.GGLLLLLLGG.',
  '..GGGGGGGG..',
  '............',
], { G: '#16a34a', L: '#4ade80', H: '#facc15', E: '#dc2626', N: '#065f46' });

ICONS.crown = px([
  '............',
  '.C...CC...C.',
  '.C..CCCC..C.',
  '.CC.CCCC.CC.',
  '.CCCCCCCCCC.',
  '.CCCCCCCCCC.',
  '.CCRCCBCCGC.',
  '.CCCCCCCCCC.',
  '.DDDDDDDDDD.',
  '.DDDDDDDDDD.',
  '............',
  '............',
], { C: '#facc15', D: '#ca8a04', R: '#ef4444', B: '#3b82f6', G: '#22c55e' });

// Retorna o HTML de um ícone. cls: '' | 'ico-sm' | 'ico-lg' | 'ico-xl'
function icon(name, cls) {
  return `<span class="ico ${cls || ''}">${ICONS[name] || ''}</span>`;
}
