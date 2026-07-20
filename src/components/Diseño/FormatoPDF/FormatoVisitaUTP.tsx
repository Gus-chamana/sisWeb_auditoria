import React from "react";

interface SignatureImageProps {
  src: string;
  alt: string;
  className?: string;
}

function SignatureImage({ src, alt, className }: SignatureImageProps) {
  const [blackSrc, setBlackSrc] = React.useState(src);

  React.useEffect(() => {
    if (!src) return;
    if (!src.startsWith("data:image")) {
      setBlackSrc(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          // Convertir píxeles de color a negro, manteniendo la transparencia
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
              data[i] = 0;     // R
              data[i + 1] = 0;   // G
              data[i + 2] = 0;   // B
            }
          }
          ctx.putImageData(imgData, 0, 0);
          setBlackSrc(canvas.toDataURL());
        } catch (e) {
          setBlackSrc(src);
        }
      }
    };
    img.onerror = () => setBlackSrc(src);
    img.src = src;
  }, [src]);

  return <img src={blackSrc} alt={alt} className={className} />;
}

export interface FormatoVisitaUTPProps {
  fechaVisita?: string;
  horaInicio?: string;
  horaTermino?: string;
  sedeFilial?: string;
  ciclo?: string;
  turno?: string;
  asignatura?: string;
  campoFormativo?: string;
  semanaNo?: string;
  horaPracticaTeoria?: string;
  lugarVisita?: string;

  
  docenteNombre?: string;
  docentePresente?: "SI" | "NO" | "";
  horarioProgramado?: "Cumple" | "No Cumple" | "";
  interaccion?: "SI" | "NO" | "";
  actividad?: string;
  obs1?: string;

  
  materialCargado?: "CUMPLE" | "NO CUMPLE" | "";
  obs2?: string;

  
  asistenciaAmbiente?: "Cumple" | "No cumple" | "";
  asistenciaAmbienteObs?: string;
  asistenciaIntranet?: "Cumple" | "No cumple" | "";
  asistenciaIntranetObs?: string;
  obs3?: string;

  
  silaboCoincide?: "CUMPLE" | "NO CUMPLE" | "";
  temaAnteriorCoincide?: "CUMPLE" | "NO CUMPLE" | "";
  ingresoSilaboVirtual?: "CUMPLE" | "NO CUMPLE" | "";
  obs4?: string;

  
  guiaPractica?: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  logroMedir?: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  rubricaEvaluacion?: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  obs5?: string;

  
  responsableActividad?: string;
  requerimientosSolicitados?: string;
  firmaDocenteUrl?: string;
  firmaResponsableUrl?: string;
  evidenciasFotos?: { id: number; url_foto: string; seccion: string }[];
}

export function FormatoVisitaUTP(props: FormatoVisitaUTPProps) {
  const {
    fechaVisita = "",
    horaInicio = "",
    horaTermino = "",
    sedeFilial = "",
    ciclo = "",
    turno = "",
    asignatura = "",
    campoFormativo = "",
    semanaNo = "",
    horaPracticaTeoria = "",
    lugarVisita = "",
    docenteNombre = "",
    docentePresente = "",
    horarioProgramado = "",
    interaccion = "",
    actividad = "",
    obs1 = "",
    materialCargado = "",
    obs2 = "",
    asistenciaAmbiente = "",
    asistenciaAmbienteObs = "",
    asistenciaIntranet = "",
    asistenciaIntranetObs = "",
    obs3 = "",
    silaboCoincide = "",
    temaAnteriorCoincide = "",
    ingresoSilaboVirtual = "",
    obs4 = "",
    guiaPractica = "",
    logroMedir = "",
    rubricaEvaluacion = "",
    obs5 = "",
    responsableActividad = "",
    requerimientosSolicitados = "",
    firmaDocenteUrl = "",
    firmaResponsableUrl = "",
    evidenciasFotos = [],
  } = props;

  return (
    <>
      <div className="print-sheet w-full max-w-[210mm] bg-white text-black mx-auto font-sans flex flex-col justify-between border border-gray-300 shadow-sm print:border-0 print:shadow-none select-none text-[8px] leading-snug">
      <div>
        {}
        <div className="grid grid-cols-[30%_40%_30%] items-center border-b border-black pb-1 mb-2">
          {}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-[#C8102E] text-white font-bold px-2 py-0.5 text-[16px] font-sans tracking-tighter">
              UTP
            </div>
            <div className="text-[7.5px] font-bold text-gray-800 leading-none">
              <div>Universidad</div>
              <div className="mt-0.5">Tecnológica</div>
              <div className="mt-0.5">del Perú</div>
            </div>
          </div>

          {}
          <div className="text-center flex flex-col items-center">
            <div className="font-bold text-[9.5px] tracking-wide text-black uppercase">
              UNIVERSIDAD TECNOLÓGICA DEL PERÚ
            </div>
            <div className="text-[7.5px] text-gray-700 font-medium mt-0.5">
              Dirección de Aprendizaje Digital y Online / Dirección Académica
            </div>
            <div className="text-[7.5px] text-gray-700 font-medium mt-0.5">
              Facultad de Ingeniería
            </div>
            <div className="text-[7.5px] text-gray-700 font-medium mt-0.5">
              Carrera Profesional de Ingeniería de Software
            </div>
          </div>

          {}
          <div className="w-full" />
        </div>

        {}
        <div className="text-center mb-2">
          <h2 className="text-[10.5px] font-bold underline uppercase tracking-wider text-black">
            VISITA INOPINADA - CLASES PRESENCIALES
          </h2>
        </div>

        {}
        <table className="w-full border-collapse border-[1.2px] border-black text-[8px] mb-2">
          <tbody>
            <tr>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase w-[15%]">FECHA DE VISITA:</td>
              <td className="border border-black py-1 px-1.5 w-[18%]">{fechaVisita}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase w-[18%]">HORA DE INICIO VISITA:</td>
              <td className="border border-black py-1 px-1.5 w-[15%]">{horaInicio}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase w-[18%]">HORA DE TÉRMINO DE VISITA:</td>
              <td className="border border-black py-1 px-1.5 w-[16%]">{horaTermino}</td>
            </tr>
            <tr>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">SEDE O FILIAL:</td>
              <td className="border border-black py-1 px-1.5">{sedeFilial ? sedeFilial.replace(" (Inactivo)", "") : ""}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">CICLO:</td>
              <td className="border border-black py-1 px-1.5">{ciclo ? ciclo.replace(" (Inactivo)", "") : ""}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">TURNO:</td>
              <td className="border border-black py-1 px-1.5">{turno ? turno.replace(" (Inactivo)", "") : ""}</td>
            </tr>
            <tr>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">ASIGNATURA:</td>
              <td colSpan={3} className="border border-black py-1 px-1.5 font-medium">{asignatura ? asignatura.replace(" (Inactivo)", "") : ""}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">CAMPO FORMATIVO:</td>
              <td className="border border-black py-1 px-1.5">{campoFormativo}</td>
            </tr>
            <tr>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">SEMANA Nº:</td>
              <td className="border border-black py-1 px-1.5">{semanaNo}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">HORA PRÁCTICA/<br/>HORA TEORÍA:</td>
              <td className="border border-black py-1 px-1.5">{horaPracticaTeoria}</td>
              <td className="border border-black font-bold py-1 px-1.5 bg-gray-50 uppercase">LUGAR DE LA VISITA:</td>
              <td className="border border-black py-1 px-1.5">{lugarVisita ? lugarVisita.replace(" (Inactivo)", "") : ""}</td>
            </tr>
          </tbody>
        </table>

        {}
        <div className="w-full mb-2">
          <div className="font-bold bg-gray-100 border-[1.2px] border-black border-b-0 px-2 py-0.5 uppercase text-[8px]">
            1. CONTROL DOCENTE (ASISTENCIA, HORARIO, COMPORTAMIENTO)
          </div>
          <table className="w-full border-collapse border-[1.2px] border-black text-[8px]">
            <tbody>
              <tr>
                <td rowSpan={2} className="border border-black py-1.5 px-2 font-bold uppercase w-[12%] text-center bg-white align-middle">
                  DOCENTE:
                </td>
                <td rowSpan={2} className="border border-black py-1.5 px-2 w-[42%] font-medium align-middle">
                  {docenteNombre}
                </td>
                <td colSpan={2} className="border border-black py-1 px-1 text-center font-bold bg-gray-50 uppercase text-[7.5px] w-[15%]">
                  PRESENTE
                </td>
                <td colSpan={2} className="border border-black py-1 px-1 text-center font-bold bg-gray-50 uppercase text-[7.5px] w-[16%]">
                  HORARIO PROGRAMADO
                </td>
                <td colSpan={2} className="border border-black py-1 px-1 text-center font-bold bg-gray-50 uppercase text-[7.5px] w-[15%]">
                  INTERACCIÓN
                </td>
              </tr>
              <tr>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[7.5%]">SI</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[7.5%]">NO</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[8%]">Cumple</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[8%]">No Cumple</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[7.5%]">SI</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[7.5%]">NO</td>
              </tr>
              <tr>
                <td className="border border-black py-1.5 px-2 font-bold uppercase text-center bg-white align-middle">
                  ACTIVIDAD:
                </td>
                <td className="border border-black py-1.5 px-2 text-left align-middle font-sans">
                  {actividad || "Desarrollo de clase teórica / práctica programada."}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {docentePresente === "SI" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {docentePresente === "NO" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {horarioProgramado === "Cumple" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {horarioProgramado === "No Cumple" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {interaccion === "SI" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {interaccion === "NO" ? "X" : ""}
                </td>
              </tr>
              <tr>
                <td colSpan={8} className="border border-black py-1.5 px-2 text-left bg-white">
                  <span className="font-bold uppercase text-[7.5px]">OBSERVACIONES:</span>
                  <div className="mt-0.5 font-sans text-gray-700 min-h-[16px]">{obs1 || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {}
        <div className="w-full mb-2">
          <div className="font-bold bg-gray-100 border-[1.2px] border-black border-b-0 px-2 py-0.5 uppercase text-[8px]">
            2. REGISTRO DE MATERIAL A UTILIZAR CARGADO EN AULA VIRTUAL ANTES DEL INICIO DE CLASES
          </div>
          <table className="w-full border-collapse border-[1.2px] border-black text-[8px]">
            <tbody>
              <tr>
                <td className="border border-black py-1.5 px-2 text-center font-bold uppercase w-1/2">
                  CUMPLE ( {materialCargado === "CUMPLE" ? "X" : " "} )
                </td>
                <td className="border border-black py-1.5 px-2 text-center font-bold uppercase w-1/2">
                  NO CUMPLE ( {materialCargado === "NO CUMPLE" ? "X" : " "} )
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black py-1.5 px-2 text-left bg-white">
                  <span className="font-bold uppercase text-[7.5px]">OBSERVACIONES:</span>
                  <div className="mt-0.5 font-sans text-gray-700 min-h-[16px]">{obs2 || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {}
        <div className="w-full mb-2">
          <div className="font-bold bg-gray-100 border-[1.2px] border-black border-b-0 px-2 py-0.5 uppercase text-[8px]">
            3. CONTROL DE REGISTRO DE ASISTENCIA DE ESTUDIANTES
          </div>
          <table className="w-full border-collapse border-[1.2px] border-black text-[8px]">
            <tbody>
              <tr>
                <td rowSpan={2} className="border border-black py-1.5 px-2 font-bold uppercase w-[15%] text-center bg-white align-middle">
                  CONTROL
                </td>
                <td colSpan={3} className="border border-black py-1 px-1 text-center font-bold bg-gray-50 uppercase text-[7.5px] w-[42.5%]">
                  CONTROL EN AMBIENTE
                </td>
                <td colSpan={3} className="border border-black py-1 px-1 text-center font-bold bg-gray-50 uppercase text-[7.5px] w-[42.5%]">
                  CONTROL EN INTRANET
                </td>
              </tr>
              <tr>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[10%]">Cumple</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[10%]">No cumple</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[22.5%]">Observaciones</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[10%]">Cumple</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[10%]">No cumple</td>
                <td className="border border-black py-1 px-1 text-center font-semibold text-[7px] w-[22.5%]">Observaciones</td>
              </tr>
              <tr>
                <td className="border border-black py-1.5 px-2 font-bold uppercase text-center bg-white align-middle">
                  ASISTENCIA
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {asistenciaAmbiente === "Cumple" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {asistenciaAmbiente === "No cumple" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-left font-sans text-[7.5px] align-middle">
                  {asistenciaAmbienteObs}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {asistenciaIntranet === "Cumple" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-center font-bold align-middle">
                  {asistenciaIntranet === "No cumple" ? "X" : ""}
                </td>
                <td className="border border-black py-1.5 px-1 text-left font-sans text-[7.5px] align-middle">
                  {asistenciaIntranetObs}
                </td>
              </tr>
              <tr>
                <td colSpan={7} className="border border-black py-1.5 px-2 text-left bg-white">
                  <span className="font-bold uppercase text-[7.5px]">OBSERVACIONES:</span>
                  <div className="mt-0.5 font-sans text-gray-700 min-h-[16px]">{obs3 || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {}
        <div className="w-full mb-2">
          <div className="font-bold bg-gray-100 border-[1.2px] border-black border-b-0 px-2 py-0.5 uppercase text-[8px]">
            4. CONTROL DEL AVANCE SILÁBICO
          </div>
          <table className="w-full border-collapse border-[1.2px] border-black text-[8px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black py-1.5 px-2 text-left font-bold uppercase w-[70%] text-[7.5px]">CRITERIO EVALUADO</th>
                <th className="border border-black py-1.5 px-2 text-center font-bold uppercase w-[15%] text-[7.5px]">CUMPLE</th>
                <th className="border border-black py-1.5 px-2 text-center font-bold uppercase w-[15%] text-[7.5px]">NO CUMPLE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black py-1.5 px-2 text-left">El tema del silabo coincide con la clase desarrollada en la fecha de la visita.</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{silaboCoincide === "CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{silaboCoincide === "NO CUMPLE" ? "X" : ""}</td>
              </tr>
              <tr>
                <td className="border border-black py-1.5 px-2 text-left">El tema desarrollado en la fecha anterior a la visita coincidió con el sílabo.</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{temaAnteriorCoincide === "CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{temaAnteriorCoincide === "NO CUMPLE" ? "X" : ""}</td>
              </tr>
              <tr>
                <td className="border border-black py-1.5 px-2 text-left">Ingreso del avance silábico en el aula virtual.</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{ingresoSilaboVirtual === "CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{ingresoSilaboVirtual === "NO CUMPLE" ? "X" : ""}</td>
              </tr>
              <tr>
                <td colSpan={3} className="border border-black py-1.5 px-2 text-left bg-white">
                  <span className="font-bold uppercase text-[7.5px]">OBSERVACIONES:</span>
                  <div className="mt-0.5 font-sans text-gray-700 min-h-[16px]">{obs4 || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {}
        <div className="w-full mb-2">
          <div className="font-bold bg-gray-100 border-[1.2px] border-black border-b-0 px-2 py-0.5 uppercase text-[8px]">
            5. CUMPLE CON EL DESARROLLO DE LA GUÍA DE PRÁCTICA
          </div>
          <table className="w-full border-collapse border-[1.2px] border-black text-[8px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black py-1.5 px-2 text-left font-bold uppercase w-[55%] text-[7.5px]">CRITERIO EVALUADO</th>
                <th className="border border-black py-1.5 px-2 text-center font-bold uppercase w-[15%] text-[7.5px]">CUMPLE</th>
                <th className="border border-black py-1.5 px-2 text-center font-bold uppercase w-[15%] text-[7.5px]">NO CUMPLE</th>
                <th className="border border-black py-1.5 px-2 text-center font-bold uppercase w-[15%] text-[7.5px]">NO APLICA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black py-1.5 px-2 text-left">Cumple con el tema programado en la guía de práctica para el desarrollo de la clase práctica.</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{guiaPractica === "CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{guiaPractica === "NO CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{guiaPractica === "NO APLICA" ? "X" : ""}</td>
              </tr>
              <tr>
                <td className="border border-black py-1.5 px-2 text-left">Se evidencia el logro a medir en la práctica desarrollada.</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{logroMedir === "CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{logroMedir === "NO CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{logroMedir === "NO APLICA" ? "X" : ""}</td>
              </tr>
              <tr>
                <td className="border border-black py-1.5 px-2 text-left">Cuenta con una rúbrica de evaluación.</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{rubricaEvaluacion === "CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{rubricaEvaluacion === "NO CUMPLE" ? "X" : ""}</td>
                <td className="border border-black py-1.5 px-1 text-center font-bold">{rubricaEvaluacion === "NO APLICA" ? "X" : ""}</td>
              </tr>
              <tr>
                <td colSpan={4} className="border border-black py-1.5 px-2 text-left bg-white">
                  <span className="font-bold uppercase text-[7.5px]">OBSERVACIONES:</span>
                  <div className="mt-0.5 font-sans text-gray-700 min-h-[16px]">{obs5 || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {}
        <table className="w-full border-collapse border-[1.2px] border-black text-[8px]">
          <tbody>
            <tr>
              <td className="border border-black py-1.5 px-2 font-bold uppercase w-[30%] bg-gray-50">
                RESPONSABLE DE REALIZAR LA ACTIVIDAD:
              </td>
              <td className="border border-black py-1.5 px-2 w-[70%] font-semibold uppercase">
                {responsableActividad}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="border border-black py-2 px-2 text-left bg-white">
                <span className="font-bold uppercase text-[7.5px]">REQUERIMIENTOS SOLICITADOS EN LA VISITA INOPINADA</span>
                <div className="mt-1 font-sans text-gray-700 min-h-[22px]">{requerimientosSolicitados || ""}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {}
      <div className="mt-2 border-t border-gray-300 pt-2 no-break">
        <div className="grid grid-cols-2 gap-12 text-center">
          <div className="flex flex-col items-center relative min-h-[40px] justify-end">
            {firmaDocenteUrl && (
              <SignatureImage
                src={firmaDocenteUrl}
                alt="Firma del Docente"
                className="h-[30px] w-auto object-contain absolute bottom-[18px] pointer-events-none"
              />
            )}
            <div className="w-[160px] border-b border-black mb-1" />
            <span className="text-[7.5px] uppercase font-bold text-gray-900">FIRMA DEL DOCENTE</span>
          </div>
          <div className="flex flex-col items-center relative min-h-[40px] justify-end">
            {firmaResponsableUrl && (
              <SignatureImage
                src={firmaResponsableUrl}
                alt="Firma del Responsable"
                className="h-[30px] w-auto object-contain absolute bottom-[18px] pointer-events-none"
              />
            )}
            <div className="w-[160px] border-b border-black mb-1" />
            <span className="text-[7.5px] uppercase font-bold text-gray-900">FIRMA DEL RESPONSABLE DE LA VISITA</span>
          </div>
        </div>
      </div>
    </div>

    {}
    {evidenciasFotos && evidenciasFotos.length > 0 && (
      <div className="print-sheet w-full max-w-[210mm] bg-white text-black mx-auto font-sans flex flex-col justify-start border border-gray-300 shadow-sm print:border-0 print:shadow-none select-none text-[8px] leading-snug mt-4">
        <div className="text-center mb-4">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 border-b-2 border-black pb-2 inline-block">
            Anexo: Evidencias Fotográficas de la Visita
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mt-2">
          {evidenciasFotos.map((foto, idx) => (
            <div key={foto.id || idx} className="border border-gray-300 rounded p-3 flex flex-col items-center bg-white shadow-sm break-inside-avoid">
              <div className="w-full h-[220px] flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-200 rounded">
                <img
                  src={foto.url_foto}
                  alt={`Evidencia ${idx + 1}`}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>
              <div className="mt-2 text-center">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Evidencia {idx + 1}</span>
                <p className="text-[9px] font-semibold text-gray-800 mt-0.5">{foto.seccion || "General"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);
}
