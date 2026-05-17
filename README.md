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

## Requisitos

- Node.js 18 o superior
- npm

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/zDollarr/Vivero-PC---JossLife.git
cd Vivero-PC---JossLife

# Instalar dependencias
npm install
```

---

## Variables de entorno

Antes de correr la app, crea un `.env` en la raíz con tus datos de Firebase.
Si no tienes proyecto, créalo en https://console.firebase.google.com

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> El `.env` está en `.gitignore`, no se sube al repo.

---

## Cómo correrlo

```bash
# Modo desarrollo (abre la ventana de Electron)
npm run dev

# Build — genera el instalador .exe en /release
npm run build
```

> **Nota:** si `npm run dev` falla con Electron la primera vez, corre esto antes:
> ```bash
> node node_modules/electron/install.js
> ```

---

## Estructura

```
electron/ → proceso principal
src/ → interfaz React
src/components/ → componentes
build/ → íconos
```
