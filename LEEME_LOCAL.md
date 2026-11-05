# Ejecutar cineapp en esta computadora

El proyecto está preparado en `C:\Projects\cineapp` con Expo SDK 58, dependencias instaladas y conexión a la base MySQL `cineapp`. Las contraseñas están únicamente en `backend/.env`, excluido de Git.

## Abrir en la computadora

Haz doble clic en `INICIAR.cmd`. También puedes abrir una terminal aquí y ejecutar:

```powershell
cd C:\Projects\cineapp
npm.cmd start
```

Inicia la API y Expo. Presiona `w` en la terminal para abrir la app en el navegador. Para detener, presiona Ctrl+C. Si MySQL está detenido, el iniciador intenta arrancar tu instancia existente de DBngin, sin crear otra base ni cambiar sus usuarios.

## Abrir en el celular Android

Primero cierra cualquier instancia anterior. Haz doble clic en `INICIAR_CELULAR.cmd` o ejecuta:

```powershell
npm.cmd run start:tunnel
```

Escanea el QR de la terminal con Expo Go para SDK 58. El túnel comparte temporalmente la aplicación y las consultas al catálogo; funciona con Wi-Fi o datos móviles. Mantén la computadora encendida y la terminal abierta. La primera carga puede tardar. El QR puede cambiar entre ejecuciones.

## Comprobar y reinstalar

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run test:mysql
npm.cmd --prefix mobile test
```

Si necesitas reinstalar dependencias, con la app detenida ejecuta `npm.cmd ci` desde esta carpeta. No es necesario hacerlo para el primer uso: las dependencias ya están instaladas.

## Direcciones locales

- API: `http://localhost:3000/health`.
- Expo y navegador: la dirección que muestre la terminal, normalmente `http://localhost:8081`.
- MySQL: `127.0.0.1:3306`, base `cineapp` y usuario de consulta `cineapp`.
- GitHub: https://github.com/Merazord/cineapp

Ejecuta solamente una instancia a la vez. Si aparece un puerto ocupado, cierra la terminal anterior con Ctrl+C antes de abrir otra.
