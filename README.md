# Vivero PC — JossLife Manager

App de escritorio para gestión de un vivero. Controla el inventario de plantas y productos, genera reportes y maneja acceso por usuario.


---

## Tecnologias

- **Electron** — app de escritorio
- **Vite + React + TypeScript** — frontend
- **Tailwind CSS** — estilos
- **Firebase** — auth y base de datos

---

## Funciones principales

- Login con Firebase Authentication
- Agregar, editar y eliminar productos del inventario
- Generación de reportes
- Sidebar de navegación


---

## Cómo correrlo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build
npm run build
```


---

## Variables de entorno

Crea un `.env` en la raíz con tus datos de Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Estructura

```
electron/       → proceso principal
src/            → interfaz React
src/components/ → componentes
build/          → íconos
```

