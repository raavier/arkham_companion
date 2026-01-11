import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import { loadCampaigns, saveCampaign as saveToFirestore, deleteCampaign as deleteFromFirestore, migrateFromLocalStorage } from './services/firestoreService';

interface Token { id: string; value: string; name: string; colorClass: string; }
interface TokenCounts { [key: string]: number; }
interface DrawRecord { tokenId: string; timestamp: number; scenarioIndex: number; }
interface Statistics { totalDraws: number; tokenDraws: { [tokenId: string]: number }; drawHistory: DrawRecord[]; }
interface Scenario { name: string; completed: boolean; resolution?: string; xpEarned: number; }
interface Investigator { name: string; class: string; health: number; sanity: number; currentHealth: number; currentSanity: number; xp: number; trauma: { physical: number; mental: number }; eliminated: boolean; }
interface Campaign { id: string; name: string; campaignType: string; difficulty: string; createdAt: number; updatedAt: number; tokenCounts: TokenCounts; currentScenarioIndex: number; scenarios: Scenario[]; investigators: Investigator[]; statistics: Statistics; notes: string; chaosBagModifications: string[]; }

const TOKENS: Token[] = [
  { id: 'plus1', value: '+1', name: '+1', colorClass: 'bg-gradient-to-br from-green-700 to-green-900 text-green-300 border-green-600' },
  { id: 'zero', value: '0', name: '0', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus1', value: '-1', name: '-1', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus2', value: '-2', name: '-2', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus3', value: '-3', name: '-3', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus4', value: '-4', name: '-4', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus5', value: '-5', name: '-5', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus6', value: '-6', name: '-6', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus7', value: '-7', name: '-7', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'minus8', value: '-8', name: '-8', colorClass: 'bg-gradient-to-br from-teal-800 to-teal-950 text-teal-300 border-teal-600' },
  { id: 'skull', value: '💀', name: 'Caveira', colorClass: 'bg-gradient-to-br from-red-900 to-red-950 text-red-300 border-red-700' },
  { id: 'cultist', value: '👤', name: 'Cultista', colorClass: 'bg-gradient-to-br from-amber-800 to-amber-950 text-amber-300 border-amber-600' },
  { id: 'tablet', value: '📋', name: 'Tábua', colorClass: 'bg-gradient-to-br from-blue-800 to-blue-950 text-blue-300 border-blue-600' },
  { id: 'elderThing', value: '🐙', name: 'Elder Thing', colorClass: 'bg-gradient-to-br from-purple-800 to-purple-950 text-purple-300 border-purple-600' },
  { id: 'elderSign', value: '⭐', name: 'Elder Sign', colorClass: 'bg-gradient-to-br from-yellow-700 to-yellow-900 text-yellow-300 border-yellow-600' },
  { id: 'autofail', value: '🌀', name: 'Tentáculo', colorClass: 'bg-gradient-to-br from-red-800 to-red-950 text-red-400 border-red-600' },
  { id: 'bless', value: '✝️', name: 'Bênção', colorClass: 'bg-gradient-to-br from-yellow-600 to-yellow-800 text-yellow-200 border-yellow-500' },
  { id: 'curse', value: '😈', name: 'Maldição', colorClass: 'bg-gradient-to-br from-violet-900 to-violet-950 text-violet-300 border-violet-600' },
  { id: 'frost', value: '❄️', name: 'Gelo', colorClass: 'bg-gradient-to-br from-cyan-700 to-cyan-900 text-cyan-300 border-cyan-500' },
];

const CAMPAIGNS: { [k: string]: { name: string; scenarios: string[] } } = {
  'night-of-the-zealot': { name: 'A Noite do Fanático', scenarios: ['A Reunião', 'A Meia-Noite das Máscaras', 'O Devorador Abaixo'] },
  'dunwich-legacy': { name: 'O Legado de Dunwich', scenarios: ['Extracurricular Activity', 'The House Always Wins', 'The Miskatonic Museum', 'The Essex County Express', 'Blood on the Altar', 'Undimensioned and Unseen', 'Where Doom Awaits', 'Lost in Time and Space'] },
  'path-to-carcosa': { name: 'O Caminho para Carcosa', scenarios: ['Curtain Call', 'The Last King', 'Echoes of the Past', 'The Unspeakable Oath', 'A Phantom of Truth', 'The Pallid Mask', 'Black Stars Rise', 'Dim Carcosa'] },
  'forgotten-age': { name: 'A Era Esquecida', scenarios: ['The Untamed Wilds', 'The Doom of Eztli', 'Threads of Fate', 'The Boundary Beyond', 'Heart of the Elders', 'The City of Archives', 'The Depths of Yoth', 'Shattered Aeons'] },
  'circle-undone': { name: 'O Círculo Desfeito', scenarios: ['The Witching Hour', 'At Deaths Doorstep', 'The Secret Name', 'The Wages of Sin', 'For the Greater Good', 'Union and Disillusion', 'In the Clutches of Chaos', 'Before the Black Throne'] },
  'dream-eaters': { name: 'Os Devoradores de Sonhos', scenarios: ['Beyond the Gates of Sleep', 'Waking Nightmare', 'The Search for Kadath', 'A Thousand Shapes of Horror', 'Dark Side of the Moon', 'Point of No Return', 'Where the Gods Dwell', 'Weaver of the Cosmos'] },
  'innsmouth': { name: 'A Conspiração de Innsmouth', scenarios: ['The Pit of Despair', 'The Vanishing of Elina Harper', 'In Too Deep', 'Devil Reef', 'Horror in High Gear', 'A Light in the Fog', 'The Lair of Dagon', 'Into the Maelstrom'] },
  'edge-of-earth': { name: 'No Limite da Terra', scenarios: ['Ice and Death', 'Fatal Mirage', 'To the Forbidden Peaks', 'City of the Elder Things', 'The Heart of Madness'] },
  'scarlet-keys': { name: 'As Chaves Escarlates', scenarios: ['Riddles and Rain', 'Dead Heat', 'Sanguine Shadows', 'Dealings in the Dark', 'Dancing Mad', 'On Thin Ice', 'Dogs of War', 'Shades of Suffering', 'Without a Trace', 'Congress of the Keys'] },
  'feast-hemlock': { name: 'O Banquete de Cicuta Vale', scenarios: ['The Longest Night', 'The Twisted Hollow', 'Hemlock House', 'The Silent Heath', 'The Lost Sister', 'The Thing in the Depths'] },
  'standalone': { name: 'Cenário Avulso', scenarios: ['Cenário 1'] }
};

const DIFFICULTY: { [k: string]: TokenCounts } = {
  easy: { plus1: 2, zero: 3, minus1: 3, minus2: 2, skull: 2, cultist: 1, tablet: 1, elderSign: 1, autofail: 1 },
  normal: { plus1: 1, zero: 2, minus1: 3, minus2: 2, minus3: 1, minus4: 1, skull: 2, cultist: 1, tablet: 1, elderSign: 1, autofail: 1 },
  hard: { zero: 3, minus1: 2, minus2: 2, minus3: 2, minus4: 1, minus5: 1, skull: 2, cultist: 1, tablet: 1, elderSign: 1, autofail: 1 },
  expert: { zero: 1, minus1: 2, minus2: 2, minus3: 2, minus4: 2, minus5: 1, minus6: 1, minus8: 1, skull: 2, cultist: 1, tablet: 1, elderSign: 1, autofail: 1 }
};

const CLASSES = ['Guardião', 'Sobrevivente', 'Buscador', 'Místico', 'Trapaceiro', 'Neutro'];
const STORAGE = 'arkham-chaos-bag';

const emptyTokens = (): TokenCounts => { const c: TokenCounts = {}; TOKENS.forEach(t => c[t.id] = 0); return c; };
const emptyStats = (): Statistics => ({ totalDraws: 0, tokenDraws: {}, drawHistory: [] });
const genId = () => Math.random().toString(36).substr(2, 9);
const getToken = (id: string) => TOKENS.find(t => t.id === id);
// Fallback to localStorage when Firebase is not available
const save = (c: Campaign[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(c)); } catch {} };

const useSound = () => {
  const ctx = useRef<AudioContext | null>(null);
  const getCtx = () => { if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)(); return ctx.current; };
  const play = useCallback((freq: number[], type: OscillatorType = 'sine', dur = 0.3) => {
    try {
      const c = getCtx(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.type = type;
      freq.forEach((f, i) => o.frequency.setValueAtTime(f, c.currentTime + i * 0.1));
      g.gain.setValueAtTime(0.25, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + dur);
      o.start(c.currentTime); o.stop(c.currentTime + dur);
    } catch {}
  }, []);
  return { draw: () => play([300, 600, 400]), success: () => play([523, 659, 784]), fail: () => play([200, 50], 'sawtooth', 0.5) };
};

const MiniToken = ({ token, size = 'sm' }: { token: Token; size?: 'xs' | 'sm' | 'md' }) => {
  const s = { xs: 'w-6 h-6 text-[10px] border', sm: 'w-8 h-8 text-xs border-2', md: 'w-10 h-10 text-sm border-2' };
  return <div title={token.name} className={`${s[size]} rounded-full flex items-center justify-center font-bold cursor-default ${token.colorClass}`}>{token.value}</div>;
};

const TokenBtn = ({ token, count, onAdd, onRemove }: { token: Token; count: number; onAdd: () => void; onRemove: () => void }) => (
  <div className="flex flex-col items-center gap-1">
    <button title={token.name} onClick={onAdd} className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 hover:scale-110 active:scale-95 transition-transform ${token.colorClass}`}>{token.value}</button>
    <div className="flex items-center gap-1">
      <button onClick={onRemove} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white text-xs">−</button>
      <span className="w-4 text-center text-xs text-gray-300">{count}</span>
      <button onClick={onAdd} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white text-xs">+</button>
    </div>
  </div>
);

const Stats = ({ stats, onClose }: { stats: Statistics; onClose: () => void }) => {
  const sorted = TOKENS.map(t => ({ t, c: stats.tokenDraws[t.id] || 0 })).filter(x => x.c > 0).sort((a, b) => b.c - a.c);
  const total = stats.totalDraws || 0;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400">📊 Estatísticas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className="mb-6 p-4 bg-white/5 rounded-lg text-center">
          <p className="text-2xl font-bold text-amber-400">{total}</p>
          <p className="text-sm text-gray-400">Total de sorteios</p>
        </div>
        {sorted.length > 0 ? (
          <div className="space-y-2">
            {sorted.map(({ t, c }) => {
              const pct = ((c / total) * 100).toFixed(1);
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <MiniToken token={t} size="xs" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">{t.name}</span><span className="text-gray-400">{c} ({pct}%)</span></div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-center text-gray-500 py-8">Nenhum sorteio ainda</p>}
        {stats.drawHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <h3 className="text-sm text-gray-400 mb-2">Últimos 20</h3>
            <div className="flex flex-wrap gap-1">{stats.drawHistory.slice(-20).reverse().map((r, i) => { const t = getToken(r.tokenId); return t ? <MiniToken key={i} token={t} size="xs" /> : null; })}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const InvCard = ({ inv, onUpdate, onRemove }: { inv: Investigator; onUpdate: (i: Investigator) => void; onRemove: () => void }) => {
  const colors: { [k: string]: string } = { 'Guardião': 'border-blue-500 bg-blue-900/20', 'Sobrevivente': 'border-red-500 bg-red-900/20', 'Buscador': 'border-yellow-500 bg-yellow-900/20', 'Místico': 'border-purple-500 bg-purple-900/20', 'Trapaceiro': 'border-green-500 bg-green-900/20', 'Neutro': 'border-gray-500 bg-gray-900/20' };
  return (
    <div className={`p-3 rounded-lg border-2 ${colors[inv.class] || colors['Neutro']} ${inv.eliminated ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <input type="text" value={inv.name} onChange={e => onUpdate({ ...inv, name: e.target.value })} className="bg-transparent font-semibold text-white border-b border-transparent hover:border-white/30 focus:border-white/50 outline-none w-full" placeholder="Investigador" />
          <select value={inv.class} onChange={e => onUpdate({ ...inv, class: e.target.value })} className="text-xs text-gray-400 bg-transparent outline-none cursor-pointer mt-1">{CLASSES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}</select>
        </div>
        <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-sm ml-2">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div><label className="text-xs text-gray-500">Vida</label><div className="flex items-center gap-1"><button onClick={() => onUpdate({ ...inv, currentHealth: Math.max(0, inv.currentHealth - 1) })} className="w-5 h-5 bg-red-900/50 rounded text-xs">−</button><span className="text-red-400 min-w-[40px] text-center">{inv.currentHealth}/{inv.health}</span><button onClick={() => onUpdate({ ...inv, currentHealth: Math.min(inv.health, inv.currentHealth + 1) })} className="w-5 h-5 bg-red-900/50 rounded text-xs">+</button></div></div>
        <div><label className="text-xs text-gray-500">Sanidade</label><div className="flex items-center gap-1"><button onClick={() => onUpdate({ ...inv, currentSanity: Math.max(0, inv.currentSanity - 1) })} className="w-5 h-5 bg-blue-900/50 rounded text-xs">−</button><span className="text-blue-400 min-w-[40px] text-center">{inv.currentSanity}/{inv.sanity}</span><button onClick={() => onUpdate({ ...inv, currentSanity: Math.min(inv.sanity, inv.currentSanity + 1) })} className="w-5 h-5 bg-blue-900/50 rounded text-xs">+</button></div></div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div><label className="text-gray-500">XP</label><div className="flex items-center gap-1"><button onClick={() => onUpdate({ ...inv, xp: Math.max(0, inv.xp - 1) })} className="w-4 h-4 bg-white/10 rounded text-[10px]">−</button><span className="text-amber-400">{inv.xp}</span><button onClick={() => onUpdate({ ...inv, xp: inv.xp + 1 })} className="w-4 h-4 bg-white/10 rounded text-[10px]">+</button></div></div>
        <div><label className="text-gray-500">T.Fís</label><div className="flex items-center gap-1"><button onClick={() => onUpdate({ ...inv, trauma: { ...inv.trauma, physical: Math.max(0, inv.trauma.physical - 1) } })} className="w-4 h-4 bg-white/10 rounded text-[10px]">−</button><span className="text-red-300">{inv.trauma.physical}</span><button onClick={() => onUpdate({ ...inv, trauma: { ...inv.trauma, physical: inv.trauma.physical + 1 } })} className="w-4 h-4 bg-white/10 rounded text-[10px]">+</button></div></div>
        <div><label className="text-gray-500">T.Men</label><div className="flex items-center gap-1"><button onClick={() => onUpdate({ ...inv, trauma: { ...inv.trauma, mental: Math.max(0, inv.trauma.mental - 1) } })} className="w-4 h-4 bg-white/10 rounded text-[10px]">−</button><span className="text-blue-300">{inv.trauma.mental}</span><button onClick={() => onUpdate({ ...inv, trauma: { ...inv.trauma, mental: inv.trauma.mental + 1 } })} className="w-4 h-4 bg-white/10 rounded text-[10px]">+</button></div></div>
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer mt-2 pt-2 border-t border-white/10"><input type="checkbox" checked={inv.eliminated} onChange={e => onUpdate({ ...inv, eliminated: e.target.checked })} className="rounded" /><span className="text-gray-400">Eliminado</span></label>
    </div>
  );
};

const CampMgr = ({ camps, onSelect, onCreate, onDelete, onClose }: { camps: Campaign[]; onSelect: (c: Campaign) => void; onCreate: (c: Campaign) => void; onDelete: (id: string) => void; onClose: () => void }) => {
  const [create, setCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'night-of-the-zealot', diff: 'normal' });
  const handleCreate = () => {
    const p = CAMPAIGNS[form.type];
    const c: Campaign = { id: genId(), name: form.name || p?.name || 'Nova', campaignType: form.type, difficulty: form.diff, createdAt: Date.now(), updatedAt: Date.now(), tokenCounts: { ...emptyTokens(), ...(DIFFICULTY[form.diff] || {}) }, currentScenarioIndex: 0, scenarios: p?.scenarios.map(n => ({ name: n, completed: false, xpEarned: 0 })) || [], investigators: [], statistics: emptyStats(), notes: '', chaosBagModifications: [] };
    onCreate(c); setCreate(false); setForm({ name: '', type: 'night-of-the-zealot', diff: 'normal' });
  };
  const handleDelete = (id: string) => {
    onDelete(id);
    setConfirmDelete(null);
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-amber-400">📚 Campanhas</h2><button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button></div>
        {!create ? (<>
          <button onClick={() => setCreate(true)} className="w-full py-3 mb-4 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold">+ Nova Campanha</button>
          {camps.length > 0 ? camps.map(c => (
            <div key={c.id} className="p-4 mb-3 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/50">
              {confirmDelete === c.id ? (
                <div className="flex flex-col gap-2">
                  <p className="text-red-300 text-sm">Excluir "{c.name}"?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(c.id)} className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold">Sim, excluir</button>
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded text-sm">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between cursor-pointer" onClick={() => onSelect(c)}>
                  <div><h3 className="font-semibold text-white">{c.name}</h3><p className="text-sm text-gray-400">{c.difficulty} • {c.scenarios.filter(s => s.completed).length}/{c.scenarios.length} cenários</p><p className="text-xs text-gray-500">{c.investigators.length} inv. • {c.statistics.totalDraws} sorteios</p></div>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(c.id); }} className="text-red-400 hover:text-red-300 px-2">🗑️</button>
                </div>
              )}
            </div>
          )) : <p className="text-center text-gray-500 py-8">Nenhuma campanha</p>}
        </>) : (
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">Nome</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Minha Campanha" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Campanha</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-2 bg-slate-700 border border-white/10 rounded-lg text-white">{Object.entries(CAMPAIGNS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Dificuldade</label><select value={form.diff} onChange={e => setForm({ ...form, diff: e.target.value })} className="w-full p-2 bg-slate-700 border border-white/10 rounded-lg text-white"><option value="easy">Fácil</option><option value="normal">Normal</option><option value="hard">Difícil</option><option value="expert">Expert</option></select></div>
            <div className="flex gap-2"><button onClick={() => setCreate(false)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg">Cancelar</button><button onClick={handleCreate} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold">Criar</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChaosBag() {
  const { currentUser, logout } = useAuth();
  const [camps, setCamps] = useState<Campaign[]>([]);
  const [camp, setCamp] = useState<Campaign | null>(null);
  const [counts, setCounts] = useState<TokenCounts>(emptyTokens());
  const [bag, setBag] = useState<Token[]>([]);
  const [drawn, setDrawn] = useState<Token[]>([]);
  const [last, setLast] = useState<Token | null>(null);
  const [shake, setShake] = useState(false);
  const [sound, setSound] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showCamps, setShowCamps] = useState(false);
  const [tab, setTab] = useState<'bag' | 'scenarios' | 'investigators' | 'notes'>('bag');
  const [migrating, setMigrating] = useState(false);
  const { draw: playDraw, success: playSuccess, fail: playFail } = useSound();

  // Load campaigns from Firestore when user logs in
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const loadUserData = async () => {
      try {
        // Try to migrate from localStorage first
        const localData = localStorage.getItem(STORAGE);
        if (localData && !migrating) {
          setMigrating(true);
          const migratedCount = await migrateFromLocalStorage(currentUser.uid);
          if (migratedCount > 0) {
            console.log(`Migrated ${migratedCount} campaigns from localStorage to Firestore`);
          }
          setMigrating(false);
        }

        // Load campaigns from Firestore
        const campaigns = await loadCampaigns(currentUser.uid);
        setCamps(campaigns);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [currentUser, migrating]);

  useEffect(() => { const b: Token[] = []; TOKENS.forEach(t => { for (let i = 0; i < (counts[t.id] || 0); i++) b.push(t); }); setBag(b); }, [counts]);

  const saveCamp = useCallback((c: Campaign) => {
    const u = camps.map(x => x.id === c.id ? c : x);
    setCamps(u);

    // Save to Firestore if user is logged in
    if (currentUser) {
      saveToFirestore(currentUser.uid, c).catch(err => {
        console.error('Error saving campaign:', err);
        // Fallback to localStorage on error
        save(u);
      });
    } else {
      // Fallback to localStorage if not logged in
      save(u);
    }
  }, [camps, currentUser]);

  const addTok = (id: string) => { setCounts(p => { const n = { ...p, [id]: (p[id] || 0) + 1 }; if (camp) { const u = { ...camp, tokenCounts: n, updatedAt: Date.now() }; setCamp(u); setTimeout(() => saveCamp(u), 0); } return n; }); };
  const remTok = (id: string) => { setCounts(p => { const n = { ...p, [id]: Math.max(0, (p[id] || 0) - 1) }; if (camp) { const u = { ...camp, tokenCounts: n, updatedAt: Date.now() }; setCamp(u); setTimeout(() => saveCamp(u), 0); } return n; }); };

  const drawTok = () => {
    if (bag.length === 0) return;
    setShake(true); setTimeout(() => setShake(false), 500);
    if (sound) playDraw();
    const i = Math.floor(Math.random() * bag.length), t = bag[i];
    setBag(p => { const n = [...p]; n.splice(i, 1); return n; });
    setDrawn(p => [...p, t]); setLast(t);
    if (camp) {
      const s = { ...camp.statistics }; s.totalDraws++; s.tokenDraws[t.id] = (s.tokenDraws[t.id] || 0) + 1; s.drawHistory.push({ tokenId: t.id, timestamp: Date.now(), scenarioIndex: camp.currentScenarioIndex });
      const u = { ...camp, statistics: s, updatedAt: Date.now() }; setCamp(u); saveCamp(u);
    }
    setTimeout(() => { if (!sound) return; if (t.id === 'autofail' || t.id === 'curse') playFail(); else if (t.id === 'elderSign' || t.id === 'bless' || t.id === 'plus1') playSuccess(); }, 300);
  };

  const returnAll = () => { setBag(p => [...p, ...drawn]); setDrawn([]); setLast(null); };
  const loadDiff = (d: string) => { const n = { ...emptyTokens(), ...(DIFFICULTY[d] || {}) }; setCounts(n); setDrawn([]); setLast(null); if (camp) { const u = { ...camp, tokenCounts: n, difficulty: d, updatedAt: Date.now() }; setCamp(u); saveCamp(u); } };
  const clear = () => { setCounts(emptyTokens()); setDrawn([]); setLast(null); };

  const selectCamp = (c: Campaign) => { setCamp(c); setCounts(c.tokenCounts); setDrawn([]); setLast(null); setShowCamps(false); setTab('bag'); };

  const createCamp = (c: Campaign) => {
    const u = [...camps, c];
    setCamps(u);

    if (currentUser) {
      saveToFirestore(currentUser.uid, c).catch(err => {
        console.error('Error creating campaign:', err);
        save(u);
      });
    } else {
      save(u);
    }

    selectCamp(c);
  };

  const deleteCamp = (id: string) => {
    const u = camps.filter(c => c.id !== id);
    setCamps(u);

    if (currentUser) {
      deleteFromFirestore(currentUser.uid, id).catch(err => {
        console.error('Error deleting campaign:', err);
        save(u);
      });
    } else {
      save(u);
    }

    if (camp?.id === id) {
      setCamp(null);
      setCounts(emptyTokens());
    }
  };

  const closeCamp = () => { setCamp(null); setCounts(emptyTokens()); setDrawn([]); setLast(null); };

  const update = (u: Partial<Campaign>) => { if (!camp) return; const c = { ...camp, ...u, updatedAt: Date.now() }; setCamp(c); saveCamp(c); };
  const addInv = () => { if (!camp) return; update({ investigators: [...camp.investigators, { name: 'Investigador', class: 'Guardião', health: 7, sanity: 7, currentHealth: 7, currentSanity: 7, xp: 0, trauma: { physical: 0, mental: 0 }, eliminated: false }] }); };
  const updInv = (i: number, inv: Investigator) => { if (!camp) return; const n = [...camp.investigators]; n[i] = inv; update({ investigators: n }); };
  const remInv = (i: number) => { if (!camp) return; update({ investigators: camp.investigators.filter((_, x) => x !== i) }); };
  const togScen = (i: number) => { if (!camp) return; const n = [...camp.scenarios]; n[i] = { ...n[i], completed: !n[i].completed }; update({ scenarios: n, currentScenarioIndex: i }); };
  const updScenXP = (i: number, xp: number) => { if (!camp) return; const n = [...camp.scenarios]; n[i] = { ...n[i], xpEarned: xp }; update({ scenarios: n }); };
  const updScenRes = (i: number, r: string) => { if (!camp) return; const n = [...camp.scenarios]; n[i] = { ...n[i], resolution: r }; update({ scenarios: n }); };

  const diffLabel: { [k: string]: string } = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil', expert: 'Expert' };
  const total = bag.length;

  // Show login screen if user is not authenticated
  if (!currentUser) {
    return <AuthForm />;
  }

  // Show loading state while migrating data
  if (migrating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-amber-400 font-semibold">Migrando seus dados para a nuvem...</p>
          <p className="text-gray-400 text-sm mt-2">Isso só acontece uma vez</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-gray-100 p-3">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4"><h1 className="text-2xl font-bold text-amber-400 tracking-wider">🎴 CHAOS BAG</h1><p className="text-gray-400 italic text-xs">Arkham Horror LCG</p></div>
        <div className="flex justify-between items-center mb-4 gap-2">
          <button onClick={() => setShowCamps(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">📚 Campanhas</button>
          {camp && <div className="flex-1 text-center"><span className="text-amber-400 font-semibold text-sm">{camp.name}</span><span className="text-gray-500 text-xs ml-2">({diffLabel[camp.difficulty]})</span><button onClick={closeCamp} className="ml-2 text-gray-500 hover:text-gray-300 text-xs">✕</button></div>}
          <div className="flex gap-2">
            {camp && <button onClick={() => setShowStats(true)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm">📊</button>}
            <button onClick={() => setSound(!sound)} className={`px-3 py-1.5 rounded-lg text-sm ${sound ? 'bg-amber-600' : 'bg-gray-700'}`}>{sound ? '🔊' : '🔇'}</button>
            <button onClick={() => logout()} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm" title={currentUser.email || 'Sair'}>🚪</button>
          </div>
        </div>
        {camp && <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">{(['bag', 'scenarios', 'investigators', 'notes'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-md text-xs font-medium ${tab === t ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t === 'bag' ? '🎲 Bolsa' : t === 'scenarios' ? '📜 Cenários' : t === 'investigators' ? '🔍 Invest.' : '📝 Notas'}</button>)}</div>}

        {(tab === 'bag' || !camp) && (<>
          <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
            <h2 className="text-amber-400 font-semibold mb-2 text-sm">⚙️ Dificuldade</h2>
            <div className="flex flex-wrap gap-2 justify-center">{Object.entries(diffLabel).map(([k, l]) => <button key={k} onClick={() => loadDiff(k)} className={`px-3 py-1.5 rounded-lg text-xs ${camp?.difficulty === k ? 'bg-amber-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>{l}</button>)}<button onClick={clear} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-lg text-xs">Limpar</button></div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10">
            <h2 className="text-amber-400 font-semibold mb-2 text-sm">🪙 Fichas</h2>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 justify-items-center">{TOKENS.map(t => <TokenBtn key={t.id} token={t} count={counts[t.id] || 0} onAdd={() => addTok(t.id)} onRemove={() => remTok(t.id)} />)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 text-center">
            <div onClick={total > 0 ? drawTok : undefined} className={`w-36 h-36 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-900 to-amber-950 border-4 border-amber-700 flex items-center justify-center shadow-xl transition-transform ${shake ? 'animate-pulse scale-105' : ''} ${total === 0 ? 'opacity-50' : 'cursor-pointer hover:scale-105'}`}><div><div className="text-3xl font-bold text-amber-400">{total}</div><div className="text-xs text-amber-600">fichas</div></div></div>
            <button onClick={drawTok} disabled={total === 0} className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-bold tracking-wider shadow-lg">SORTEAR</button>
            {bag.length > 0 && <div className="flex flex-wrap gap-1 justify-center mt-4 max-h-20 overflow-y-auto">{bag.map((t, i) => <MiniToken key={i} token={t} size="xs" />)}</div>}
          </div>
          <div className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10 text-center min-h-[120px] flex flex-col items-center justify-center">{last ? <><div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl border-4 mb-2 ${last.colorClass}`}>{last.value}</div><p className="text-amber-400 font-semibold">{last.name}</p></> : <p className="text-gray-500 italic">Clique para sortear</p>}</div>
          {drawn.length > 0 && <div className="bg-white/5 rounded-xl p-3 border border-white/10"><div className="flex justify-between items-center mb-2"><h3 className="text-sm text-gray-400">Sorteadas ({drawn.length})</h3><button onClick={returnAll} className="px-3 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-300 rounded text-xs">↩️ Devolver</button></div><div className="flex flex-wrap gap-1">{drawn.map((t, i) => <MiniToken key={i} token={t} size="sm" />)}</div></div>}
        </>)}

        {tab === 'scenarios' && camp && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h2 className="text-amber-400 font-semibold mb-3">📜 Cenários</h2>
            <div className="space-y-2">{camp.scenarios.map((s, i) => (
              <div key={i} className={`p-3 rounded-lg border ${s.completed ? 'bg-green-900/20 border-green-700/50' : i === camp.currentScenarioIndex ? 'bg-amber-900/20 border-amber-700/50' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1"><input type="checkbox" checked={s.completed} onChange={() => togScen(i)} className="w-4 h-4 rounded mt-1" /><div className="flex-1"><span className={s.completed ? 'text-gray-400 line-through' : 'text-white'}>{i + 1}. {s.name}</span><input type="text" value={s.resolution || ''} onChange={e => updScenRes(i, e.target.value)} placeholder="Resolução..." className="mt-1 w-full text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 placeholder-gray-600" /></div></div>
                  <div className="flex items-center gap-1"><span className="text-xs text-gray-500">XP:</span><input type="number" value={s.xpEarned} onChange={e => updScenXP(i, parseInt(e.target.value) || 0)} className="w-12 px-2 py-1 bg-white/10 rounded text-center text-sm" min="0" /></div>
                </div>
              </div>
            ))}</div>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between"><span className="text-gray-400 text-sm">{camp.scenarios.filter(s => s.completed).length}/{camp.scenarios.length} completos</span><span className="text-amber-400 font-semibold">XP Total: {camp.scenarios.reduce((s, x) => s + x.xpEarned, 0)}</span></div>
          </div>
        )}

        {tab === 'investigators' && camp && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3"><h2 className="text-amber-400 font-semibold">🔍 Investigadores</h2><button onClick={addInv} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded text-sm">+ Adicionar</button></div>
            {camp.investigators.length > 0 ? <div className="grid gap-3">{camp.investigators.map((inv, i) => <InvCard key={i} inv={inv} onUpdate={u => updInv(i, u)} onRemove={() => remInv(i)} />)}</div> : <p className="text-center text-gray-500 py-8">Nenhum investigador</p>}
            {camp.investigators.length > 0 && <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-sm"><div><span className="text-gray-400">XP Total:</span><span className="text-amber-400 font-semibold ml-2">{camp.investigators.reduce((s, i) => s + i.xp, 0)}</span></div><div><span className="text-gray-400">Ativos:</span><span className="text-green-400 font-semibold ml-2">{camp.investigators.filter(i => !i.eliminated).length}</span></div></div>}
          </div>
        )}

        {tab === 'notes' && camp && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10"><h2 className="text-amber-400 font-semibold mb-3">📝 Notas</h2><textarea value={camp.notes} onChange={e => update({ notes: e.target.value })} placeholder="Decisões, eventos, lore..." className="w-full h-40 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none text-sm" /></div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-amber-400 font-semibold mb-3">🔧 Modificações na Bolsa</h3>
              <div className="space-y-2">{camp.chaosBagModifications.map((m, i) => <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded"><span className="flex-1 text-sm">{m}</span><button onClick={() => update({ chaosBagModifications: camp.chaosBagModifications.filter((_, x) => x !== i) })} className="text-red-400 hover:text-red-300 text-xs px-2">✕</button></div>)}<input type="text" placeholder="Ex: +1 Caveira após Cenário 2" className="w-full p-2 bg-white/5 border border-white/10 rounded text-sm placeholder-gray-600" onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { update({ chaosBagModifications: [...camp.chaosBagModifications, e.currentTarget.value.trim()] }); e.currentTarget.value = ''; } }} /></div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10"><h3 className="text-amber-400 font-semibold mb-3">ℹ️ Info</h3><div className="grid grid-cols-2 gap-2 text-sm"><div><span className="text-gray-500">Criada:</span><span className="text-gray-300 ml-2">{new Date(camp.createdAt).toLocaleDateString('pt-BR')}</span></div><div><span className="text-gray-500">Atualizada:</span><span className="text-gray-300 ml-2">{new Date(camp.updatedAt).toLocaleDateString('pt-BR')}</span></div><div><span className="text-gray-500">Sorteios:</span><span className="text-amber-400 ml-2">{camp.statistics.totalDraws}</span></div><div><span className="text-gray-500">Campanha:</span><span className="text-gray-300 ml-2">{CAMPAIGNS[camp.campaignType]?.name || camp.campaignType}</span></div></div></div>
          </div>
        )}

        <div className="text-center text-gray-600 text-xs mt-6 pb-4">Arkham Horror LCG © Fantasy Flight Games</div>
      </div>
      {showStats && camp && <Stats stats={camp.statistics} onClose={() => setShowStats(false)} />}
      {showCamps && <CampMgr camps={camps} onSelect={selectCamp} onCreate={createCamp} onDelete={deleteCamp} onClose={() => setShowCamps(false)} />}
    </div>
  );
}
