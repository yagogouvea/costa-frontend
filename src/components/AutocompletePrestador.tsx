import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface AutocompletePrestadorProps {
  onSelect: (prestador: string) => void;
}

const AutocompletePrestador: React.FC<AutocompletePrestadorProps> = ({ onSelect }) => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const buscarPrestadores = async () => {
      if (input.length < 2) return;

      try {
        const { data } = await api.get(`/api/v1/prestadores/buscar?q=${encodeURIComponent(input)}`);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Erro ao buscar prestadores:', err);
        setResults([]);
      }
    };

    buscarPrestadores();
  }, [input]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Buscar prestador..."
        className="w-full border p-2 rounded"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 bg-white shadow border rounded w-full max-h-48 overflow-y-auto mt-1">
          {results.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                onSelect(item.nome);
                setInput("");
                setResults([]);
              }}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {item.nome} {item.codinome && `– ${item.codinome}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompletePrestador;
