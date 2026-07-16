# El Consejo crítico — revisión obligatoria antes de graduar

Ningún test pasa de `@unreviewed` a `@regression` sin recorrer estas 5 miradas y
escribir el veredicto en `e2e/specs/<módulo>.council.md`. El Consejo es lo que
separa "un test que pasa" de "un test que atrapa bugs".

## Las 5 miradas

### 🔴 1 · Rompedor
¿Probaste caminos negativos, bordes, input inválido, doble clic, sesión vencida?
Si solo cubriste el happy path, **el módulo NO está probado**. Un login sin el
caso "contraseña equivocada" no es una regresión de login.

### 🟠 2 · Cobertura
Recorré el `.spec.md` criterio por criterio. ¿Cada criterio de aceptación tiene
al menos una aserción que lo verifica? El que no la tenga, es un hueco: nómbralo.

### 🟡 3 · Aserciones
¿Las aserciones verifican el **resultado real** o solo que "la página cargó"?
`expect(page).toHaveURL(...)` no prueba que el dashboard funcione. Validá el
contenido concreto que el criterio promete.

### 🔵 4 · Prueba de fuego (la innegociable)
**Rompé a propósito el resultado esperado** — cambiá el texto esperado, apuntá a
un dato que no existe, invertí la condición — y **corré el test: DEBE ponerse
ROJO**. Si sigue verde, la aserción no prueba nada: reescribila. Después restaurá
y dejalo verde. Documentá en el council qué rompiste y que se puso rojo.

### ⚪ 5 · Fiabilidad
¿Es flaky? ¿Tiene esperas duras (`waitForTimeout`)? ¿Locators frágiles (CSS,
texto que cambia por ambiente)? ¿Depende del orden de otros tests? Un test que
falla intermitente envenena el gate y entrena al equipo a ignorar los rojos.

## Formato del veredicto (`<módulo>.council.md`)

```md
# El Consejo — <módulo>
Spec: e2e/specs/<módulo>.spec.md · Jira: <KEY> · Fecha: <YYYY-MM-DD>

## 🔴 Rompedor
Veredicto: <qué casos negativos/borde se cubrieron o por qué no aplican>

## 🟠 Cobertura
Veredicto: <mapeo criterio → aserción; huecos si los hay>

## 🟡 Aserciones
Veredicto: <qué resultado real valida cada aserción>

## 🔵 Prueba de fuego
Veredicto: <qué se rompió a propósito y se confirmó rojo, por CA>

## ⚪ Fiabilidad
Veredicto: <flaky? esperas? locators? independencia?>

## Decisión
[ ] Graduar a @regression   ·   [ ] Vuelve a @unreviewed porque: <razón>
```

## Cuándo un test NO gradúa

- Falta la prueba de fuego, o no se puso rojo al romperlo.
- Algún criterio del spec quedó sin aserción.
- Es flaky en cualquiera de las 3 corridas de estabilización.
- Solo cubre el happy path de un módulo que tiene caminos negativos claros.

En cualquiera de esos casos, se queda en `@unreviewed`, no entra al gate, y se
anota qué falta.
