import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Tag,
  Home,
  ArrowLeft,
  Smartphone,
  Trash2,
} from 'lucide-react';

// --- Tipos ---
interface PontoHistorico {
  dia: string;
  preco: number;
}

interface Produto {
  id: string;
  nome: string;
  url: string;
  precoInicial: number;
  precoAtual: number;
  historico: PontoHistorico[];
}

// --- Lógica de Simulação ---
const gerarHistoricoSimulado = () => {
  const historico: PontoHistorico[] = [];
  let precoLoop = 100 + Math.random() * 4900;
  const precoInicial = parseFloat(precoLoop.toFixed(2));

  for (let i = 7; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    historico.push({
      dia: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      preco: parseFloat(precoLoop.toFixed(2)),
    });
    precoLoop = precoLoop * (1 + (Math.random() * 0.1 - 0.05));
  }

  return {
    historico,
    precoInicial,
    precoAtual: historico[historico.length - 1].preco,
  };
};

const STORAGE_KEY = '@PriceTrackerMobile:produtos';

export default function App() {
  // --- Estados ---
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Produto[]) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'home' | 'add'>('home');
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  // --- Efeitos ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
    } catch {
      /* ignora erro de armazenamento */
    }
  }, [produtos]);

  // --- Handlers ---
  const adicionarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !url) return;

    const { historico, precoInicial, precoAtual } = gerarHistoricoSimulado();
    const novoProduto: Produto = {
      id: Date.now().toString(),
      nome,
      url,
      precoInicial,
      precoAtual,
      historico,
    };

    setProdutos([novoProduto, ...produtos]);
    setNome('');
    setUrl('');
    setActiveTab('home');
  };

  const removerProduto = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id));
    setProdutoSelecionado(null);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // --- Componentes de Tela ---
  const renderHome = () => (
    <div className="pb-24 pt-4 px-4 space-y-4 animate-in fade-in duration-300">
      {produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center px-6">
          <div className="bg-indigo-100 p-6 rounded-full mb-4">
            <Smartphone className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum produto aqui</h2>
          <p className="text-slate-500 text-sm">
            Toque no botão "+" abaixo para adicionar produtos e começar a monitorar.
          </p>
        </div>
      ) : (
        produtos.map((produto) => {
          const variacao =
            ((produto.precoAtual - produto.precoInicial) / produto.precoInicial) * 100;
          const desceu = variacao < 0;
          const subiu = variacao > 0;
          const textoVariacao = Math.abs(variacao).toFixed(1) + '%';

          return (
            <div
              key={produto.id}
              onClick={() => setProdutoSelecionado(produto)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform flex flex-col gap-3"
            >
              <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight text-lg">
                {produto.nome}
              </h3>

              <div className="flex justify-between items-end mt-1">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Preço Atual</p>
                  <p
                    className={`text-xl font-bold ${
                      desceu ? 'text-emerald-600' : subiu ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {formatarMoeda(produto.precoAtual)}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold ${
                    desceu
                      ? 'bg-emerald-100 text-emerald-700'
                      : subiu
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {desceu ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : subiu ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                  {textoVariacao}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderAddForm = () => (
    <div className="pb-24 pt-6 px-4 animate-in slide-in-from-right-8 duration-300">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-indigo-600" />
          Novo Produto
        </h2>

        <form onSubmit={adicionarProduto} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              O que você quer monitorar?
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Smart TV Samsung 55"
              className="w-full px-4 py-4 text-base bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cole o link da loja aqui
            </label>
            <input
              type="url"
              required
              placeholder="https://..."
              className="w-full px-4 py-4 text-base bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 active:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4 text-lg"
          >
            Monitorar Preço
          </button>
        </form>
      </div>
    </div>
  );

  // --- Renderização Principal ---
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col relative max-w-md mx-auto sm:border-x sm:border-slate-300 shadow-2xl">
      {/* Top App Bar */}
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-10">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">PriceTracker</h1>
          <div className="bg-indigo-500/50 p-2 rounded-full">
            <Tag className="w-5 h-5 text-indigo-100" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' ? renderHome() : renderAddForm()}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 flex pt-2 px-2 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400 active:bg-slate-50'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-indigo-100' : ''}`} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => setActiveTab('add')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              activeTab === 'add'
                ? 'bg-indigo-700 shadow-indigo-600/40'
                : 'bg-indigo-600 shadow-indigo-600/30'
            }`}
          >
            <Plus className="w-8 h-8 text-white" />
          </button>
        </div>

        <button
          className="flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-xl text-slate-400 active:bg-slate-50 transition-colors"
          onClick={() =>
            alert('Simulação Frontend - Ações de usuário ficariam aqui no app real.')
          }
        >
          <Smartphone className="w-6 h-6" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>

      {/* Tela de Detalhes */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col max-w-md mx-auto sm:border-x sm:border-slate-300 animate-in slide-in-from-bottom-full duration-300">
          <header className="bg-white px-4 h-16 flex items-center gap-3 border-b border-slate-200 shrink-0">
            <button
              onClick={() => setProdutoSelecionado(null)}
              className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 truncate flex-1">Detalhes</h2>
            <button
              onClick={() => removerProduto(produtoSelecionado.id)}
              className="p-2 text-rose-500 active:bg-rose-50 rounded-full transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 pb-10">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h3 className="font-semibold text-xl text-slate-900 mb-4">
                {produtoSelecionado.nome}
              </h3>

              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Preço Original</p>
                  <p className="text-lg font-medium text-slate-700">
                    {formatarMoeda(produtoSelecionado.precoInicial)}
                  </p>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Preço Agora</p>
                  <p
                    className={`text-2xl font-bold ${
                      produtoSelecionado.precoAtual < produtoSelecionado.precoInicial
                        ? 'text-emerald-600'
                        : produtoSelecionado.precoAtual > produtoSelecionado.precoInicial
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {formatarMoeda(produtoSelecionado.precoAtual)}
                  </p>
                </div>
              </div>

              <a
                href={produtoSelecionado.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full py-3 bg-slate-100 active:bg-slate-200 text-indigo-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Abrir na Loja
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <h4 className="font-bold text-slate-700 mb-4 px-1">Evolução do Preço (7 dias)</h4>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={produtoSelecionado.historico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dia"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => `R$${value}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value) => [formatarMoeda(Number(value)), 'Preço']}
                    labelStyle={{ color: '#64748B', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="preco"
                    stroke="#4F46E5"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
