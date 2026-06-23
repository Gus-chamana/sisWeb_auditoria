import React, { useRef, useState, useEffect } from "react";
import { Info, PenTool, RotateCcw, CheckCircle, Award, User, Bookmark } from "lucide-react";

interface Paso7FormData {
  docenteNombre: string;
  asignatura: string;
  aula: string;
  sedeFilial: string;
  firmaDocenteUrl: string; // Guardará la representación base64 de la firma
}

interface Paso7FirmasProps {
  formData: Paso7FormData;
  updateFormData: (fields: Partial<Paso7FormData>) => void;
}

export function Paso7Firmas({ formData, updateFormData }: Paso7FirmasProps) {
  const { docenteNombre, asignatura, aula, sedeFilial, firmaDocenteUrl } = formData;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Inicializar o restaurar canvas si ya existe una firma guardada
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Si ya hay una firma guardada en el estado, la dibuja
        if (firmaDocenteUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = firmaDocenteUrl;
        }
      }
    }
  }, [firmaDocenteUrl]);

  // Funciones para dibujar en el Canvas (Mouse y Touch)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Guardar firma automáticamente en base64 en el formData
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      updateFormData({ firmaDocenteUrl: dataUrl });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateFormData({ firmaDocenteUrl: "" });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Informativo */}
      <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
        <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
        <div className="text-13 leading-relaxed">
          <span className="font-bold">Cierre de Auditoría:</span> Revisa el resumen general con el docente para confirmar su conformidad y solicita su firma digital directamente en la pantalla antes de enviar el reporte final.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Resumen Visual (2 columnas de ancho) */}
        <div className="glass-card p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-15 font-bold text-sivac-light flex items-center gap-2 border-b border-white/5 pb-3">
              <Award size={18} className="text-sivac-blue-light" />
              Resumen de Visita
            </h3>
            
            <div className="space-y-3 text-13">
              <div className="flex items-start gap-2.5">
                <User size={16} className="text-sivac-dim shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sivac-muted text-11">Docente</span>
                  <span className="font-semibold text-sivac-light">{docenteNombre || "Docente Asignado"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Bookmark size={16} className="text-sivac-dim shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sivac-muted text-11">Asignatura</span>
                  <span className="font-semibold text-sivac-light">{asignatura || "Asignatura del Curso"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-sivac-dim shrink-0 font-bold text-11 mt-0.5">AULA</span>
                <div>
                  <span className="block text-sivac-muted text-11">Ubicación</span>
                  <span className="font-semibold text-sivac-light">{aula || "Aula Virtual / Laboratorio"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-sivac-dim shrink-0 font-bold text-11 mt-0.5">SEDE</span>
                <div>
                  <span className="block text-sivac-muted text-11">Filial</span>
                  <span className="font-semibold text-sivac-light">{sedeFilial || "Sede Académica"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-sivac-green/10 border border-sivac-green/20 rounded-lg text-sivac-green-light flex gap-2 items-center text-12">
            <CheckCircle size={16} className="shrink-0" />
            <span>Todos los campos del reporte listos para guardar.</span>
          </div>
        </div>

        {/* Firma Digital Interactiva (3 columnas de ancho) */}
        <div className="glass-card p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-3 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-15 font-bold text-sivac-light flex items-center gap-2">
              <PenTool size={18} className="text-sivac-blue-light" />
              Firma de Conformidad (Docente)
            </h3>
            
            <button
              type="button"
              onClick={clearCanvas}
              className="text-11 text-sivac-muted hover:text-sivac-red-light transition-colors flex items-center gap-1 hover:bg-white/5 px-2 py-1 rounded"
            >
              <RotateCcw size={12} />
              <span>Limpiar Canvas</span>
            </button>
          </div>

          {/* Lienzo para firmar con el mouse/dedo */}
          <div className="relative bg-sivac-bg-input-admin border border-white/10 rounded-lg overflow-hidden h-[180px] flex items-center justify-center cursor-crosshair group shadow-inner">
            <canvas
              ref={canvasRef}
              width={400}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full"
            />
            {!firmaDocenteUrl && !isDrawing && (
              <span className="text-12 text-sivac-dim pointer-events-none select-none">
                Usa el cursor o pantalla táctil para firmar aquí
              </span>
            )}
          </div>

          <p className="text-11 text-sivac-muted leading-relaxed">
            * Al estampar la firma digital en este recuadro se certifica que la información descrita en las secciones superiores corresponde plenamente a lo observado en la sesión evaluada.
          </p>
        </div>

      </div>
    </div>
  );
}
