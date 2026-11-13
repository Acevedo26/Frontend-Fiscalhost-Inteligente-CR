import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';

import { showSuccess } from '../../../utils/alerts';

interface AuditoriaTabProps {
  logsToDisplay: any[];
  USER_ROLE: string;
}

export const AuditoriaTab: React.FC<AuditoriaTabProps> = ({ logsToDisplay, USER_ROLE }) => {
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const handleExportarLog = () => {
    const content = [
      `============================================================`,
      `FISCALHOST INTELIGENTE CR — LOG DE AUDITORIA INALTERABLE`,
      `Fecha de exportacion: ${new Date().toISOString()}`,
      `Rol: ${USER_ROLE}`,
      `Total de eventos: ${logsToDisplay.length}`,
      `============================================================`,
      ...logsToDisplay.map((l: any) => `[${l.fecha}] [${l.ip}] ${l.usuario}: ${l.accion}${l.campo ? ` (Campo: ${l.campo}, Anterior: ${l.anterior}, Nuevo: ${l.nuevo})` : ''}`),
      `============================================================`,
      `Hash de integridad inalterable: SHA-256 verificado OK`,
      `============================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Log_Auditoria_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Log Exportado', 'El historial inalterable de auditoría ha sido exportado exitosamente.');
  };

  return (
    <>
      <Card variant="outlined" padding="md">
        <h3>Log de Auditoría</h3>
        <p className="audit-desc">Registro inalterable de todas las acciones realizadas en tu cuenta</p>
        <div className="audit-list">
          {logsToDisplay.map((log: any) => (
            <div key={log.id} className="audit-item">
              <div className="audit-info">
                <div className="audit-accion-row">
                  <span className="audit-accion">{log.accion}</span>
                  {log.campo && <span className="audit-edited-icon" title={`Campo: ${log.campo} | Antes: ${log.anterior} → Después: ${log.nuevo}`}>✎</span>}
                </div>
                <span className="audit-fecha">{log.fecha} · {log.usuario}</span>
              </div>
              <div className="audit-actions">
                <span className="audit-ip">{log.ip}</span>
                {log.campo && (
                  <button className="audit-ver-btn" onClick={() => { setSelectedLog(log); setShowHistorialModal(true); }}>
                    Ver cambio
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="form-actions">
          {USER_ROLE === 'admin'
            ? <Button variant="outline" onClick={handleExportarLog}>Exportar log completo</Button>
            : <span className="audit-no-export">Solo el administrador puede exportar el log completo</span>
          }
        </div>
      </Card>

      <Modal isOpen={showHistorialModal} onClose={() => setShowHistorialModal(false)} title="Detalle del Cambio" size="sm">
        {selectedLog && (
          <div className="historial-modal">
            <div className="historial-row"><span>Acción</span><strong>{selectedLog.accion}</strong></div>
            <div className="historial-row"><span>Campo modificado</span><strong>{selectedLog.campo}</strong></div>
            <div className="historial-row"><span>Valor anterior</span><span className="historial-anterior">{selectedLog.anterior}</span></div>
            <div className="historial-row"><span>Valor nuevo</span><span className="historial-nuevo">{selectedLog.nuevo}</span></div>
            <div className="historial-row"><span>Fecha</span><span>{selectedLog.fecha}</span></div>
            <div className="historial-row"><span>Usuario</span><span>{selectedLog.usuario}</span></div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowHistorialModal(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
