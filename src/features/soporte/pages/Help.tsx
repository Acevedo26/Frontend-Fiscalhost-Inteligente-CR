import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Badge } from '../../../components/common/Badge';
import { Search } from 'lucide-react';
import { guias } from '../components/HelpData';
import type { Guia } from '../components/HelpData';
import { HelpModal } from '../components/HelpModal';
import './Help.css';

const categorias = ['Todas', ...new Set(guias.map(g => g.categoria))];

export const Help: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [selectedGuia, setSelectedGuia] = useState<Guia | null>(null);

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
      </Card>

      <div className="guias-grid">
        {filteredGuias.map(guia => (
          <Card 
            key={guia.id} 
            variant="interactive" 
            padding="md"
            onClick={() => setSelectedGuia(guia)}
          >
            <div className="guia-card">
              <span className="guia-icono">{guia.icono}</span>
              <Badge variant={guia.categoria === 'IVA' ? 'info' : guia.categoria === 'Renta' ? 'success' : guia.categoria === 'Sanciones' ? 'danger' : 'default'}>
                {guia.categoria}
              </Badge>
              <h3>{guia.titulo}</h3>
              <p>{guia.descripcion}</p>
            </div>
          </Card>
        ))}
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
      />
    </div>
  );
};

export default Help;