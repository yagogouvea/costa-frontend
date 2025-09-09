import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageAccessControl from '@/components/PageAccessControl';
import { ArrowLeft, Calendar, Download, Filter, Table, X } from 'lucide-react';

interface OcorrenciaRow {
  id: number;
  data_acionamento?: string;
  cliente?: string;
  sub_cliente?: string;
  tipo?: string;
  tipo_veiculo?: string;
  operador?: string;
  placa1?: string;
  modelo1?: string;
  cor1?: string;
  resultado?: string;
  sub_resultado?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  inicio?: string;
  termino?: string;
  chegada?: string;
  km_inicial?: number | null;
  km_final?: number | null;
  prestador?: string | null;
  despesas_detalhadas?: any;
}

interface Filtros {
  busca: string;
  cliente: string;
  operador: string;
  periodoTipo: 'mes_atual' | '7dias' | '30dias' | 'personalizado' | 'tudo';
  dataInicio?: string;
  dataFim?: string;
}

type ApoioAdicional = {
  id: number;
  nome_prestador: string;
  is_prestador_cadastrado: boolean;
  prestador_id?: number | null;
  hora_inicial?: string | null;
  hora_inicial_local?: string | null;
  hora_final?: string | null;
  km_inicial?: number | null;
  km_final?: number | null;
  ordem?: number | null;
};

const ControleDetalhadoPage: React.FC = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [linhas, setLinhas] = useState<OcorrenciaRow[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({ busca: '', cliente: 'todos', operador: 'todos', periodoTipo: 'mes_atual' });
  const [apoiosCache, setApoiosCache] = useState<Record<number, ApoioAdicional[]>>({});
  const [clientesUnicos, setClientesUnicos] = useState<string[]>([]);
  const [operadoresUnicos, setOperadoresUnicos] = useState<string[]>([]);
  const [prestadoresNomeSet, setPrestadoresNomeSet] = useState<Set<string>>(new Set());

  const normalizarNome = (s?: string | null) => {
    if (!s) return '';
    return String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, ' ') // remove pontuação deixando espaços
      .replace(/\s+/g, ' ') // colapsa espaços
      .trim();
  };
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);

  useEffect(() => {
    const carregarPrestadores = async () => {
      const nomes = new Set<string>();
      const tentar = async (url: string) => {
        try {
          const res = await api.get(url);
          const dados = res.data;
          const items = Array.isArray(dados) ? dados : (dados?.data || []);
          items.forEach((p: any) => {
            if (p?.nome) nomes.add(normalizarNome(p.nome));
            if (p?.cod_nome) nomes.add(normalizarNome(p.cod_nome));
          });
          return items.length > 0;
        } catch {
          return false;
        }
      };

      // Priorizar a mesma fonte do popup de prestadores
      const okPopup = await tentar('/api/v1/prestadores/popup');
      if (!okPopup) {
        // Fallbacks
        const okV1 = await tentar('/api/v1/prestadores');
        if (!okV1) {
          await tentar('/api/prestadores-publico');
        }
      }
      setPrestadoresNomeSet(nomes);
    };
    carregarPrestadores();
  }, []);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/api/v1/ocorrencias/dashboard');
      const data: OcorrenciaRow[] = Array.isArray(res.data) ? res.data : [];
      const finalizadas = data.filter((o) => {
        const status = String((o as any).status || '').toLowerCase();
        return status && status !== 'em_andamento';
      });
      setLinhas(finalizadas);
      const clientes = Array.from(new Set(finalizadas.map(o => o.cliente).filter(Boolean))) as string[];
      const operadores = Array.from(new Set(finalizadas.map(o => o.operador).filter(Boolean))) as string[];
      setClientesUnicos(clientes);
      setOperadoresUnicos(operadores);
    } catch (e) {
      // noop
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const aplicarFiltros = (rows: OcorrenciaRow[]) => {
    let out = [...rows];
    // período
    if (filtros.periodoTipo !== 'tudo') {
      const agora = new Date();
      let inicio: Date | undefined;
      let fim: Date | undefined;
      if (filtros.periodoTipo === '7dias') {
        fim = agora; inicio = new Date(); inicio.setDate(inicio.getDate() - 7);
      } else if (filtros.periodoTipo === '30dias') {
        fim = agora; inicio = new Date(); inicio.setDate(inicio.getDate() - 30);
      } else if (filtros.periodoTipo === 'mes_atual') {
        inicio = new Date(agora.getFullYear(), agora.getMonth(), 1); fim = agora;
      } else if (filtros.periodoTipo === 'personalizado' && filtros.dataInicio && filtros.dataFim) {
        inicio = new Date(filtros.dataInicio); fim = new Date(filtros.dataFim); fim.setHours(23,59,59,999);
      }
      if (inicio && fim) {
        out = out.filter(o => {
          const d = o.data_acionamento ? new Date(o.data_acionamento) : (o.inicio ? new Date(o.inicio) : undefined);
          return d ? d >= inicio! && d <= fim! : true;
        });
      }
    }
    // cliente
    if (filtros.cliente !== 'todos') out = out.filter(o => (o.cliente || '') === filtros.cliente);
    // operador
    if (filtros.operador !== 'todos') out = out.filter(o => (o.operador || '') === filtros.operador);
    // busca texto
    const q = filtros.busca.trim().toLowerCase();
    if (q) {
      out = out.filter(o => [o.id, o.cliente, o.sub_cliente, o.tipo, o.tipo_veiculo, o.operador, o.placa1, o.modelo1, o.cor1, o.endereco, o.bairro, o.cidade, o.estado]
        .map(v => (v !== undefined && v !== null) ? String(v).toLowerCase() : '')
        .some(v => v.includes(q))
      );
    }
    return out;
  };

  const linhasFiltradas = useMemo(() => aplicarFiltros(linhas), [linhas, filtros]);
  const totalPaginas = Math.max(1, Math.ceil(linhasFiltradas.length / porPagina));
  const paginaCorrigida = Math.min(pagina, totalPaginas);
  const visiveis = useMemo(() => {
    const start = (paginaCorrigida - 1) * porPagina;
    return linhasFiltradas.slice(start, start + porPagina);
  }, [linhasFiltradas, paginaCorrigida, porPagina]);

  const formatDateTime = (s?: string) => s ? new Date(s).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const diffHHmm = (ini?: string, fim?: string) => {
    if (!ini || !fim) return '';
    const a = new Date(ini).getTime();
    const b = new Date(fim).getTime();
    if (isNaN(a) || isNaN(b) || b < a) return '';
    const m = Math.floor((b - a) / 60000);
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const kmTotalFmt = (ini?: number | null, fim?: number | null) => {
    if (ini == null || fim == null) return '';
    const diff = Number(fim) - Number(ini);
    if (!isFinite(diff)) return '';
    if (diff < 50) return 'Franquia';
    return diff.toFixed(1);
  };

  const dadosVeiculo = (o: OcorrenciaRow) => [o.modelo1, o.cor1].filter(Boolean).join(' • ');
  const resultadoUnificado = (o: OcorrenciaRow) => [o.resultado, o.sub_resultado].filter(Boolean).join(' / ');

  const isPrestadorCadastrado = (nome?: string | null) => {
    if (!nome) return false;
    return prestadoresNomeSet.has(normalizarNome(nome));
  };

  const getPrestadorCadastradoFlag = (o: OcorrenciaRow): boolean => {
    const nome = o.prestador;
    if (!nome) return false;
    const cache = apoiosCache[o.id];
    if (cache && Array.isArray(cache)) {
      const alvo = normalizarNome(nome);
      const match = cache.find(a => normalizarNome(a.nome_prestador) === alvo);
      if (match) return !!(match.is_prestador_cadastrado || match.prestador_id);
    }
    return isPrestadorCadastrado(nome);
  };

  const carregarApoios = async (ocId: number) => {
    if (apoiosCache[ocId]) return;
    try {
      const res = await api.get(`/api/v1/apoios-adicionais/${ocId}`);
      const arr: ApoioAdicional[] = Array.isArray(res.data) ? res.data.map((a: any) => ({
        id: a.id,
        nome_prestador: a.nome_prestador,
        is_prestador_cadastrado: !!a.is_prestador_cadastrado,
        prestador_id: a.prestador_id ?? null,
        hora_inicial: a.hora_inicial ?? null,
        hora_inicial_local: a.hora_inicial_local ?? null,
        hora_final: a.hora_final ?? null,
        km_inicial: a.km_inicial ?? null,
        km_final: a.km_final ?? null,
        ordem: a.ordem ?? null
      })) : [];
      setApoiosCache(prev => ({ ...prev, [ocId]: arr }));
    } catch (e) {
      setApoiosCache(prev => ({ ...prev, [ocId]: [] }));
    }
  };

  // Pré-carrega apoios das linhas visíveis para reduzir falsos negativos
  useEffect(() => {
    visiveis.forEach(o => {
      if (!apoiosCache[o.id]) carregarApoios(o.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiveis]);

  const exportarExcel = async () => {
    const rows = linhasFiltradas.map(o => {
      const a2 = getSegundoApoio(o);
      const despesasStr = (() => {
        try {
          const det = o.despesas_detalhadas;
          const arr = Array.isArray(det) ? det : (typeof det === 'string' ? JSON.parse(det) : []);
          if (!arr || arr.length === 0) return '';
          return arr.map((d: any) => `${String(d?.tipo || d?.nome || 'Item')}: R$ ${(Number(d?.valor)||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('; ');
        } catch { return ''; }
      })();

      const resultadoFmt = resultadoUnificado(o).replace(/_/g, ' ');
      return ({
      ID: o.id,
      'Data do Acionamento': o.data_acionamento ? new Date(o.data_acionamento).toLocaleDateString('pt-BR') : '',
      Cliente: o.cliente || '',
      Subcliente: o.sub_cliente || '',
      'Tipo de Ocorrência': o.tipo || '',
      'Tipo de Veículo': o.tipo_veiculo || '',
      Operador: o.operador || '',
      Placa: o.placa1 || '',
      'Dados do Veículo': dadosVeiculo(o),
      Resultado: resultadoFmt,
      Endereco: o.endereco || '',
      Bairro: o.bairro || '',
      Cidade: o.cidade || '',
      Estado: o.estado || '',
      'Início': formatDateTime(o.inicio),
      'Chegada (Local)': formatDateTime(o.chegada),
      'Término': formatDateTime(o.termino),
      'Tempo Total': diffHHmm(o.chegada, o.termino),
      'Km Inicial': o.km_inicial ?? '',
      'Km Final': o.km_final ?? '',
      'Km Total': kmTotalFmt(o.km_inicial, o.km_final),
      Prestador: o.prestador || '',
      'Prestador Cadastrado': getPrestadorCadastradoFlag(o) ? 'Sim' : 'Não',
      'Início 2º Apoio': a2 ? formatDateTime(a2.hora_inicial || undefined) : '',
      'Chegada (Local) 2º Apoio': a2 ? formatDateTime(a2.hora_inicial_local || undefined) : '',
      'Término 2º Apoio': a2 ? formatDateTime(a2.hora_final || undefined) : '',
      'Tempo Total 2º Apoio': a2 ? diffHHmm(a2.hora_inicial_local || undefined, a2.hora_final || undefined) : '',
      'Km Ini 2º Apoio': a2?.km_inicial ?? '',
      'Km Fim 2º Apoio': a2?.km_final ?? '',
      'Km Total 2º Apoio': kmTotalApoioFmt(a2),
      'Despesas Detalhadas': despesasStr,
      'Total de Despesas': calcularTotalDespesas(o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    });
    });
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 8 },  // ID
        { wch: 14 }, // Data do Acionamento
        { wch: 24 }, // Cliente
        { wch: 20 }, // Subcliente
        { wch: 18 }, // Tipo Ocorrência
        { wch: 18 }, // Tipo Veículo
        { wch: 16 }, // Operador
        { wch: 12 }, // Placa
        { wch: 26 }, // Dados do Veículo
        { wch: 22 }, // Resultado
        { wch: 30 }, // Endereço
        { wch: 18 }, // Bairro
        { wch: 18 }, // Cidade
        { wch: 10 }, // UF
        { wch: 18 }, // Início
        { wch: 18 }, // Chegada (Local)
        { wch: 18 }, // Término
        { wch: 12 }, // Tempo Total
        { wch: 10 }, // Km Inicial
        { wch: 10 }, // Km Final
        { wch: 12 }, // Km Total
        { wch: 24 }, // Prestador
        { wch: 16 }, // Prestador Cadastrado
        { wch: 18 }, // Início 2º Apoio
        { wch: 18 }, // Chegada (Local) 2º Apoio
        { wch: 18 }, // Término 2º Apoio
        { wch: 16 }, // Tempo Total 2º Apoio
        { wch: 12 }, // Km Ini 2º Apoio
        { wch: 12 }, // Km Fim 2º Apoio
        { wch: 14 }, // Km Total 2º Apoio
        { wch: 40 }, // Despesas Detalhadas
        { wch: 16 }  // Total de Despesas
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'ControleDetalhado');
      XLSX.writeFile(wb, `controle-detalhado-${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (e) {
      window.print();
    }
  };

  const calcularTotalDespesas = (o: OcorrenciaRow) => {
    try {
      const det = o.despesas_detalhadas;
      if (!det) return 0;
      const arr = Array.isArray(det) ? det : (typeof det === 'string' ? JSON.parse(det) : []);
      return arr.reduce((acc: number, d: any) => acc + (Number(d?.valor) || 0), 0);
    } catch { return 0; }
  };

  useEffect(() => {
    // Entrar em fullscreen se solicitado por query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('fs') === '1') {
      const el = document.documentElement as any;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    }
  }, []);

  const getSegundoApoio = (o: OcorrenciaRow): ApoioAdicional | undefined => {
    const lista = apoiosCache[o.id];
    if (!lista || lista.length === 0) return undefined;
    const ordem2 = lista.find(a => (a.ordem ?? 0) === 2);
    return ordem2 || lista[0];
  };

  const kmTotalApoioFmt = (a?: ApoioAdicional) => {
    if (!a) return '';
    if (a.km_inicial == null || a.km_final == null) return '';
    const diff = Number(a.km_final) - Number(a.km_inicial);
    if (!isFinite(diff)) return '';
    if (diff < 50) return 'Franquia';
    return diff.toFixed(1);
  };

  return (
    <PageAccessControl pageKey="access:financeiro">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-6">
        <div className="max-w-[98vw] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white border border-white/20" onClick={() => navigate('/financeiro')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <h1 className="text-white text-2xl font-bold flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-300" /> Controle Detalhado
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportarExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Download className="w-4 h-4 mr-2"/> Exportar Excel</Button>
              <Button onClick={() => window.print()} variant="ghost" className="text-white border border-white/20">Exportar PDF</Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Filter className="w-4 h-4 inline mr-1"/>Busca</label>
                <Input placeholder="Buscar por texto" value={filtros.busca} onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <Select value={filtros.cliente} onValueChange={v => setFiltros(f => ({ ...f, cliente: v }))}>
                  <SelectTrigger><SelectValue placeholder="Cliente"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {clientesUnicos.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operador</label>
                <Select value={filtros.operador} onValueChange={v => setFiltros(f => ({ ...f, operador: v }))}>
                  <SelectTrigger><SelectValue placeholder="Operador"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {operadoresUnicos.map(o => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4 inline mr-1"/> Período</label>
                <Select value={filtros.periodoTipo} onValueChange={(v: any) => setFiltros(f => ({ ...f, periodoTipo: v }))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tudo">Tudo</SelectItem>
                    <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                    <SelectItem value="mes_atual">Mês atual</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                {filtros.periodoTipo === 'personalizado' && (
                  <div className="flex gap-2 w-full">
                    <Input type="date" value={filtros.dataInicio || ''} onChange={e => setFiltros(f => ({ ...f, dataInicio: e.target.value }))}/>
                    <Input type="date" value={filtros.dataFim || ''} onChange={e => setFiltros(f => ({ ...f, dataFim: e.target.value }))}/>
                  </div>
                )}
              </div>
            </div>
            { (filtros.busca || filtros.cliente !== 'todos' || filtros.operador !== 'todos' || filtros.periodoTipo !== 'mes_atual') && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500"><Filter className="w-3 h-3 inline mr-1"/>Filtros ativos</span>
                {filtros.busca && (<span className="px-2 py-1 bg-slate-100 rounded-full">Busca: {filtros.busca} <button className="ml-1" onClick={() => setFiltros(f => ({ ...f, busca: '' }))}><X className="w-3 h-3"/></button></span>)}
                {filtros.cliente !== 'todos' && (<span className="px-2 py-1 bg-slate-100 rounded-full">Cliente: {filtros.cliente} <button className="ml-1" onClick={() => setFiltros(f => ({ ...f, cliente: 'todos' }))}><X className="w-3 h-3"/></button></span>)}
                {filtros.operador !== 'todos' && (<span className="px-2 py-1 bg-slate-100 rounded-full">Operador: {filtros.operador} <button className="ml-1" onClick={() => setFiltros(f => ({ ...f, operador: 'todos' }))}><X className="w-3 h-3"/></button></span>)}
              </div>
            )}
          </div>

          {/* Tabela */}
          <div className="bg-white/90 rounded-xl shadow-lg border border-white/20 overflow-auto" style={{ maxHeight: '70vh' }}>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Acionamento</th>
                  <th className="px-3 py-2 text-left">Cliente</th>
                  <th className="px-3 py-2 text-left">Subcliente</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Veículo</th>
                  <th className="px-3 py-2 text-left">Operador</th>
                  <th className="px-3 py-2 text-left">Placa</th>
                  <th className="px-3 py-2 text-left">Dados do Veículo</th>
                  <th className="px-3 py-2 text-left">Resultado</th>
                  <th className="px-3 py-2 text-left">Endereço</th>
                  <th className="px-3 py-2 text-left">Bairro</th>
                  <th className="px-3 py-2 text-left">Cidade</th>
                  <th className="px-3 py-2 text-left">UF</th>
                  <th className="px-3 py-2 text-left">Início</th>
                  <th className="px-3 py-2 text-left">Chegada (Local)</th>
                  <th className="px-3 py-2 text-left">Término</th>
                  <th className="px-3 py-2 text-left">Tempo Total</th>
                  <th className="px-3 py-2 text-right">Km Ini</th>
                  <th className="px-3 py-2 text-right">Km Fim</th>
                  <th className="px-3 py-2 text-right">Km Total</th>
                  <th className="px-3 py-2 text-left">Prestador</th>
                  <th className="px-3 py-2 text-left">2º Apoio</th>
                  <th className="px-3 py-2 text-left">2º Apoio Cadastrado</th>
                  <th className="px-3 py-2 text-left">Início 2º Apoio</th>
                  <th className="px-3 py-2 text-left">Chegada (Local) 2º Apoio</th>
                  <th className="px-3 py-2 text-left">Término 2º Apoio</th>
                  <th className="px-3 py-2 text-left">Tempo Total 2º Apoio</th>
                  <th className="px-3 py-2 text-right">Km Ini 2º Apoio</th>
                  <th className="px-3 py-2 text-right">Km Fim 2º Apoio</th>
                  <th className="px-3 py-2 text-right">Km Total 2º Apoio</th>
                  <th className="px-3 py-2 text-left">Despesas Detalhadas</th>
                  <th className="px-3 py-2 text-right">Total Despesas</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr><td className="p-4" colSpan={22}>Carregando...</td></tr>
                ) : visiveis.length === 0 ? (
                  <tr><td className="p-4" colSpan={22}>Nenhuma ocorrência encontrada</td></tr>
                ) : (
                  visiveis.map((o) => (
                    <tr key={o.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium">{o.id}</td>
                      <td className="px-3 py-2">{o.data_acionamento ? new Date(o.data_acionamento).toLocaleDateString('pt-BR') : ''}</td>
                      <td className="px-3 py-2">{o.cliente}</td>
                      <td className="px-3 py-2">{o.sub_cliente || ''}</td>
                      <td className="px-3 py-2">{o.tipo || ''}</td>
                      <td className="px-3 py-2">{o.tipo_veiculo || ''}</td>
                      <td className="px-3 py-2">{o.operador || ''}</td>
                      <td className="px-3 py-2">{o.placa1 || ''}</td>
                      <td className="px-3 py-2">{dadosVeiculo(o)}</td>
                      <td className="px-3 py-2">{resultadoUnificado(o)}</td>
                      <td className="px-3 py-2 max-w-[240px] truncate" title={o.endereco || ''}>{o.endereco || ''}</td>
                      <td className="px-3 py-2">{o.bairro || ''}</td>
                      <td className="px-3 py-2">{o.cidade || ''}</td>
                      <td className="px-3 py-2">{o.estado || ''}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(o.inicio)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(o.chegada)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(o.termino)}</td>
                      <td className="px-3 py-2">{diffHHmm(o.chegada, o.termino)}</td>
                      <td className="px-3 py-2 text-right">{o.km_inicial ?? ''}</td>
                      <td className="px-3 py-2 text-right">{o.km_final ?? ''}</td>
                      <td className="px-3 py-2 text-right">{kmTotalFmt(o.km_inicial, o.km_final)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span>{o.prestador || ''}</span>
                          {o.prestador && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPrestadorCadastradoFlag(o) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {getPrestadorCadastradoFlag(o) ? 'Cadastrado' : 'Não Cadastrado'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {!apoiosCache[o.id] ? (
                          <Button variant="ghost" size="sm" onClick={() => carregarApoios(o.id)}>Carregar</Button>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {apoiosCache[o.id].length === 0 ? (
                              <span className="text-xs text-slate-500">—</span>
                            ) : (
                              apoiosCache[o.id].map(a => (
                                <div key={a.id} className="text-xs flex items-center gap-2">
                                  <span>{a.nome_prestador}</span>
                                  <span className={`px-2 py-0.5 rounded-full ${a.is_prestador_cadastrado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{a.is_prestador_cadastrado ? 'Cadastrado' : 'Não Cadastrado'}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </td>
                      {(() => {
                        const a2 = getSegundoApoio(o);
                        return (
                          <>
                            <td className="px-3 py-2">
                              {a2 ? (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${a2.is_prestador_cadastrado || a2.prestador_id ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {a2.is_prestador_cadastrado || a2.prestador_id ? 'Cadastrado' : 'Não Cadastrado'}
                                </span>
                              ) : ''}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">{a2 ? formatDateTime(a2.hora_inicial || undefined) : ''}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{a2 ? formatDateTime(a2.hora_inicial_local || undefined) : ''}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{a2 ? formatDateTime(a2.hora_final || undefined) : ''}</td>
                            <td className="px-3 py-2">{a2 ? diffHHmm(a2.hora_inicial_local || undefined, a2.hora_final || undefined) : ''}</td>
                            <td className="px-3 py-2 text-right">{a2?.km_inicial ?? ''}</td>
                            <td className="px-3 py-2 text-right">{a2?.km_final ?? ''}</td>
                            <td className="px-3 py-2 text-right">{kmTotalApoioFmt(a2)}</td>
                          </>
                        );
                      })()}
                      <td className="px-3 py-2">
                        <div className="text-xs max-w-[280px]">
                          {(() => {
                            try {
                              const det = o.despesas_detalhadas;
                              const arr = Array.isArray(det) ? det : (typeof det === 'string' ? JSON.parse(det) : []);
                              if (!arr || arr.length === 0) return <span className="text-slate-400">—</span>;
                              return (
                                <details>
                                  <summary className="cursor-pointer text-blue-600 hover:underline">Ver detalhes</summary>
                                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                                    {arr.map((d: any, idx: number) => (
                                      <li key={idx}>{String(d?.tipo || d?.nome || 'Item')} — R$ {(Number(d?.valor)||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                                    ))}
                                  </ul>
                                </details>
                              );
                            } catch { return <span className="text-slate-400">—</span>; }
                          })()}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">R$ {calcularTotalDespesas(o).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-3 text-sm text-white/90">
            <div>Mostrando {(paginaCorrigida - 1) * porPagina + 1} - {Math.min(paginaCorrigida * porPagina, linhasFiltradas.length)} de {linhasFiltradas.length}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-white border border-white/20" disabled={paginaCorrigida === 1} onClick={() => setPagina(p => Math.max(1, p - 1))}>Anterior</Button>
              <span>Página {paginaCorrigida} / {totalPaginas}</span>
              <Button variant="ghost" className="text-white border border-white/20" disabled={paginaCorrigida === totalPaginas} onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}>Próxima</Button>
              <Select value={String(porPagina)} onValueChange={(v) => { setPorPagina(Number(v)); setPagina(1); }}>
                <SelectTrigger className="w-24 bg-white/90"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </PageAccessControl>
  );
};

export default ControleDetalhadoPage;


