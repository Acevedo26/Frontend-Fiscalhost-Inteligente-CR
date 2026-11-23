import React, { useState, useCallback } from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Badge } from '../../../components/common/Badge';
import { Search, CheckCircle } from 'lucide-react';
import { guias } from '../components/HelpData';
import type { Guia } from '../components/HelpData';
import { HelpModal } from '../components/HelpModal';
import './Help.css';

const CLAVE_COMPLETADAS = 'fiscalhost_guias_completadas';

const cargarCompletadas = (): Set<string> => {
  try {
    const raw = localStorage.getItem(CLAVE_COMPLETADAS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const guardarCompletadas = (completadas: Set<string>) => {
  try {
    localStorage.setItem(CLAVE_COMPLETADAS, JSON.stringify([...completadas]));
  } catch {
    // localStorage no disponible; se ignora sin romper la UI
  }
};

const categorias = ['Todas', ...new Set(guias.map(g => g.categoria))];

export const Help: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [selectedGuia, setSelectedGuia] = useState<Guia | null>(null);
  const [completadas, setCompletadas] = useState<Set<string>>(cargarCompletadas);

  const estaCompletada = useCallback((id: string) => completadas.has(id), [completadas]);

  const marcarCompletada = useCallback((id: string) => {
    setCompletadas(prev => {
      const siguiente = new Set(prev);
      siguiente.add(id);
      guardarCompletadas(siguiente);
      return siguiente;
    });
  }, []);

  const filteredGuias = guias.filter(guia => {
    const matchesSearch = guia.titulo.toLowerCase().includes(search.toLowerCase()) ||
                           guia.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchesCategoria = categoriaFilter === 'Todas' || guia.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="help-page">
      <div className="page-header">
        <div>
          <h1>Guías Educativas</h1>
          <p>Aprende sobre tus obligaciones fiscales de forma sencilla</p>
        </div>
      </div>

      <Card variant="outlined" padding="md">
        <div className="search-section">
          <div className="search-input">
            <Input
              placeholder="Buscar términos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="category-filters">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`category-btn ${categoriaFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoriaFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="progreso-resumen">
          {completadas.size} de {guias.length} guías completadas
        </div>
      </Card>

      <div className="guias-grid">
        {filteredGuias.map(guia => {
          const completada = estaCompletada(guia.id);
          return (
            <Card 
              key={guia.id} 
              variant="interactive" 
              padding="md"
              onClick={() => setSelectedGuia(guia)}
              className={completada ? 'guia-card-completada' : ''}
            >
              <div className="guia-card">
                <div className="guia-header-fila">
                  <span className="guia-icono">{guia.icono}</span>
                  {completada && <CheckCircle size={20} className="guia-check" />}
                </div>
                <Badge variant={guia.categoria === 'IVA' ? 'info' : guia.categoria === 'Renta' ? 'success' : guia.categoria === 'Sanciones' ? 'danger' : 'default'}>
                  {guia.categoria}
                </Badge>
                {completada && <span className="guia-badge-completada">Completada</span>}
                <h3>{guia.titulo}</h3>
                <p>{guia.descripcion}</p>
                {guia.pasos && guia.pasos.length > 0 && (
                  <span className="guia-pasos-contador">{guia.pasos.length} pasos</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredGuias.length === 0 && (
        <Card variant="outlined" padding="lg">
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No se encontraron guías</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        </Card>
      )}

      <HelpModal 
        selectedGuia={selectedGuia} 
        onClose={() => setSelectedGuia(null)}
        onComplete={() => {
          if (selectedGuia) marcarCompletada(selectedGuia.id);
          setSelectedGuia(null);
        }}
      />
    </div>
  );
};

export default Help;
