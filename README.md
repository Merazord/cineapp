# cineapp

Aplicación móvil de cartelera para Práctica 2 Unidad 2. Incluye Expo + React Native + TypeScript, API REST con Express y base de datos MySQL. Interfaz en español, diseño oscuro, carteles geométricos originales, búsqueda, categorías y detalle. Las seis películas y los directores son ficticios.

## Requisitos

- Node.js 24 LTS y npm.
- Expo Go compatible con Expo SDK 57, o un emulador/desarrollo nativo compatible. Se usan las mismas versiones de Expo, React y React Native que el ejemplo CasaCambio. Consulta https://expo.dev/go para la versión compatible.
- Docker Desktop para iniciar MySQL y la API juntos, o MySQL 8.4 instalado para la alternativa manual.

## Instalación

Desde la carpeta raíz del repositorio:

```sh
npm ci
```

La instalación de la raíz instala también `backend/` y `mobile/`, como proyectos independientes, sin enlaces simbólicos. Se puede trabajar directamente en cada carpeta con `npm ci`.

## Opción A — MySQL y API con Docker

1. Copia `.env.example` como `.env` y cambia ambas contraseñas.
2. Ejecuta:

```sh
docker compose up --build -d
```

MySQL inicializa `database/init.sql` la primera vez que crea el volumen. La API espera a que la base esté lista. El volumen conserva los datos entre reinicios. Usa `docker compose down` para detener sin eliminar datos.

## Opción B — MySQL instalado

1. Ejecuta `database/init.sql` desde MySQL Workbench con una cuenta con permisos para crear la base.
2. Crea un usuario local `cineapp`, asígnale contraseña y permiso SELECT sobre `cineapp.*`.
3. Copia `backend/.env.example` a `backend/.env` y completa la conexión. Mantén `DATA_SOURCE=mysql`.
4. Ejecuta `npm run api` desde la raíz.

## Abrir la app

1. Copia `mobile/.env.example` a `mobile/.env`.
2. Deja `EXPO_PUBLIC_API_URL` vacío: en desarrollo la app consulta la API a través del mismo servidor Expo. No necesitas configurar una IP en el celular. Si prefieres un backend independiente o publicado, puedes configurar su URL explícitamente.
3. Ejecuta `npm start` desde la raíz: inicia la API y Expo juntos. Escanea el QR con Expo Go; presiona `w` para navegador o `a` para Android. Reinicia Expo si cambias `.env`. Si la API ya está iniciada (por ejemplo con Docker), usa `npm run mobile` para abrir solamente Expo.

Si el celular no puede acceder a la computadora por Wi-Fi, deja la API encendida y ejecuta desde `mobile/`:

```sh
npm run start:tunnel
```

Escanea el nuevo QR en Expo Go. El túnel temporal funciona por internet y puede tardar más en cargar. El proxy de desarrollo en `metro.config.js` comparte las consultas de API en `/cineapp-api/`, usando el mismo túnel de Expo. Su destino es fijo: el backend local en el puerto 3000. El túnel comparte el entorno de desarrollo y el catálogo de ejemplo mientras está activo; se detiene con Ctrl+C. Para una publicación independiente de Expo configura `EXPO_PUBLIC_API_URL` con la URL HTTPS del backend.

## Demostración sin MySQL

El modo de demostración es explícito y muestra un aviso en la interfaz. La configuración predeterminada del servidor sigue siendo MySQL; nunca cambia de modo silenciosamente.

PowerShell:

```powershell
$env:DATA_SOURCE='demo'
npm run api
```

Bash:

```sh
DATA_SOURCE=demo npm run api
```

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/health` | Estado y origen de datos; 503 si MySQL no responde |
| GET | `/peliculas` | Catálogo con director y categoría |
| GET | `/peliculas?q=lluvia&categoriaId=2` | Búsqueda y filtro combinados |
| GET | `/peliculas/1` | Detalle; 404 si no existe |
| GET | `/categorias` | Catálogo de categorías |
| GET | `/directores` | Catálogo de directores |

Las consultas exitosas devuelven `{ "data": ... }`. Los errores devuelven `{ "error": "mensaje" }`. Los identificadores deben ser enteros positivos. El backend usa parámetros SQL. La app carga el catálogo y aplica la búsqueda y los filtros localmente para una respuesta inmediata; el API también permite filtrar desde otros clientes.

## Modelo de datos

`Directores (1) → (N) Peliculas (N) ← (1) Categorias`.

Se conservan los campos solicitados en el enunciado. Se agregan `Color` y `Estreno` para la presentación. Duración en minutos. Los carteles se dibujan con componentes nativos y no dependen de imágenes de terceros.

## Comprobaciones

```sh
npm test
npm run typecheck
npm run test:mysql
npm --prefix mobile test
```

Las pruebas de API cubren catálogo, detalle, filtros, valores inválidos, película inexistente y errores de conexión usando el repositorio demo. `test:mysql` prueba la conexión real con las credenciales de `backend/.env`, las relaciones, los filtros y el API; espera los seis registros originales del script. Es de solo lectura. `/health` debe indicar `source: mysql`.

Prueba manual móvil: cargar cartelera; buscar `lluvia`; filtrar Ciencia ficción; abrir y cerrar un detalle; buscar un título inexistente; apagar la API y deslizar para actualizar; reintentar después de encenderla.

## Alcance y estructura

- `mobile/`: aplicación móvil y navegación por modal.
- `backend/`: API, repositorios MySQL/demo y pruebas.
- `database/init.sql`: tablas, relaciones y datos iniciales.
- `docker-compose.yml`: MySQL y backend.

La interpretación del enunciado es una cartelera interactiva. No incluye reservas, pagos, asientos, autenticación ni administración de películas. No se ha generado un APK ni publicado la app en tiendas. El modo local HTTP está pensado para desarrollo; una publicación requiere HTTPS y configurar el origen CORS.

Documentación Expo: https://docs.expo.dev/get-started/create-a-project/
