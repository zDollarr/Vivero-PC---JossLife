import { useState, useEffect, useMemo, useRef } from 'react'
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { db, auth } from './firebaseConfig'
import { Sidebar } from './components/Sidebar'
import { AddProductModal } from './components/AddProductModal'
import { LoginScreen } from './components/LoginScreen'

interface Plant {
  id: string
  name: string
  price: number
  category: string
  stock?: number
}

type SortBy =
  | 'none'
  | 'stockAsc'
  | 'stockDesc'
  | 'priceAsc'
  | 'priceDesc'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string>('')

  const [authLoading, setAuthLoading] = useState(true)
  const [checkingRole, setCheckingRole] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Plant | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  // Estado de conexión a internet
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // ORDENAMIENTO
  const [sortBy, setSortBy] = useState<SortBy>('none')

  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      isMounted.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setCheckingRole(true)
        setPermissionError(null)
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userSnap = await getDoc(userDocRef)

          if (userSnap.exists()) {
            const userData = userSnap.data()
            const role = userData.role || userData.rol

            if (role === 'owner' || role === 'admin') {
              if (isMounted.current) {
                setUser(currentUser)
                setUserName(
                  userData.username ||
                    currentUser.email?.split('@')[0] ||
                    'Admin'
                )
              }
            } else {
              await signOut(auth)
              if (isMounted.current) {
                setUser(null)
                setPermissionError(`Acceso denegado. Rol: ${role}`)
              }
            }
          } else {
            if (navigator.onLine) {
              await signOut(auth)
              if (isMounted.current) {
                setUser(null)
                setPermissionError('Cuenta sin perfil.')
              }
            } else {
              setUser(currentUser)
              setUserName(
                currentUser.email?.split('@')[0] || 'Usuario Offline'
              )
            }
          }
        } catch (error) {
          console.error('Error auth/offline:', error)
          if (currentUser) {
            setUser(currentUser)
            setUserName('Modo Offline')
          } else {
            await signOut(auth)
            if (isMounted.current) setPermissionError('Error de conexión.')
          }
        } finally {
          if (isMounted.current) setCheckingRole(false)
        }
      } else {
        if (isMounted.current) setUser(null)
      }
      if (isMounted.current) setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) fetchPlants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchPlants = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'products'))
      const loadedPlants = querySnapshot.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name,
          price: Number(data.price ?? 0),
          category: data.category ?? '',
          stock: Number(data.stock ?? 0),
        } as Plant
      })
      if (isMounted.current) setPlants(loadedPlants)
    } catch (error) {
      console.error(error)
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEdit = (plant: Plant) => {
    setEditingProduct(plant)
    setShowModal(true)
  }

  const confirmDelete = (id: string) => {
    setShowDeleteSuccess(false)
    setProductToDelete(id)
  }

  const executeDelete = async () => {
    if (!productToDelete) return
    const idToDelete = productToDelete

    setPlants((prev) => prev.filter((p) => p.id !== idToDelete))
    setShowDeleteSuccess(true)

    deleteDoc(doc(db, 'products', idToDelete)).catch((error) => {
      console.error('Delete background error:', error)
    })

    setTimeout(() => {
      if (isMounted.current) {
        setProductToDelete(null)
        setShowDeleteSuccess(false)
      }
    }, 1200)
  }

  const handlePrintReport = () => {
    const width = window.screen.width
    const height = window.screen.height
    const printWindow = window.open(
      '',
      '_blank',
      `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,titlebar=no`
    )

    if (!printWindow) return

    const filteredPlantsForReport = plants.filter((plant) => {
      const matchesSearch = plant.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'Todas' || plant.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    const totalValue = filteredPlantsForReport.reduce(
      (acc, curr) => acc + Number(curr.price || 0) * (curr.stock || 1),
      0
    )
    const date = new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    const formatMoney = (amount: number) =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(amount)

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte - JOSS LIFE</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: sans-serif; padding: 20px; color: #1f2937; max-width: 1000px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #166534; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { margin: 0; color: #166534; font-size: 24px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background-color: #166534; color: white; text-align: left; padding: 10px; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            .total-section { text-align: right; margin-top: 30px; font-size: 20px; font-weight: bold; color: #166534; }
          </style>
        </head>
        <body>
          <div class="header">
             <div><h1>JOSS LIFE</h1><small>Reporte de Inventario</small></div>
             <div style="text-align:right"><small>${date}</small><br><small>${userName}</small></div>
          </div>
          <table>
            <thead><tr><th>ID</th><th>Producto</th><th>Categoría</th><th>Stock</th><th style="text-align:right">Precio</th></tr></thead>
            <tbody>
              ${filteredPlantsForReport
                .map(
                  (p) => `
                <tr>
                  <td>${p.id.slice(0, 6).toUpperCase()}</td>
                  <td>${p.name}</td>
                  <td>${p.category}</td>
                  <td>${p.stock ?? 0}</td>
                  <td style="text-align:right">${formatMoney(p.price)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div class="total-section">Total: ${formatMoney(totalValue)}</div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(plants.map((p) => p.category))
    ).filter(Boolean)
    return ['Todas', ...uniqueCategories]
  }, [plants])

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesSearch = plant.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'Todas' || plant.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [plants, searchTerm, selectedCategory])

  // ORDENAR (aplicado sobre lo filtrado)
  const sortedPlants = useMemo(() => {
    const arr = [...filteredPlants]
    arr.sort((a, b) => {
      const aStock = Number(a.stock ?? 0)
      const bStock = Number(b.stock ?? 0)
      const aPrice = Number(a.price ?? 0)
      const bPrice = Number(b.price ?? 0)

      switch (sortBy) {
        case 'stockAsc':
          return aStock - bStock
        case 'stockDesc':
          return bStock - aStock
        case 'priceAsc':
          return aPrice - bPrice
        case 'priceDesc':
          return bPrice - aPrice
        default:
          return 0
      }
    })
    return arr
  }, [filteredPlants, sortBy])

  const toggleStockSort = () => {
    setSortBy((prev) => (prev === 'stockAsc' ? 'stockDesc' : 'stockAsc'))
  }

  const togglePriceSort = () => {
    setSortBy((prev) => (prev === 'priceAsc' ? 'priceDesc' : 'priceAsc'))
  }

  const stockSortIndicator =
    sortBy === 'stockAsc' ? '▲' : sortBy === 'stockDesc' ? '▼' : '↕'

  const priceSortIndicator =
    sortBy === 'priceAsc' ? '▲' : sortBy === 'priceDesc' ? '▼' : '↕'

  if (authLoading || checkingRole) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-bold animate-pulse">
          {checkingRole ? 'Verificando...' : 'Cargando...'}
        </p>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen externalError={permissionError} />
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 relative">
      {/* Sidebar */}
      <Sidebar onReport={handlePrintReport} isOnline={isOnline} />

      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="p-10 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-800">
                Gestión de Inventario
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-500">
                  Hola,{' '}
                  <span className="text-green-700 font-bold capitalize">
                    {userName}
                  </span>
                </p>
                {!isOnline && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 font-bold animate-pulse">
                    Modo Offline
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex gap-2 shadow-lg hover:-translate-y-1 transition-all"
            >
              <span>+</span> Nuevo Producto
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                TOTAL EN CATÁLOGO
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-black text-gray-900">
                  {plants.length}
                </p>
                <span className="text-gray-400 text-lg font-medium">
                  plantas
                </span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                VALOR ESTIMADO
              </p>
              <p className="text-6xl font-black text-green-500 tracking-tight">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0,
                }).format(
                  filteredPlants.reduce(
                    (acc, curr) =>
                      acc + Number(curr.price || 0) * (curr.stock || 1),
                    0
                  )
                )}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 transition-colors duration-500">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                ESTADO DEL SISTEMA
              </p>
              <div className="flex items-center gap-2 mt-2">
                {isOnline ? (
                  <span className="px-5 py-2 bg-green-100 text-green-800 rounded-full font-bold text-sm flex items-center gap-2 transition-all">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Online
                  </span>
                ) : (
                  <span className="px-5 py-2 bg-gray-100 text-gray-600 rounded-full font-bold text-sm flex items-center gap-2 border border-gray-300 transition-all">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Modo Offline
                  </span>
                )}
              </div>
              {!isOnline && (
                <p className="text-xs text-orange-500 mt-2 font-medium">
                  Cambios guardados localmente.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex items-center gap-3 px-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <input
                type="text"
                placeholder="Buscar producto..."
                className="flex-1 bg-transparent outline-none text-gray-700 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-3 pl-4 pr-10 rounded-2xl font-bold cursor-pointer h-full outline-none focus:border-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="p-8 pl-10 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="p-8 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    Categoría
                  </th>

                  {/* STOCK con orden */}
                  <th className="p-8 text-gray-400 font-bold text-xs uppercase tracking-wider text-center">
                    <div className="inline-flex items-center gap-2">
                      <span>Stock</span>
                      <button
                        type="button"
                        onClick={toggleStockSort}
                        className="text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                        title="Ordenar por stock"
                      >
                        {stockSortIndicator}
                      </button>
                    </div>
                  </th>

                  {/* PRECIO con orden */}
                  <th className="p-8 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <div className="inline-flex items-center gap-2">
                      <span>Precio</span>
                      <button
                        type="button"
                        onClick={togglePriceSort}
                        className="text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                        title="Ordenar por precio"
                      >
                        {priceSortIndicator}
                      </button>
                    </div>
                  </th>

                  <th className="p-8 pr-10 text-right text-gray-400 font-bold text-xs uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {sortedPlants.map((plant) => (
                  <tr
                    key={plant.id}
                    className="hover:bg-green-50 transition-colors"
                  >
                    <td className="p-6 pl-10">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {plant.name}
                        </p>
                        <p className="text-xs text-gray-400 uppercase">
                          ID: {plant.id.slice(0, 4)}
                        </p>
                      </div>
                    </td>

                    <td className="p-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase">
                        {plant.category}
                      </span>
                    </td>

                    <td className="p-6 text-center">
                      {(plant.stock || 0) === 0 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-extrabold">
                          AGOTADO
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-sm ${
                            (plant.stock || 0) < 5
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {plant.stock} u.
                        </span>
                      )}
                    </td>

                    <td className="p-6 font-bold text-lg text-gray-700">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(plant.price)}
                    </td>

                    <td className="p-6 pr-10 text-right">
                      <button
                        onClick={() => handleEdit(plant)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => confirmDelete(plant.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && sortedPlants.length === 0 && (
              <div className="p-20 text-center text-gray-400">
                Sin productos aún.
              </div>
            )}
          </div>
        </div>
      </main>

      <AddProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        productToEdit={editingProduct}
        onSuccess={fetchPlants}
      />

      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !showDeleteSuccess && setProductToDelete(null)}
          ></div>

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-[110] text-center shadow-2xl transition-all">
            {!showDeleteSuccess ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Eliminar producto?
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setProductToDelete(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Eliminado!
                </h3>
                <p className="text-gray-500 font-medium">
                  El producto ha sido borrado.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
