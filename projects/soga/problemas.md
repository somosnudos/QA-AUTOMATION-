# Problemas y hallazgos — Soga

_Archivo append-only: solo se agrega, nunca se borra._

---

## 2026-07-06 — Módulo "Próximo a llegar" muestra "Esta sección estará disponible próximamente"

**URL probada:** `https://d2hq6whafzzidb.cloudfront.net/incoming`
**Usuario:** `britney.colt+2@bord.co` (rol: usuario, no admin)
**Síntoma:** La página carga correctamente (login OK, navegación OK) pero el contenido del módulo muestra el mensaje "Esta sección estará disponible próximamente." — sin tabs, sin listado, sin buscador.
**Hipótesis:**
1. El módulo aún no está desplegado en esta URL de beta para este rol de usuario
2. La URL `/incoming` no es la correcta para el módulo "Próximo a llegar"
3. El usuario no tiene permiso para acceder a este módulo

**Resolución:** El módulo requiere `localStorage.setItem('isOnlyDevsLogistics', 'true')` para ser visible. Los tests lo inyectan automáticamente vía `page.evaluate()` antes de navegar a `/incoming`. Este flag deberá removerse de los tests cuando el módulo esté habilitado por defecto en producción.

---

## 2026-07-06 — Filtro "Bodega" y columna "Bodega" visibles para usuario no-admin

**Usuario:** `britney.colt+2@bord.co` (declarado como rol: usuario, no admin)
**Síntoma:** La spec BORD-4445 dice que el filtro País y la columna Bodega son SOLO visibles para admin. Sin embargo, este usuario SÍ ve:
- El filtro **Bodega** (en la barra de filtros)
- La columna **Bodega** en las cards (muestra "Argentina" con bandera)
**NO ve:** El filtro País (correcto según spec)
**Hipótesis:** El permiso de visibilidad de Bodega está implementado de forma diferente a lo especificado, o el usuario tiene un rol mixto en beta.
**Acción requerida:** Confirmar con el equipo si este comportamiento es correcto o es un bug de permisos. Jira: BORD-4445.

---

## 2026-07-06 — Filtros disponibles difieren del spec

**Spec dice:** Filtros disponibles = País (admin), Cliente, Tipo de entrada, Proveedor
**UI real muestra:** Bodega, Empresa, Tipo de entrada (no hay "Proveedor" como filtro independiente)
**"Cliente" → se llama "Empresa"** en la implementación.
**Acción requerida:** Confirmar si "Proveedor" como filtro será implementado o fue descartado. Jira: BORD-4445.

---

## 2026-07-06 — Módulo requiere `localStorage.setItem('isOnlyDevsLogistics', 'true')` para ser visible. Los tests lo inyectan automáticamente vía `page.evaluate()` antes de navegar a `/incoming`. Este flag deberá removerse de los tests cuando el módulo esté habilitado por defecto en producción.

---

## 2026-07-06 — Tab "Órdenes" tiene typo: falta tilde en la implementación

**Figma (diseño):** tab dice `Órdenes` (con tilde en la Ó)
**App actual:** tab dice `Ordenes` (sin tilde)
**Nodo Figma:** `8476:113926` — "Tab Órdenes"
**Impacto:** Error de internacionalización / tipografía. El nombre del tab no respeta el diseño.
**Tests afectados:** CA-2 y CA-7 fallan intencionalmente hasta que se corrija.
**Acción requerida:** El dev debe corregir el texto del tab de "Ordenes" a "Órdenes". Jira: BORD-4445.

