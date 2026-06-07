import { useState, useEffect, useRef } from 'react'
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '../firebaseConfig'

interface Product {
  id?: string
  name: string
  price: number | string
  category: string
  stock?: number
  nameKey?: string
}

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  productToEdit?: Product | null
  onSuccess: () => void
}

const CATEGORIES = [
  'Planta',
  'Maceta',
  'Fertilizante',
  'Herramienta',
  'Semillas',
  'Decoración',
  'Otros',
]

const makeNameKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

export const AddProductModal = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}: AddProductModalProps) => {
  const [newPlant, setNewPlant] = useState({
    name: '',
    price: '',
    category: '',
    stock: '1',
  })
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    if (productToEdit) {
      setNewPlant({
        name: productToEdit.name || '',
        price: productToEdit.price ? productToEdit.price.toString() : '',
        category: productToEdit.category || '',
        stock: productToEdit.stock ? productToEdit.stock.toString() : '1',
      })
    } else {
      setNewPlant({ name: '', price: '', category: '', stock: '1' })
    }

    setShowDiscardConfirm(false)
    setShowSuccess(false)
    setLoading(false)
  }, [isOpen, productToEdit])

  const handlePriceChange = (text: string) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setNewPlant((prev) => ({ ...prev, price: text }))
    }
  }

  const handleStockChange = (text: string) => {
    if (/^\d*$/.test(text)) {
      setNewPlant((prev) => ({ ...prev, stock: text }))
    }
  }

  const handleCloseAttempt = () => {
    if (showSuccess || loading) return

    let hasChanges = false
    if (productToEdit) {
      hasChanges =
        newPlant.name !== productToEdit.name ||
        newPlant.price !== productToEdit.price.toString() ||
        newPlant.category !== (productToEdit.category || '') ||
        newPlant.stock !== (productToEdit.stock?.toString() || '1')
    } else {
      hasChanges =
        newPlant.name !== '' || newPlant.price !== '' || newPlant.category !== ''
    }

    if (hasChanges) setShowDiscardConfirm(true)
    else onClose()
  }

  const registrarMovimiento = async (
    tipo: 'agregar' | 'editar',
    descripcion: string
  ) => {
    const currentUser = auth.currentUser

    const nombreUsuario =
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Usuario'

    try {
      await addDoc(collection(db, 'movimientos'), {
        tipo,
        usuario: nombreUsuario,
        descripcion,
        fecha: serverTimestamp(),
      })
    } catch (error) {
      console.warn('No se pudo registrar el movimiento:', error)
    }
  }

  const handleSave = async () => {
    if (!newPlant.name.trim() || !newPlant.price.toString().trim()) return

    setLoading(true)

    const namePretty = newPlant.name.trim()
    const nameKey = makeNameKey(namePretty)

    const categoryFinal = (newPlant.category || 'Otros').trim() || 'Otros'
    const priceNumber = parseFloat(newPlant.price.toString())
    const stockNumber = parseInt(newPlant.stock.toString(), 10) || 0

    const productData: any = {
      name: namePretty,
      nameKey,
      price: priceNumber,
      category: categoryFinal,
      stock: stockNumber,
    }

    const savePromise = async () => {
      if (productToEdit?.id) {
        await updateDoc(doc(db, 'products', productToEdit.id), {
          ...productData,
          updatedAt: new Date(),
        })

        await registrarMovimiento(
          'editar',
          `Editó el producto "${namePretty}" (${categoryFinal})`
        )
        return
      }

      const productsRef = collection(db, 'products')

      const q1 = query(
        productsRef,
        where('nameKey', '==', nameKey),
        where('category', '==', categoryFinal),
        where('price', '==', priceNumber)
      )
      const snap1 = await getDocs(q1)

      if (!snap1.empty) {
        const existingDoc = snap1.docs[0]
        await updateDoc(doc(db, 'products', existingDoc.id), {
          stock: increment(stockNumber),
          updatedAt: new Date(),
        })

        await registrarMovimiento(
          'agregar',
          `Agregó ${stockNumber} unidad(es) al producto existente "${namePretty}"`
        )
        return
      }

      const q2 = query(
        productsRef,
        where('name', '==', namePretty),
        where('category', '==', categoryFinal),
        where('price', '==', priceNumber)
      )
      const snap2 = await getDocs(q2)

      if (!snap2.empty) {
        const existingDoc = snap2.docs[0]
        await updateDoc(doc(db, 'products', existingDoc.id), {
          stock: increment(stockNumber),
          nameKey,
          updatedAt: new Date(),
        })

        await registrarMovimiento(
          'agregar',
          `Agregó ${stockNumber} unidad(es) al producto existente "${namePretty}"`
        )
        return
      }

      await addDoc(productsRef, {
        ...productData,
        createdAt: new Date(),
        description: '',
      })

      await registrarMovimiento(
        'agregar',
        `Creó el producto "${namePretty}" con ${stockNumber} unidad(es)`
      )
    }

    savePromise().catch((err) =>
      console.warn('Guardado en background (posible offline):', err)
    )

    setTimeout(() => {
      if (!isMounted.current) return

      setLoading(false)
      setShowSuccess(true)
      onSuccess()

      setTimeout(() => {
        if (!isMounted.current) return
        setShowSuccess(false)
        onClose()
      }, 800)
    }, 800)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseAttempt}
        ></div>

        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative z-[60]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button
              onClick={handleCloseAttempt}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                disabled={loading}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 disabled:opacity-60"
                placeholder="Nombre..."
                value={newPlant.name}
                onChange={(e) =>
                  setNewPlant((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Precio
                </label>
                <input
                  type="text"
                  disabled={loading}
                  inputMode="decimal"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 disabled:opacity-60"
                  placeholder="$ mxn..."
                  value={newPlant.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="text"
                  disabled={loading}
                  inputMode="numeric"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-center font-bold disabled:opacity-60"
                  placeholder="0"
                  value={newPlant.stock}
                  onChange={(e) => handleStockChange(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Categoría
              </label>
              <div
                onClick={() => !loading && setShowCategoryModal(true)}
                className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center ${
                  loading
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-gray-100'
                }`}
              >
                <span
                  className={
                    newPlant.category
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-400'
                  }
                >
                  {newPlant.category || 'Por defecto: Otros'}
                </span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full font-bold py-4 rounded-xl shadow-lg mt-4 text-white transition-all ${
                loading
                  ? 'bg-green-400 scale-95 cursor-wait'
                  : 'bg-green-600 hover:bg-green-700 hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Guardando...' : productToEdit ? 'Actualizar' : 'Publicar'}
            </button>
          </div>

          {showDiscardConfirm && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[100] rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                ¿Descartar cambios?
              </h4>
              <p className="text-gray-500 mb-6 text-sm">
                Si sales ahora, perderás la información que escribiste.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDiscardConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Seguir editando
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Sí, salir
                </button>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="absolute inset-0 bg-white/98 backdrop-blur-md z-[200] rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">¡Guardado!</h4>
              <p className="text-gray-500 font-medium">
                Los cambios se aplicaron con éxito.
              </p>
            </div>
          )}
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCategoryModal(false)}
          ></div>

          <div className="bg-white w-80 rounded-3xl p-0 relative z-[80] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Elige una categoría
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 font-bold"
              >
                ✕
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto p-2 text-gray-800">
              <li
                onClick={() => {
                  setNewPlant((prev) => ({ ...prev, category: '' }))
                  setShowCategoryModal(false)
                }}
                className="p-3 hover:bg-red-50 text-red-500 rounded-xl cursor-pointer font-bold mb-1"
              >
                Ninguna / Limpiar
              </li>

              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  onClick={() => {
                    setNewPlant((prev) => ({ ...prev, category: cat }))
                    setShowCategoryModal(false)
                  }}
                  className={`p-3 rounded-xl cursor-pointer font-medium mb-1 ${
                    newPlant.category === cat
                      ? 'bg-green-50 text-green-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {cat} {newPlant.category === cat && <span>✓</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}