# Gestión de Flota de Vehículos

Aplicación web de una sola página (SPA) para gestionar la operación diaria de una flota de vehículos. Permite administrar conductores, vehículos, movimientos, carguíos de combustible y mantenimientos desde un panel centralizado que funciona completamente en el navegador.

## Características principales

- **Autenticación básica** con un usuario demo (`admin` / `admin123`).
- **Panel de control** con métricas clave y actividades recientes.
- **Módulo de conductores** para registrar información de contacto y licencias.
- **Módulo de vehículos** con estado operativo, capacidad y datos técnicos.
- **Movimientos de flota** para controlar salidas, llegadas y responsables.
- **Carguíos de combustible** con litros consumidos, costo y estación de servicio.
- **Mantenimientos programados** con seguimiento del próximo servicio.
- **Persistencia local** usando `localStorage`, ideal para prototipos sin backend.

## Cómo usarla

1. Abre el archivo `index.html` en tu navegador preferido.
2. Inicia sesión con las credenciales demo: `admin` / `admin123`.
3. Navega por el panel usando las pestañas de la barra superior.
4. Utiliza los botones “Nuevo” o “Registrar” para agregar información. Cada formulario permite crear y editar registros.
5. Los datos quedan almacenados en el navegador (`localStorage`). Puedes limpiarlos desde las herramientas del navegador si deseas volver al estado inicial con los datos de ejemplo.

## Tecnología utilizada

- HTML5 y CSS3 con un diseño adaptable.
- JavaScript moderno (ES Modules) sin dependencias externas.
- Uso de componentes nativos (`<dialog>`) para modales y formularios.

## Estructura del proyecto

```
.
├── index.html       # Contenedor principal de la aplicación
├── css/
│   └── styles.css   # Estilos globales y de componentes
└── js/
    └── app.js       # Lógica de negocio y manejo de datos
```

## Personalización y despliegue

- Para modificar los datos iniciales ajusta la función `createSeedData` en `js/app.js`.
- Puedes desplegar la aplicación en cualquier servicio de hosting estático (GitHub Pages, Netlify, Vercel, etc.).
- Si deseas conectarla con un backend real, reemplaza la capa de persistencia (`localStorage`) por llamadas a una API.