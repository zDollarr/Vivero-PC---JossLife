import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
// @ts-ignore (si te marca error de tipos, ignóralo o instala @types/html2pdf.js)
import html2pdf from 'html2pdf.js';

interface Plant {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants: Plant[];
}

export const ReportModal = ({ isOpen, onClose, plants }: ReportModalProps) => {
  const [currentUser, setCurrentUser] = useState<string>('Cargando...');
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Obtener usuario real de Firebase
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.email) {
      setCurrentUser(user.email);
    } else {
      setCurrentUser('Usuario no autenticado');
    }
  }, [isOpen]);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('report-content');
    
    const opt = {
      margin:       0.5,
      filename:     `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    // Genera el PDF y abre "Guardar como" automáticamente
    html2pdf().set(opt).from(element).save().then(() => {
      setIsGenerating(false);
      // Opcional: Cerrar el modal automáticamente tras guardar
      // onClose(); 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-[95%] h-[90%] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* BARRA DE HERRAMIENTAS SUPERIOR (No sale en el PDF) */}
        <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
          <h2 className="text-white font-bold text-lg">Vista Previa del Reporte</h2>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition font-bold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
            >
              {isGenerating ? 'Generando...' : '📥 Descargar PDF'}
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL REPORTE (Lo que se imprime) */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div id="report-content" className="bg-white w-full max-w-[1100px] mx-auto p-12 min-h-[800px] shadow-sm text-gray-800 relative">
            
            {/* ENCABEZADO */}
            <div className="border-b-2 border-green-700 pb-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl text-green-600">🌿</span>
                <h1 className="text-4xl font-bold text-green-800">JOSS LIFE - Reporte de Inventario</h1>
              </div>
            </div>

            {/* METADATA */}
            <div className="mb-10 space-y-2 text-sm">
              <p><span className="font-bold text-gray-600">Fecha de Emisión:</span> {new Date().toLocaleString()}</p>
              <p><span className="font-bold text-gray-600">Generado por:</span> <span className="text-blue-600">{currentUser}</span></p>
              <p><span className="font-bold text-gray-600">Propósito:</span> Auditoría Física y Valuación</p>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <table className="w-full text-left border-collapse mb-12">
              <thead>
                <tr className="bg-gray-50 border-y-2 border-gray-100">
                  <th className="py-4 font-bold text-xs uppercase tracking-wider text-gray-500">ID</th>
                  <th className="py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Producto</th>
                  <th className="py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Categoría</th>
                  <th className="py-4 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Precio Unit.</th>
                  {/* Se eliminó la columna Existencia (Físico) */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {plants.map((plant) => (
                  <tr key={plant.id}>
                    <td className="py-3 text-gray-400 font-mono">{plant.id.slice(0,6).toUpperCase()}</td>
                    <td className="py-3 font-medium text-gray-800">{plant.name}</td>
                    <td className="py-3 text-gray-600">{plant.category}</td>
                    <td className="py-3 text-right font-medium">${Number(plant.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              {/* TOTALES */}
              <tfoot>
                <tr className="bg-green-50/50">
                  <td colSpan={3} className="py-4 text-right font-bold text-gray-600 uppercase tracking-wider pr-4">Valor Total Estimado:</td>
                  <td className="py-4 text-right font-bold text-green-700 text-lg">
                    ${plants.reduce((acc, curr) => acc + Number(curr.price || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* FIRMAS (Footer) */}
            <div className="mt-24 grid grid-cols-2 gap-20">
              <div className="text-center">
                <div className="border-t border-gray-400 w-3/4 mx-auto pt-2">
                  <p className="text-gray-600 text-sm">Firma del Auditor / Empleado</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-3/4 mx-auto pt-2">
                  <p className="text-gray-600 text-sm">Firma del Supervisor / Owner</p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center text-xs text-gray-400">
              <p>Documento generado automáticamente por el sistema JossLife.</p>
              <p>Prohibida su alteración. Uso exclusivo para control interno.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
