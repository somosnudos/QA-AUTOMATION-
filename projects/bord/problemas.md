# Problemas y hallazgos — Bord

> Archivo append-only: nunca se borra una entrada, solo se agrega.

| Fecha | Módulo | Descripción | Estado | Notas |
|---|---|---|---|---|
| 2026-06-13 | Login | Credencial QA_PASS incorrecta — la app rechaza la contraseña configurada en .env | ⚠️ Bloqueante | Confirmar contraseña correcta con el usuario |
| 2026-06-13 | Login | Múltiples intentos fallidos en paralelo activan cierre de sesión por seguridad ("Por seguridad, hemos cerrado tu sesión.") | 📋 Particularidad | Los tests de login deben correr en serie (`workers: 1`) para evitar lockout |
| 2026-06-13 | Login | La app NO valida el formato del correo en el frontend — ingresando `esto-no-es-un-correo` avanza al paso 2 sin error | 🐛 Bug del producto | CA-2 del spec no se cumple. Reportar al equipo de desarrollo |
