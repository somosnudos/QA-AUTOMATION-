# Cliente: Bord — Dash

## Ambientes
| Ambiente | URL | Config | Pruebas |
|---|---|---|---|
| Beta | https://beta.dash.bord.co | `playwright.config.beta.ts` | ✅ aquí corre todo |
| Producción | https://dash.bord.co | `playwright.config.ts` | ⚠️ Solo NO destructivas — servidores apagados fines de semana |

## Usuarios de prueba
| Ambiente | Usuario | Credenciales |
|---|---|---|
| Producción | britney.colt+1@bord.co | `.env` → `QA_USER` / `QA_PASS` |
| Beta | britney.colt+8@bord.co | `.env.beta` → `QA_USER` / `QA_PASS` |

## Módulos críticos
1. Login
2. Facturación

## Particularidades
- Servidores de producción apagados los fines de semana — usar beta en esos días
- Login tiene modal de seguridad que puede aparecer al cargar /login O tras clic en "Continuar" — ver `goToPasswordStep()` en login.spec.ts
- `workers: 1` obligatorio para evitar lockout por intentos paralelos

## Reporte publicado
_(pendiente de configurar)_
