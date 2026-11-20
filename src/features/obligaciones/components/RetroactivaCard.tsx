import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { AlertTriangle, Info } from 'lucide-react';
import { showInfo } from '../../../utils/alerts';

const TARIFAS_HISTORICAS: Record<number, { iva: number; renta: number; nota: string }> = {
  2024: { iva: 0.13, renta: 0.1275, nota: 'Tarifa vigente desde Ley 9635' },
  2025: { iva: 0.13, renta: 0.1275, nota: 'Sin cambios normativos' },
  2026: { iva: 0.13, renta: 0.1275, nota: 'Tarifa actual' },
};

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export const RetroactivaCard: React.FC = () => {
  const navigate = useNavigate();
  const [anoRetro, setAnoRetro] = useState(2026);

  const handleCompletarAhora = () => {
    navigate('/comprobantes');
  };

  const handleContinuarDisponibles = () => {
    showInfo('Reconstrucción en Curso', 'Se continuará el cálculo retroactivo considerando las transacciones y comprobantes actualmente cargados.');
  };

  return (
    <Card variant="outlined" padding="md">
      <div className="retro-header">
        <h3>Reconstrucción Retroactiva</h3>
        <div className="ano-selector">
          {[2024, 2025, 2026].map(a => (
            <button key={a} className={`ano-btn ${anoRetro === a ? 'active' : ''}`} onClick={() => setAnoRetro(a)}>{a}</button>
          ))}
        </div>
      </div>
      <div className="historial-timeline">
        <div className="timeline-months-labels">
          {['E','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
            <span key={i} className="timeline-month-label">{m}</span>
          ))}
        </div>
        {[anoRetro].map(ano => {
          const meses = Array(12).fill(null);
          const incompletos = meses.filter(m => m === false).length;
          return (
            <div key={ano}>
              {incompletos > 0 && (
                <div className="banner-incompleto">
                  <AlertTriangle size={14} />
                  {incompletos} meses incompletos.
                  <button className="link-btn-retro" onClick={handleCompletarAhora}>Completar ahora</button>
                  <button className="link-btn-retro" onClick={handleContinuarDisponibles}>Continuar con disponibles</button>
                </div>
              )}
              <div className="timeline-year">
                <div className="timeline-year-header">
                  <span className="timeline-year-label">{ano}</span>
                  <Badge variant={incompletos === 0 ? 'success' : 'warning'} size="sm">
                    {incompletos === 0 ? 'COMPLETO' : 'INCOMPLETO'}
                  </Badge>
                </div>
                <div className="timeline-months">
                  {meses.map((completo, idx) => (
                    <div key={idx}
                      className={`timeline-month ${completo === true ? 'complete' : completo === false ? 'incomplete' : 'empty'}`}
                      title={`${MESES[idx]} ${ano} — IVA: ${(TARIFAS_HISTORICAS[ano]?.iva * 100).toFixed(0)}% | ${TARIFAS_HISTORICAS[ano]?.nota}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="retro-tarifa-nota">
        <Info size={14} />
        <span>Tarifa aplicada {anoRetro}: IVA {(TARIFAS_HISTORICAS[anoRetro]?.iva * 100).toFixed(0)}% · Renta {(TARIFAS_HISTORICAS[anoRetro]?.renta * 100).toFixed(2)}% — {TARIFAS_HISTORICAS[anoRetro]?.nota}</span>
      </div>
    </Card>
  );
};
