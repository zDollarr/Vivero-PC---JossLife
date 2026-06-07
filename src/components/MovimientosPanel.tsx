import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebaseConfig'

interface Movimiento {
  id: string
  tipo: 'agregar' | 'editar' | 'eliminar' | 'orden' | string
  usuario: string
  descripcion: string
  fecha: Timestamp
}

const getTipoStyles = (tipo: string) => {
  switch (tipo) {
    case 'agregar':
      return {
        badge: 'bg-green-100 text-green-700',
        dot: 'bg-green-500',
        label: 'Alta',
      }
    case 'editar':
      return {
        badge: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500',
        label: 'Edición',
      }
    case 'eliminar':
      return {
        badge: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
        label: 'Eliminación',
      }
    case 'orden':
      return {
        badge: 'bg-purple-100 text-purple-700',
        dot: 'bg-purple-500',
        label: 'Orden',
      }
    default:
      return {
        badge: 'bg-gray-100 text-gray-700',
        dot: 'bg-gray-400',
        label: 'Movimiento',
      }
  }
}

export const MovimientosPanel = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'movimientos'),
      where('fecha', '>=', Timestamp.fromDate(inicioHoy)),
      orderBy('fecha', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Movimiento[]

        setMovimientos(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error al cargar movimientos:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
        <p className="text-gray-400 font-medium">Cargando movimientos...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800">Movimientos de hoy</h3>
        <p className="text-sm text-gray-500 mt-1">
          Registro de acciones realizadas en el sistema
        </p>
      </div>

      {movimientos.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-bold text-gray-700">Sin movimientos hoy</p>
          <p className="text-sm text-gray-500 mt-2">
            Cuando alguien agregue, edite o elimine algo, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {movimientos.map((mov) => {
            const tipoUI = getTipoStyles(mov.tipo)

            return (
              <div
                key={mov.id}
                className="px-8 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className={`w-3 h-3 rounded-full mt-2 ${tipoUI.dot}`}></span>

                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${tipoUI.badge}`}
                      >
                        {tipoUI.label}
                      </span>
                      <p className="text-sm text-gray-500">
                        por{' '}
                        <span className="font-bold text-gray-700">
                          {mov.usuario}
                        </span>
                      </p>
                    </div>

                    <p className="text-gray-800 font-medium mt-2">
                      {mov.descripcion}
                    </p>
                  </div>
                </div>

                <div className="text-right min-w-[90px]">
                  <p className="text-xs text-gray-400 font-bold uppercase">
                    Hora
                  </p>
                  <p className="text-sm text-gray-700 font-semibold mt-1">
                    {mov.fecha?.toDate
                      ? mov.fecha.toDate().toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--:--'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}