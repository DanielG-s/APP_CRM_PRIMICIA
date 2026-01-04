import { Activity, ShoppingCart, Search, CreditCard, Bell, User } from 'lucide-react';

export const RFM_STATUSES = [
  { id: 'Champions', label: '🏆 Champions (VIPs)', desc: 'Compram muito e frequentemente' },
  { id: 'Leais', label: '💎 Leais', desc: 'Compram com frequência regular' },
  { id: 'Recentes', label: '🌱 Recentes', desc: 'Fizeram a primeira compra agora' },
  { id: 'Em Risco', label: '⚠️ Em Risco', desc: 'Não compram há mais de 3 meses' },
  { id: 'Hibernando', label: '💤 Hibernando', desc: 'Não compram há mais de 6 meses' },
  { id: 'Novos / Sem Dados', label: '👻 Sem Compras', desc: 'Cadastrados que nunca compraram' },
];

export const UI_OPTIONS_INITIAL = {
  categories: [], departments: [], products: [], campaigns: [], search_terms: [], cities: [], states: [], segments: [],
  gender: ['Masculino', 'Feminino', 'Outro', 'Não informado'],
  boolean: ['Sim (True)', 'Não (False)'],
  dates: ['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Últimos 60 dias', 'Últimos 90 dias'],
  counts: [1, 2, 3, 4, 5, 10, 20, 50, 100],
  prices: [50, 100, 200, 500, 1000, 2000, 5000]
};

export const EVENT_CATEGORIES: any = {
  NAV: { label: 'Navegação / Site', icon: Activity },
  CHECKOUT: { label: 'Checkout', icon: ShoppingCart },
  SEARCH: { label: 'Busca e Intenção', icon: Search },
  TRANSACTION: { label: 'Pedido / Transação', icon: CreditCard },
  COMMUNICATION: { label: 'Comunicação / Notificações', icon: Bell },
  RELATION: { label: 'Cadastro / Relacionamento', icon: User },
};

export const EVENTS_DB = [
  { id: 'acessou-home', label: 'Acessou Home', category: 'NAV' },
  { id: 'acessou-departamento', label: 'Acessou Departamento', category: 'NAV' },
  { id: 'acessou-categoria', label: 'Acessou Categoria', category: 'NAV' },
  { id: 'acessou-produto', label: 'Acessou Produto', category: 'NAV' },
  { id: 'acessou-carrinho', label: 'Acessou Carrinho', category: 'NAV' },
  { id: 'acessou-checkout-dados-pessoais', label: 'Checkout: Dados Pessoais', category: 'CHECKOUT' },
  { id: 'acessou-checkout-email', label: 'Checkout: Email', category: 'CHECKOUT' },
  { id: 'acessou-checkout-endereco-entrega', label: 'Checkout: Endereço', category: 'CHECKOUT' },
  { id: 'acessou-checkout-pagamento', label: 'Checkout: Pagamento', category: 'CHECKOUT' },
  { id: 'buscou-produto', label: 'Buscou Produto', category: 'SEARCH' },
  { id: 'adicionou-produto-ao-carrinho', label: 'Add Produto ao Carrinho', category: 'SEARCH' },
  { id: 'fez-pedido', label: 'Fez Pedido', category: 'TRANSACTION', hasContext: true },
  { id: 'fez-pedido-produto', label: 'Fez Pedido (Item)', category: 'TRANSACTION', hasContext: true },
  { id: 'comprou', label: 'Comprou (Faturado)', category: 'TRANSACTION', hasContext: true },
  { id: 'comprou-produto', label: 'Comprou Produto', category: 'TRANSACTION', hasContext: true },
  { id: 'devolveu', label: 'Devolveu Pedido', category: 'TRANSACTION', hasContext: true },
  { id: 'open-notification', label: 'Abriu Notificação', category: 'COMMUNICATION' },
  { id: 'click-notification', label: 'Clicou Notificação', category: 'COMMUNICATION' },
  { id: 'receive-email-notification', label: 'Recebeu Email', category: 'COMMUNICATION' },
  { id: 'recebeu-notificacao-sms', label: 'Recebeu SMS', category: 'COMMUNICATION' },
  { id: 'recebeu-contato', label: 'Recebeu Contato', category: 'COMMUNICATION' },
  { id: 'register', label: 'Cadastrou-se', category: 'RELATION' },
  { id: 'descadastrou-agenda', label: 'Opt-out Agenda', category: 'RELATION' },
  { id: 'descadastrou-notificacao', label: 'Opt-out Notificações', category: 'RELATION' },
  { id: 'nao-conseguiu-contato', label: 'Não conseguiu contato', category: 'RELATION' },
  { id: 'erro-entrega-notificacao', label: 'Erro Entrega (Bounce)', category: 'RELATION' },
  { id: 'reportou-spam', label: 'Reportou Spam', category: 'RELATION' },
];

export const OPERATORS: any = {
  string: [{ id: 'equals', label: 'Igual a' }, { id: 'not_equals', label: 'Diferente de' }, { id: 'contains', label: 'Contém' }, { id: 'is_set', label: 'Preenchido', noValue: true }],
  number: [{ id: 'equals', label: 'Igual a' }, { id: 'greater_than', label: 'Maior que' }, { id: 'less_than', label: 'Menor que' }],
  date: [{ id: 'equals', label: 'Igual a' }, { id: 'greater_than', label: 'Depois de' }, { id: 'less_than', label: 'Antes de' }],
  boolean: [{ id: 'is', label: 'É igual a' }]
};

export const getEventById = (id: string) => EVENTS_DB.find(e => e.id === id);
export const SELECT_CLASS = "block w-full text-sm border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white rounded-lg focus:ring-2 focus:ring-offset-1 transition-all shadow-sm py-2 px-3 font-medium text-gray-700 cursor-pointer outline-none";
export const BTN_ICON_CLASS = "ml-auto p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors";