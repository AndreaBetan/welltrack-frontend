# WellTrack Frontend

Aplicación web para el seguimiento integral del bienestar personal. Permite registrar y consultar alimentación, actividad física y sueño, establecer objetivos y visualizar estadísticas y recomendaciones personalizadas.

Este repositorio contiene el frontend de WellTrack. Para utilizar todas las funcionalidades debe ejecutarse junto con la API del proyecto.

## Funcionalidades

- Registro, inicio y cierre de sesión.
- Configuración y gestión de objetivos personales.
- Búsqueda de alimentos y registro de comidas por momento del día.
- Seguimiento diario de calorías y macronutrientes.
- Registro e historial de actividad física.
- Registro, edición y análisis del descanso.
- Dashboard con indicadores diarios de bienestar.
- Estadísticas de progreso.
- Recomendaciones personalizadas basadas en los registros del usuario.
- Diseño adaptable a diferentes tamaños de pantalla.

## Tecnologías

- Vue 3
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Lucide Icons
- ESLint y Oxlint

## Requisitos

- Node.js `22.18.0` o una versión superior compatible. El proyecto se ha verificado con Node.js `22.21.1`.
- npm
- WellTrack API ejecutándose localmente o en un servidor accesible.

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/AndreaBetan/welltrack-frontend.git
cd welltrack-frontend
npm install
```

## Variables de entorno

Crea un archivo `.env` a partir del ejemplo incluido:

```bash
cp .env.example .env
```

Configuración local predeterminada:

```env
VITE_API_URL=http://localhost:3000/api
```

`VITE_API_URL` debe apuntar a la ruta base de la API. Las variables con el prefijo `VITE_` quedan disponibles en el navegador, por lo que no deben contener contraseñas, claves privadas ni otros secretos.

## Ejecución en desarrollo

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación, normalmente `http://localhost:5173`.

## Comandos disponibles

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Revisar y corregir las reglas de código
npm run lint

# Generar la versión optimizada para producción
npm run build

```

La compilación de producción se genera en `dist/`. Esta carpeta está excluida del repositorio.

## Estructura principal

```text
src/
├── assets/       # Estilos y recursos estáticos
├── components/   # Componentes reutilizables de interfaz
├── icons/        # Catálogo centralizado de iconos
├── router/       # Rutas y protección de vistas privadas
├── services/     # Comunicación HTTP y almacenamiento local
├── stores/       # Estado global con Pinia
├── utils/        # Funciones auxiliares compartidas
└── views/        # Vistas organizadas por funcionalidad
```

Cada funcionalidad puede contener sus propios `components/` y `composables/`. Los componentes utilizados por varias vistas se mantienen en `src/components`.

## Backend

El frontend consume los endpoints de WellTrack API para autenticación, perfil, objetivos, alimentación, actividad física, sueño, recomendaciones, estadísticas y dashboard. La URL del backend se configura mediante `VITE_API_URL`.
