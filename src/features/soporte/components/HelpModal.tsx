import React, { useState, useCallback } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import type { Guia, FasePedagogica } from './HelpData';

interface HelpModalProps {
  selectedGuia: Guia | null;
  onClose: () => void;
  /** Se dispara solo cuando el usuario finaliza un recorrido interactivo completo. */
  onComplete?: () => void;
}

type FaseLabel = Record<FasePedagogica, { label: string; color: 'default' | 'success' | 'info' | 'warning' | 'danger' }>;

const FASES: FaseLabel = {
  contexto: { label: 'Contexto', color: 'info' },
  demostracion: { label: 'Demostración', color: 'default' },
  practica: { label: 'Práctica', color: 'success' },
  comprobacion: { label: 'Comprobación', color: 'warning' },
};

const FASE_COLORS: Record<FasePedagogica, string> = {
  contexto: 'var(--color-primary)',
  demostracion: 'var(--color-accent)',
  practica: 'var(--color-success)',
  comprobacion: 'var(--color-warning)',
};

const CATEGORIA_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  IVA: 'info',
  Renta: 'success',
  Sanciones: 'danger',
  Acceso: 'default',
  Perfil: 'default',
  Ingresos: 'default',
  Gastos: 'default',
  Fiscal: 'default',
  Reportes: 'default',
  Ayuda: 'default',
  Seguridad: 'default',
  General: 'default',
};

interface NodoMarkdown {
  tipo: 'texto' | 'titulo1' | 'titulo2' | 'cita' | 'tabla' | 'codigo' | 'linea';
  contenido?: string;
  filas?: string[][];
}

function parsearMarkdown(contenido: string): NodoMarkdown[] {
  const lineas = contenido.split('\n');
  const nodos: NodoMarkdown[] = [];
  let i = 0;

  while (i < lineas.length) {
    const linea = lineas[i];

    // Título 1
    if (linea.startsWith('# ')) {
      nodos.push({ tipo: 'titulo1', contenido: linea.slice(2) });
      i++;
      continue;
    }
    // Título 2
    if (linea.startsWith('## ')) {
      nodos.push({ tipo: 'titulo2', contenido: linea.slice(3) });
      i++;
      continue;
    }
    // Cita
    if (linea.startsWith('> ')) {
      nodos.push({ tipo: 'cita', contenido: linea.slice(2) });
      i++;
      continue;
    }
    // Bloque de código
    if (linea.startsWith('```')) {
      const codigo: string[] = [];
      i++;
      while (i < lineas.length && !lineas[i].startsWith('```')) {
        codigo.push(lineas[i]);
        i++;
      }
      i++; // saltar ```
      nodos.push({ tipo: 'codigo', contenido: codigo.join('\n') });
      continue;
    }
    // Tabla (líneas con |)
    if (linea.includes('|') && !linea.startsWith('| ') === false) {
      const filas: string[][] = [];
      while (i < lineas.length && lineas[i].includes('|')) {
        const celdas = lineas[i]
          .split('|')
          .map((c) => c.trim())
          .filter((c, idx) => {
            // eliminar celdas vacías de los bordes
            if (idx === 0 || idx === lineas[i].split('|').length - 1) return c.length > 0;
            return true;
          });
        filas.push(celdas);
        i++;
      }
      nodos.push({ tipo: 'tabla', filas });
      continue;
    }
    // Línea vacía
    if (!linea.trim()) {
      nodos.push({ tipo: 'linea', contenido: '' });
      i++;
      continue;
    }
    // Texto normal (acumular párrafo)
    const parrafo: string[] = [];
    while (i < lineas.length && linea.trim() && !linea.startsWith('#') && !linea.startsWith('>') && !linea.startsWith('```') && !linea.includes('|')) {
      parrafo.push(linea);
      i++;
      if (i < lineas.length) {
        const siguiente = lineas[i];
        if (!siguiente.trim() || siguiente.startsWith('#') || siguiente.startsWith('>') || siguiente.startsWith('```') || siguiente.includes('|')) break;
      }
    }
    nodos.push({ tipo: 'texto', contenido: parrafo.join(' ') });
  }

  return nodos;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  selectedGuia,
  onClose,
  onComplete,
}) => {
  const [vista, setVista] = useState<'pasos' | 'comprobacion' | 'finalizada'>('pasos');
  const [pasoActual, setPasoActual] = useState(0);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [resultadoComprobacion, setResultadoComprobacion] = useState<'correcto' | 'incorrecto' | null>(null);

  // Resetear estado cuando se abre una guía distinta
  React.useEffect(() => {
    setVista('pasos');
    setPasoActual(0);
    setPreguntaActual(0);
    setRespuestaSeleccionada(null);
    setResultadoComprobacion(null);
  }, [selectedGuia?.id]);

  const esRecorrido = selectedGuia?.pasos && selectedGuia.pasos.length > 0;
  const paso = esRecorrido ? selectedGuia!.pasos![pasoActual] : null;
  const totalPasos = selectedGuia?.pasos?.length ?? 0;
  const esUltimoPaso = pasoActual === totalPasos - 1;
  const preguntas = selectedGuia?.preguntasComprobacion ?? [];
  const pregunta = preguntas[preguntaActual];
  const esUltimaPregunta = preguntaActual === preguntas.length - 1;

  const tieneComprobacion = preguntas.length > 0;

  const varianteCategoria = CATEGORIA_VARIANT[selectedGuia?.categoria ?? ''] ?? 'default';

  const irASiguientePaso = useCallback(() => {
    if (!esRecorrido) return;
    if (esUltimoPaso) {
      if (tieneComprobacion) {
        setVista('comprobacion');
        setPreguntaActual(0);
        setRespuestaSeleccionada(null);
        setResultadoComprobacion(null);
      } else {
        setVista('finalizada');
      }
    } else {
      setPasoActual(pasoActual + 1);
    }
  }, [esRecorrido, esUltimoPaso, pasoActual, totalPasos, tieneComprobacion]);

  const irAPasoAnterior = useCallback(() => {
    if (!esRecorrido || pasoActual === 0) return;
    setPasoActual(pasoActual - 1);
  }, [esRecorrido, pasoActual]);

  const seleccionarRespuesta = useCallback((index: number) => {
    if (!pregunta) return;
    setRespuestaSeleccionada(index);
    setResultadoComprobacion(index === pregunta.respuestaCorrecta ? 'correcto' : 'incorrecto');
  }, [pregunta]);

  const siguientePregunta = useCallback(() => {
    if (esUltimaPregunta) {
      setVista('finalizada');
    } else {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
      setResultadoComprobacion(null);
    }
  }, [esUltimaPregunta, preguntaActual]);

  const finalizar = useCallback(() => {
    onComplete?.();
    onClose();
  }, [onComplete, onClose]);

  return (
    <Modal isOpen={!!selectedGuia} onClose={onClose} title={selectedGuia?.titulo || ''} size="lg">
      {selectedGuia && (
        <div className="guia-modal">
          <div className="guia-header">
            <span className="guia-icono-large">{selectedGuia.icono}</span>
            <Badge variant={varianteCategoria}>{selectedGuia.categoria}</Badge>
            {vista === 'pasos' && esRecorrido && (
              <span className="guia-progreso">
                Paso {pasoActual + 1} de {totalPasos}
              </span>
            )}
          </div>

          {selectedGuia.esDemo && vista === 'pasos' && (
            <div className="guia-aviso-demo">
              <AlertTriangle size={16} />
              <span>Función en demostración: esta operación aún no está habilitada en la versión desplegada.</span>
            </div>
          )}

          <div className="guia-contenido">
            {/* ========== VISTA: PASOS ========== */}
            {vista === 'pasos' && paso && esRecorrido ? (
              <div className="guia-paso">
                <div className="guia-fase">
                  <span className={`guia-fase-badge fase-${paso.fase}`} style={{ color: FASE_COLORS[paso.fase] }}>
                    {FASES[paso.fase].label}
                  </span>
                  <h3 className="guia-paso-titulo">{paso.titulo}</h3>
                </div>

                <p className="guia-indicacion">{paso.indicacion}</p>

                {paso.explicacion && (
                  <div className="guia-explicacion-card">
                    <HelpCircle size={16} className="guia-icono-ayuda" />
                    <p className="guia-explicacion">{paso.explicacion}</p>
                  </div>
                )}

                <div className="guia-accion">
                  <strong>Acción:</strong> {paso.accion}
                </div>

                <div className="guia-resultado">
                  <strong>Resultado esperado:</strong> {paso.resultadoEsperado}
                </div>

                {paso.ejemplo && (
                  <div className="guia-ejemplo">
                    <p><strong>Ejemplo:</strong></p>
                    <pre>{paso.ejemplo}</pre>
                  </div>
                )}
              </div>
            ) : null}

            {/* ========== VISTA: COMPROBACIÓN ========== */}
            {vista === 'comprobacion' && pregunta ? (
              <div className="guia-comprobacion">
                <div className="guia-progreso-pregunta">
                  Pregunta {preguntaActual + 1} de {preguntas.length}
                </div>
                <h3 className="guia-pregunta-titulo">{pregunta.pregunta}</h3>
                <div className="guia-opciones">
                  {pregunta.opciones.map((opcion, idx) => {
                    const seleccionada = respuestaSeleccionada === idx;
                    const esCorrecta = idx === pregunta.respuestaCorrecta;
                    let estado: 'ninguno' | 'correcta' | 'incorrecta' = 'ninguno';
                    if (resultadoComprobacion) {
                      if (esCorrecta) estado = 'correcta';
                      else if (seleccionada && !esCorrecta) estado = 'incorrecta';
                    }
                    return (
                      <button
                        key={idx}
                        className={`guia-opcion ${estado} ${seleccionada ? 'seleccionada' : ''}`}
                        onClick={() => seleccionarRespuesta(idx)}
                        disabled={resultadoComprobacion !== null}
                      >
                        {opcion}
                      </button>
                    );
                  })}
                </div>
                {resultadoComprobacion && (
                  <div className={`guia-feedback ${resultadoComprobacion}`}>
                    {resultadoComprobacion === 'correcto' ? (
                      <>
                        <CheckCircle2 size={18} />
                        ¡Correcto!
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        Incorrecto
                      </>
                    )}
                    <span>{pregunta.explicacion}</span>
                  </div>
                )}
                {!resultadoComprobacion && (
                  <p className="guia-feedback-instruccion">
                    Selecciona una respuesta para continuar.
                  </p>
                )}
              </div>
            ) : null}

            {/* ========== VISTA: ESTÁTICA (Markdown) ========== */}
            {(!esRecorrido || vista !== 'pasos') && vista === 'pasos' && selectedGuia.contenido ? (
              <div className="guia-body">
                {parsearMarkdown(selectedGuia.contenido).map((nodo, i) => {
                  if (nodo.tipo === 'titulo1') return <h2 key={i}>{nodo.contenido}</h2>;
                  if (nodo.tipo === 'titulo2') return <h3 key={i}>{nodo.contenido}</h3>;
                  if (nodo.tipo === 'cita') return <blockquote key={i}>{nodo.contenido}</blockquote>;
                  if (nodo.tipo === 'tabla' && nodo.filas) {
                    return (
                      <table key={i} className="guia-tabla">
                        <thead>
                          {nodo.filas[0] && (
                            <tr>
                              {nodo.filas[0].map((c, ci) => <th key={ci}>{c}</th>)}
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {nodo.filas.slice(1).map((fila, fi) => (
                            <tr key={fi}>
                              {fila.map((c, ci) => <td key={ci}>{c}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  }
                  if (nodo.tipo === 'codigo') return <pre key={i} className="guia-codigo">{nodo.contenido}</pre>;
                  if (nodo.tipo === 'linea') return <br key={i} />;
                  return <p key={i}>{nodo.contenido}</p>;
                })}
              </div>
            ) : null}

            {/* ========== VISTA: FINALIZADA ========== */}
            {vista === 'finalizada' ? (
              <div className="guia-finalizada">
                <CheckCircle2 size={48} className="guia-icono-final" />
                <h2>¡Guía completada!</h2>
                <p>Has terminado el recorrido de "{selectedGuia.titulo}".</p>
              </div>
            ) : null}
          </div>

          <div className="guia-footer">
            {vista === 'finalizada' ? (
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            ) : vista === 'comprobacion' ? (
              <>
                {resultadoComprobacion === null ? (
                  <Button variant="outline" onClick={onClose} disabled>
                    Salir
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={onClose}>
                      Salir
                    </Button>
                    {!esUltimaPregunta ? (
                      <Button variant="primary" onClick={siguientePregunta} disabled={resultadoComprobacion === null}>
                        Siguiente pregunta <ArrowRight size={16} />
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={finalizar} disabled={resultadoComprobacion === null}>
                        Finalizar guía <CheckCircle2 size={16} />
                      </Button>
                    )}
                  </>
                )}
              </>
            ) : esRecorrido ? (
              <>
                <Button variant="outline" onClick={irAPasoAnterior} disabled={pasoActual === 0}>
                  <ChevronLeft size={16} /> Anterior
                </Button>
                {esUltimoPaso ? (
                  tieneComprobacion ? (
                    <Button variant="primary" onClick={irASiguientePaso}>
                      Ir a comprobación <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={finalizar}>
                      Finalizar guía <CheckCircle2 size={16} />
                    </Button>
                  )
                ) : (
                  <Button variant="primary" onClick={irASiguientePaso}>
                    Siguiente <ChevronRight size={16} />
                  </Button>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
