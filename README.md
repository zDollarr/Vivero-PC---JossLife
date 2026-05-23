# Vivero PC — JossLife Manager

Aplicación de escritorio para la gestión interna de un vivero, desarrollada con Electron, React y TypeScript. Permite administrar el inventario de productos, gestionar usuarios y generar reportes desde una interfaz local orientada al uso administrativo. Este proyecto funciona como la contraparte de escritorio de la app móvil [Proyecto---Rojas](https://github.com/zDollarr/Proyecto---Rojas).

Fue desarrollado como parte de un proyecto académico enfocado en software para una empresa, adaptando la idea principal del vivero a un entorno de escritorio.

---

## Funcionalidades

- Inicio de sesión con Firebase Authentication
- Gestión del inventario de productos (agregar, editar y eliminar)
- Interfaz administrativa con navegación lateral
- Generación de reportes en PDF mediante `html2pdf.js`
- Compilación a instalador de Windows con Electron Builder

---

## Tech Stack

Electron · React · TypeScript · Vite · Tailwind CSS · Firebase · html2pdf.js

---

## Estructura del Proyecto

```text
electron/             # Proceso principal de Electron
src/                  # Interfaz construida con React
├── components/       # Componentes reutilizables
├── assets/           # Recursos estáticos
├── App.tsx           # Componente principal
├── main.tsx          # Punto de entrada de React
├── firebaseConfig.ts # Configuración de Firebase
├── App.css           # Estilos generales
└── index.css         # Estilos base
build/                # Recursos para empaquetado (íconos, etc.)
dist-electron/        # Archivos compilados para Electron
release/              # Instalador generado al compilar
```

---

## Requisitos

- Node.js 18 o superior
- npm

---

## Instalación y Ejecución

```bash
git clone https://github.com/zDollarr/Vivero-PC---JossLife.git
cd Vivero-PC---JossLife
npm install
```

### Variables de entorno

Antes de ejecutar la aplicación, crea un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Generar instalador para Windows

```bash
npm run build
```

> **Nota:** `npm run build` genera el instalador en la carpeta `release/`.

> **Nota adicional:** si `npm run dev` falla con Electron la primera vez, ejecuta:

```bash
node node_modules/electron/install.js
```

---

## Proyecto Relacionado

La versión móvil de este sistema, orientada al cliente, se encuentra en:
[Proyecto---Rojas](https://github.com/zDollarr/Proyecto---Rojas)

---

## Autor

**Fernando Santos Gómez**  
Ingeniería en Sistemas Computacionales –  
[github.com/zDollarr](https://github.com/zDollarr)
