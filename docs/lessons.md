# Lecciones aprendidas — todos los clientes

> Aprendizajes que aplican a cualquier proyecto. Se agregan, nunca se borran.

| Fecha | Lección | Contexto |
|---|---|---|
| 2026-06-13 | Los tests de login SIEMPRE deben correr con `workers: 1` — ejecutarlos en paralelo genera múltiples intentos fallidos que activan bloqueos de seguridad en la app | Bord: login en paralelo activó "Por seguridad, hemos cerrado tu sesión" |
| 2026-06-13 | El `.env` de cada cliente debe apuntar explícitamente con `config({ path: __dirname + '/.env' })` — el `import 'dotenv/config'` busca en el CWD (raíz del repo) y no encuentra el .env del proyecto | Bord: primer run falló con "invalid URL" porque BASE_URL era undefined |
