import React, { useEffect, useMemo, useState } from 'react';
import PageAccessControl from '@/components/PageAccessControl';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Filter, Table } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { definirMacro } from '@/utils/cidadeUtils';
import { formatarResultadoCompleto } from '@/utils/resultadoUtils';

interface Row {
  id: number;
  data_acionamento?: string;
  placa1?: string;
  prestador?: string;
  tipo?: string;
  status?: string;
  substatus?: string;
  sub_status?: string;
  sub_status_descricao?: string;
  inicio?: string;
  chegada?: string;
  termino?: string;
  km_inicial?: number | null;
  km_final?: number | null;
  despesas_detalhadas?: any;
  valor_acionamento?: number | null;
  valor_hora_adc?: number | null;
  valor_km_adc?: number | null;
  estado?: string;
  cidade?: string;
}

const ControlePrestadoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState<'mes_atual'|'7d'|'30d'|'personalizado'|'tudo'>('mes_atual');
  const [ini, setIni] = useState('');
  const [fim, setFim] = useState('');

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/v1/ocorrencias/dashboard');
        const data: Row[] = Array.isArray(res.data) ? res.data : [];
        const finalizadas = data.filter((o: any) => String(o.status||'').toLowerCase() !== 'em_andamento');
        
        // Debug: verificar estrutura dos dados
        console.log('Dados da API:', data.slice(0, 2));
        console.log('Primeira ocorrência finalizada:', finalizadas[0]);
        
        setRows(finalizadas);
        
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const diffHHmm = (a?: string, b?: string) => {
    if (!a || !b) return '';
    const t1 = new Date(a).getTime();
    const t2 = new Date(b).getTime();
    if (!isFinite(t1) || !isFinite(t2) || t2 < t1) return '';
    const m = Math.floor((t2 - t1)/60000);
    const hh = String(Math.floor(m/60)).padStart(2,'0');
    const mm = String(m%60).padStart(2,'0');
    return `${hh}:${mm}`;
  };


  const kmTotal = (ini?: number|null, fim?: number|null) => {
    if (ini==null || fim==null) return '';
    const d = Number(fim) - Number(ini);
    if (!isFinite(d)) return '';
    return d.toFixed(1);
  };

  const despesasTotal = (r: Row) => {
    try {
      const det = r.despesas_detalhadas;
      const arr = Array.isArray(det) ? det : (typeof det === 'string' ? JSON.parse(det) : []);
      return arr.reduce((acc:number, d:any)=>acc+(Number(d?.valor)||0),0);
    } catch { return 0; }
  };

  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString('pt-BR') : '';

  const resultadoUnificado = (r: Row) => {
    // Usar a função utilitária para formatar corretamente o resultado do popup de encerramento
    return formatarResultadoCompleto(r.resultado, r.sub_resultado);
  };


  // Função para calcular valores com franquia
  const calcularValoresFinanceiros = (r: Row) => {
    // Fallback: se não tiver estado/cidade, assumir São Paulo para teste
    const estado = r.estado || 'SP';
    const cidade = r.cidade || 'São Paulo';
    const macro = definirMacro(estado, cidade);
    const tipo = String(r.tipo || '').toLowerCase();
    
    // Aplicar lógica apenas para São Paulo/Grande SP + tipos específicos
    const isAntenista = tipo.includes('antenista');
    const isRouboFurto = tipo.includes('roubo') || tipo.includes('furto');
    const isSuspeita = tipo.includes('suspeita');
    const isPreservacao = tipo.includes('preservação') || tipo.includes('preservacao') || tipo.includes('preserva');
    const isApropriacao = tipo.includes('apropriação') || tipo.includes('apropriacao') || tipo.includes('apropria');
    const isSimplesVerificacao = tipo.includes('simples verificação') || tipo.includes('simples verificacao') || tipo.includes('simples verific');
    const isSaoPaulo = macro === 'CAPITAL' || macro === 'GRANDE SP';
    
    // Para Apropriação, verificar se o resultado é "recuperado" ou "concluida"
    const resultado = resultadoUnificado(r).toLowerCase();
    const isRecuperado = resultado.includes('recuperado') || resultado.includes('concluida') || resultado.includes('concluído');
    
    // Debug log
    console.log('Debug cálculo:', {
      id: r.id,
      tipo,
      estado_original: r.estado,
      cidade_original: r.cidade,
      estado_fallback: estado,
      cidade_fallback: cidade,
      macro,
      isRouboFurto,
      isSuspeita,
      isPreservacao,
      isApropriacao,
      isSaoPaulo,
      resultado,
      isRecuperado,
      chegada: r.chegada,
      termino: r.termino,
      km_inicial: r.km_inicial,
      km_final: r.km_final
    });
    
    // Nova regra: Antenista (roubo, furto, suspeita) - PRIORIDADE ALTA
    if (isAntenista) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        
        // Para Interior e outros estados, usar R$ 35,00 hora adicional
        const valorHoraAdicional = !isSaoPaulo ? 35.00 : 30.00;
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * valorHoraAdicional : 0;
      }

      return {
        valor_acionamento: 250.00, // R$ 250,00 para antenista
        valor_hora_adc: horaAdicional, // R$ 35,00 para Interior/Outros Estados, R$ 30,00 para SP
        valor_km_adc: kmAdicional // R$ 1,00 km adicional
      };
    }
    
    // Aplicar lógica para Roubo/Furto
    if (isRouboFurto && isSaoPaulo) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * 30.00 : 0;
      }

      return {
        valor_acionamento: 150.00, // Valor fixo para SP + Roubo/Furto
        valor_hora_adc: horaAdicional,
        valor_km_adc: kmAdicional
      };
    }
    
    // Nova regra: Suspeita (mesma tabela de Roubo/Furto para São Paulo)
    if (isSuspeita && isSaoPaulo) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * 30.00 : 0;
      }

      return {
        valor_acionamento: 150.00, // Valor fixo para SP + Suspeita (mesma tabela de Roubo/Furto)
        valor_hora_adc: horaAdicional,
        valor_km_adc: kmAdicional
      };
    }
    
    // Nova regra: Suspeita (mesma tabela de Roubo/Furto para Interior e outros estados)
    if (isSuspeita && !isSaoPaulo) {
      const resultado = resultadoUnificado(r).toLowerCase();
      const isRecuperado = resultado.includes('recuperado');
      const isNaoRecuperado = resultado.includes('não recuperado') || resultado.includes('nao recuperado');
      
      if (isRecuperado || isNaoRecuperado) {
        // Calcular km adicional (franquia de 50km)
        const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
        const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

        // Calcular hora adicional (franquia de 3h)
        const tempoTotal = diffHHmm(r.chegada, r.termino);
        let horaAdicional = 0;
        
        if (tempoTotal && tempoTotal !== '') {
          const [horas, minutos] = tempoTotal.split(':').map(Number);
          const totalMinutos = (horas || 0) * 60 + (minutos || 0);
          const franquiaMinutos = 3 * 60; // 3 horas em minutos
          horaAdicional = totalMinutos >= franquiaMinutos ? 
            ((totalMinutos - franquiaMinutos) / 60) * 35.00 : 0; // R$ 35,00 hora adicional
        }

        return {
          valor_acionamento: 200.00, // R$ 200,00 para Interior/Outros Estados + Suspeita
          valor_hora_adc: horaAdicional, // R$ 35,00 hora adicional
          valor_km_adc: kmAdicional // R$ 1,00 km adicional
        };
      }
    }
    
    // Nova regra: Preservação (recuperadas ou não recuperadas) em São Paulo e Grande SP
    if (isPreservacao && isSaoPaulo) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * 30.00 : 0;
      }

      return {
        valor_acionamento: 200.00, // R$ 200,00 para Preservação em SP/GRANDE SP
        valor_hora_adc: horaAdicional, // R$ 30,00 hora adicional
        valor_km_adc: kmAdicional // R$ 1,00 km adicional
      };
    }
    
    // Nova regra: Preservação (recuperadas ou não recuperadas) no Interior e outros estados
    if (isPreservacao && !isSaoPaulo) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * 35.00 : 0; // R$ 35,00 hora adicional para Interior/Outros Estados
      }

      return {
        valor_acionamento: 200.00, // R$ 200,00 para Preservação no Interior/Outros Estados
        valor_hora_adc: horaAdicional, // R$ 35,00 hora adicional
        valor_km_adc: kmAdicional // R$ 1,00 km adicional
      };
    }
    
    // Nova regra: Roubo/Furto no Interior e outros estados (recuperado ou não recuperado)
    if (isRouboFurto && !isSaoPaulo) {
      const resultado = resultadoUnificado(r).toLowerCase();
      const isRecuperado = resultado.includes('recuperado');
      const isNaoRecuperado = resultado.includes('não recuperado') || resultado.includes('nao recuperado');
      
      if (isRecuperado || isNaoRecuperado) {
        // Calcular km adicional (franquia de 50km)
        const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
        const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

        // Calcular hora adicional (franquia de 3h)
        const tempoTotal = diffHHmm(r.chegada, r.termino);
        let horaAdicional = 0;
        
        if (tempoTotal && tempoTotal !== '') {
          const [horas, minutos] = tempoTotal.split(':').map(Number);
          const totalMinutos = (horas || 0) * 60 + (minutos || 0);
          const franquiaMinutos = 3 * 60; // 3 horas em minutos
          horaAdicional = totalMinutos >= franquiaMinutos ? 
            ((totalMinutos - franquiaMinutos) / 60) * 35.00 : 0; // R$ 35,00 hora adicional
        }

        return {
          valor_acionamento: 200.00, // R$ 200,00 para Interior/Outros Estados + Roubo/Furto
          valor_hora_adc: horaAdicional, // R$ 35,00 hora adicional
          valor_km_adc: kmAdicional // R$ 1,00 km adicional
        };
      }
    }
    
    // Aplicar lógica para Apropriação (Recuperado e Não Recuperado)
    if (isApropriacao && isSaoPaulo) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * 30.00 : 0;
      }

      // Definir valor do acionamento baseado no resultado
      const valorAcionamento = isRecuperado ? 200.00 : 100.00;

      return {
        valor_acionamento: valorAcionamento, // R$ 200,00 para Recuperado, R$ 100,00 para Não Recuperado
        valor_hora_adc: horaAdicional,
        valor_km_adc: kmAdicional
      };
    }
    
    // Nova regra: Simples verificação
    if (isSimplesVerificacao) {
      // Calcular km adicional (franquia de 50km)
      const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
      const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

      // Calcular hora adicional (franquia de 3h)
      const tempoTotal = diffHHmm(r.chegada, r.termino);
      let horaAdicional = 0;
      
      if (tempoTotal && tempoTotal !== '') {
        const [horas, minutos] = tempoTotal.split(':').map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0);
        const franquiaMinutos = 3 * 60; // 3 horas em minutos
        
        // Para Interior e outros estados, usar R$ 35,00 hora adicional
        const valorHoraAdicional = !isSaoPaulo ? 35.00 : 30.00;
        horaAdicional = totalMinutos >= franquiaMinutos ? 
          ((totalMinutos - franquiaMinutos) / 60) * valorHoraAdicional : 0;
      }

      return {
        valor_acionamento: 100.00, // R$ 100,00 para simples verificação
        valor_hora_adc: horaAdicional, // R$ 35,00 para Interior/Outros Estados, R$ 30,00 para SP
        valor_km_adc: kmAdicional // R$ 1,00 km adicional
      };
    }
    
    // Nova regra: Apropriação recuperada no Interior e outros estados
    if (isApropriacao && !isSaoPaulo) {
      const resultado = resultadoUnificado(r).toLowerCase();
      const isRecuperada = resultado.includes('recuperado');
      
      if (isRecuperada) {
        // Calcular km adicional (franquia de 50km)
        const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
        const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

        // Calcular hora adicional (franquia de 3h)
        const tempoTotal = diffHHmm(r.chegada, r.termino);
        let horaAdicional = 0;
        
        if (tempoTotal && tempoTotal !== '') {
          const [horas, minutos] = tempoTotal.split(':').map(Number);
          const totalMinutos = (horas || 0) * 60 + (minutos || 0);
          const franquiaMinutos = 3 * 60; // 3 horas em minutos
          horaAdicional = totalMinutos >= franquiaMinutos ? 
            ((totalMinutos - franquiaMinutos) / 60) * 35.00 : 0; // R$ 35,00 hora adicional
        }

        return {
          valor_acionamento: 250.00, // R$ 250,00 para apropriação recuperada no Interior/Outros Estados
          valor_hora_adc: horaAdicional, // R$ 35,00 hora adicional
          valor_km_adc: kmAdicional // R$ 1,00 km adicional
        };
      }
    }
    
    // Nova regra: Para qualquer local, ocorrências do tipo apropriação não recuperada ou localizada
    if (isApropriacao) {
      const resultado = resultadoUnificado(r).toLowerCase();
      const isNaoRecuperada = resultado.includes('não recuperado') || resultado.includes('nao recuperado');
      const isLocalizada = resultado.includes('localizado (simples verificação)') || resultado.includes('localizado');
      
      if (isNaoRecuperada || isLocalizada) {
        // Calcular km adicional (franquia de 50km)
        const kmTotal = Number(r.km_final || 0) - Number(r.km_inicial || 0);
        const kmAdicional = kmTotal >= 50 ? (kmTotal - 50) * 1.00 : 0;

        // Calcular hora adicional (franquia de 3h)
        const tempoTotal = diffHHmm(r.chegada, r.termino);
        let horaAdicional = 0;
        
        if (tempoTotal && tempoTotal !== '') {
          const [horas, minutos] = tempoTotal.split(':').map(Number);
          const totalMinutos = (horas || 0) * 60 + (minutos || 0);
          const franquiaMinutos = 3 * 60; // 3 horas em minutos
          
          // Para Interior e outros estados, usar R$ 35,00 hora adicional
          const valorHoraAdicional = !isSaoPaulo ? 35.00 : 30.00;
          horaAdicional = totalMinutos >= franquiaMinutos ? 
            ((totalMinutos - franquiaMinutos) / 60) * valorHoraAdicional : 0;
        }

        return {
          valor_acionamento: 100.00, // R$ 100,00 para apropriação não recuperada/localizada
          valor_hora_adc: horaAdicional, // R$ 35,00 para Interior/Outros Estados, R$ 30,00 para SP
          valor_km_adc: kmAdicional // R$ 1,00 km adicional
        };
      }
    }
    
    // Manter valores originais para outros casos
    return {
      valor_acionamento: Number(r.valor_acionamento) || 0,
      valor_hora_adc: Number(r.valor_hora_adc) || 0,
      valor_km_adc: Number(r.valor_km_adc) || 0
    };
  };

  const filtrados = useMemo(() => {
    let out = [...rows];
    if (periodo !== 'tudo') {
      const now = new Date();
      let start: Date|undefined; let end: Date|undefined;
      if (periodo === '7d') { start = new Date(); start.setDate(start.getDate()-7); end = now; }
      else if (periodo === '30d') { start = new Date(); start.setDate(start.getDate()-30); end = now; }
      else if (periodo === 'mes_atual') { start = new Date(now.getFullYear(), now.getMonth(), 1); end = now; }
      else if (periodo === 'personalizado' && ini && fim) { start = new Date(ini); end = new Date(fim); end.setHours(23,59,59,999); }
      if (start && end) {
        out = out.filter(r => {
          const d = r.data_acionamento ? new Date(r.data_acionamento) : undefined;
          return d ? d >= start! && d <= end! : true;
        });
      }
    }
    const q = busca.trim().toLowerCase();
    if (q) out = out.filter(r => [r.placa1, r.prestador, r.tipo].map(v=>String(v||'').toLowerCase()).some(v=>v.includes(q)));
    return out;
  }, [rows, periodo, ini, fim, busca]);

  return (
    <PageAccessControl pageKey="access:financeiro">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-6">
        <div className="max-w-[98vw] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white border border-white/20" onClick={()=>navigate('/financeiro')}>
                <ArrowLeft className="w-4 h-4 mr-2"/> Voltar
              </Button>
              <h1 className="text-white text-2xl font-bold flex items-center gap-2"><Table className="w-5 h-5 text-blue-300"/> Controle Prestador</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  console.log('Testando Roubo/Furto...');
                  const testeRow: Row = {
                    id: 999,
                    tipo: 'roubo',
                    estado: 'SP',
                    cidade: 'São Paulo',
                    chegada: '2024-01-01T10:00:00',
                    termino: '2024-01-01T14:30:00',
                    km_inicial: 100,
                    km_final: 180
                  };
                  const resultado = calcularValoresFinanceiros(testeRow);
                  console.log('Resultado Roubo/Furto:', resultado);
                }}
                className="bg-blue-600 text-white"
              >
                Testar Roubo
              </Button>
              <Button 
                onClick={() => {
                  console.log('Testando Apropriação RECUPERADO...');
                  const testeRow: Row = {
                    id: 998,
                    tipo: 'apropriação',
                    estado: 'SP',
                    cidade: 'São Paulo',
                    status: 'finalizado',
                    substatus: 'recuperado',
                    chegada: '2024-01-01T10:00:00',
                    termino: '2024-01-01T14:30:00',
                    km_inicial: 100,
                    km_final: 180
                  };
                  const resultado = calcularValoresFinanceiros(testeRow);
                  console.log('Resultado Apropriação RECUPERADO:', resultado);
                }}
                className="bg-green-600 text-white"
              >
                Apropriação Recuperado
              </Button>
              <Button 
                onClick={() => {
                  console.log('Testando Apropriação NÃO RECUPERADO...');
                  const testeRow: Row = {
                    id: 997,
                    tipo: 'apropriação',
                    estado: 'SP',
                    cidade: 'São Paulo',
                    status: 'finalizado',
                    substatus: 'não recuperado',
                    chegada: '2024-01-01T10:00:00',
                    termino: '2024-01-01T14:30:00',
                    km_inicial: 100,
                    km_final: 180
                  };
                  const resultado = calcularValoresFinanceiros(testeRow);
                  console.log('Resultado Apropriação NÃO RECUPERADO:', resultado);
                }}
                className="bg-red-600 text-white"
              >
                Apropriação Não Recuperado
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Filter className="w-4 h-4 inline mr-1"/>Busca</label>
                <Input placeholder="Placa, prestador, tipo..." value={busca} onChange={e=>setBusca(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4 inline mr-1"/> Período</label>
                <Select value={periodo} onValueChange={(v:any)=>setPeriodo(v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tudo">Tudo</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="mes_atual">Mês atual</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {periodo === 'personalizado' && (
                <div className="flex items-end gap-2 col-span-2">
                  <Input type="date" value={ini} onChange={e=>setIni(e.target.value)} />
                  <Input type="date" value={fim} onChange={e=>setFim(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white/90 rounded-xl shadow-lg border border-white/20 overflow-auto" style={{ maxHeight: '70vh' }}>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Placa</th>
                  <th className="px-3 py-2 text-left">Prestador</th>
                  <th className="px-3 py-2 text-left">Tipo de Ocorrência</th>
                  <th className="px-3 py-2 text-left">Macro</th>
                  <th className="px-3 py-2 text-left">Resultado</th>
                  <th className="px-3 py-2 text-left">Tempo Total</th>
                  <th className="px-3 py-2 text-right">Km Total</th>
                  <th className="px-3 py-2 text-right">Valor Hora Adicional</th>
                  <th className="px-3 py-2 text-right">Valor KM Adicional</th>
                  <th className="px-3 py-2 text-right">Valor do Acionamento</th>
                  <th className="px-3 py-2 text-right">Despesas</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-4" colSpan={13}>Carregando...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td className="p-4" colSpan={13}>Nenhum registro encontrado</td></tr>
                ) : (
                  filtrados.map(r => {
                    const tempo = diffHHmm(r.chegada, r.termino);
                    const km = kmTotal(r.km_inicial, r.km_final);
                    const despesas = despesasTotal(r);
                    const valores = calcularValoresFinanceiros(r);
                    const total = valores.valor_acionamento + valores.valor_hora_adc + valores.valor_km_adc + despesas;
                    return (
                      <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-3 py-2">{formatDate(r.data_acionamento)}</td>
                        <td className="px-3 py-2">{r.placa1 || ''}</td>
                        <td className="px-3 py-2">{r.prestador || ''}</td>
                        <td className="px-3 py-2">{r.tipo || ''}</td>
                        <td className="px-3 py-2">{definirMacro(r.estado, r.cidade)}</td>
                        <td className="px-3 py-2">{resultadoUnificado(r)}</td>
                        <td className="px-3 py-2">{tempo}</td>
                        <td className="px-3 py-2 text-right">{km}</td>
                        <td className="px-3 py-2 text-right">{valores.valor_hora_adc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right">{valores.valor_km_adc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right">{valores.valor_acionamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right">{despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageAccessControl>
  );
};

export default ControlePrestadoresPage;


