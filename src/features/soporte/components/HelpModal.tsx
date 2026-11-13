import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import type { Guia } from './HelpData';

interface HelpModalProps {
  selectedGuia: Guia | null;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ selectedGuia, onClose }) => {
  return (
    <Modal 
      isOpen={!!selectedGuia} 
      onClose={onClose} 
      title={selectedGuia?.titulo || ''}
      size="lg"
    >
      {selectedGuia && (
        <div className="guia-modal">
          <div className="guia-header">
            <span className="guia-icono-large">{selectedGuia.icono}</span>
            <Badge variant={selectedGuia.categoria === 'IVA' ? 'info' : 'success'}>
              {selectedGuia.categoria}
            </Badge>
          </div>
          <div className="guia-contenido">
            <p className="guia-intro">{selectedGuia.descripcion}</p>
            <div className="guia-body">
              {selectedGuia.contenido.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
                if (line.startsWith('## ')) return <h3 key={i}>{line.slice(3)}</h3>;
                if (line.startsWith('> ')) return <blockquote key={i}>{line.slice(2)}</blockquote>;
                if (line.startsWith('|')) return <p key={i} className="table-line">{line}</p>;
                if (line.startsWith('```')) return null;
                if (line.trim()) return <p key={i}>{line}</p>;
                return <br key={i} />;
              })}
            </div>
          </div>
          <div className="guia-footer">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <a 
              href="https://www.hacienda.go.cr" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="primary">
                Ver normativa en Hacienda
              </Button>
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
};
