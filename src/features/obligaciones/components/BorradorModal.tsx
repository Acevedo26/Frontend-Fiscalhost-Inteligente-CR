import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import { Copy, Check, Download } from 'lucide-react';
import { showSuccess } from '../../../utils/alerts';

interface BorradorItem {
  campo: string;
  valor: string;
}

interface BorradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'iva' | 'renta';
  borradorIVA: BorradorItem[];
}

export const BorradorModal: React.FC<BorradorModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  borradorIVA
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleDescargarBorrador = () => {
    const formCode = activeTab === 'iva' ? 'D-104' : 'D-125';
    const content = [
      `============================================================`,
      `REPUBLICA DE COSTA RICA - MINISTERIO DE HACIENDA`,
      `ADMINISTRACION TRIBUTARIA VIRTUAL (ATV / TRIBU-CR)`,
      `BORRADOR OFICIAL DE LIQUIDACION TRIBUTARIA: FORMULARIO ${formCode}`,
      `Fecha de emision: ${new Date().toLocaleDateString('es-CR')}`,
      `Periodo: Abril 2026`,
      `============================================================`,
      '',
      ...borradorIVA.map(item => `${item.campo.padEnd(45, '.')} : ${item.valor}`),
      '',
      `============================================================`,
      `Documento generado por FiscalHost Inteligente CR`,
      `Certificacion de calculo automatizado Ley 9635 / 8436`,
      `============================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Borrador_${formCode}_Abril_2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess(
      'Borrador Descargado',
      `El borrador oficial del formulario ${formCode} ha sido generado y descargado exitosamente.`
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Borrador ${activeTab === 'iva' ? 'D-104' : 'D-125'}`} size="md">
      <div className="borrador-modal">
        <div className="borrador-estado">
          <Badge variant="success">Datos completos</Badge>
          <span>Período: Abril 2026</span>
        </div>
        <p className="borrador-instruccion">Copia cada sección y pégala directamente en OVi (ATV).</p>
        <div className="borrador-campos">
          {borradorIVA.map(item => (
            <div key={item.campo} className="borrador-campo">
              <div className="borrador-campo-info">
                <span className="borrador-campo-label">{item.campo}</span>
                <span className="borrador-campo-valor">{item.valor}</span>
              </div>
              <button className="copy-btn" onClick={() => handleCopy(item.campo, item.valor)}
                title="Copiar al portapapeles">
                {copiedField === item.campo ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" onClick={handleDescargarBorrador}>
            <Download size={16} /> Descargar borrador PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

