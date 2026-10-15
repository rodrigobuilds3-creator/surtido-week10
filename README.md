# Surtido

**Tu caja primero.** Prototipo Week 10 / MONEY de Rodrigo Peña de León Pérez.

Una mesa de trabajo para decidir la reposición de cuatro productos perecederos con caja, reserva, conteo, costo, paquetes y caducidad. Identidad carbón, blanco y cobalto; interfaz en español.

## Enlaces de entrega

App privada: https://surtido-week10-rodrigo.j6x567qt8g.chatgpt.site

Repositorio privado: https://github.com/rodrigobuilds3-creator/surtido-week10

Dos despliegues reales, Packet previo al código, OCR/LLM ejecutados, prueba sintética independiente, corrección y retest documentados en `docs/`. No hay entrevistas ni ahorros reales medidos.

## Abrir localmente

Requiere Node.js 20 o superior. No requiere instalar dependencias.

```sh
node scripts/dev.mjs
```

Abre la URL que muestra la terminal: http://127.0.0.1:4180 . La aplicación usa datos inventados en memoria. Recargar restablece el caso. No captura cuentas ni envía pedidos.

```sh
npm test
npm run check
npm run build
```

`dist/` contiene la compilación estática. `.openai/hosting.json` conserva la identidad de Sites ya creada; no se debe registrar otra.

## Qué puedes probar

1. Cambia la caja a 900 y la reserva a 240. Aplica los límites: el pedido cuesta 630 y deja 270.
2. Revisa y corrige datos de cada producto; cambia paquetes y observa los límites.
3. Lee el ticket de práctica: OCR real propone costo por pieza de 12, sin confundirlo con el importe de 288. Debes confirmar la lectura; no cambia el conteo.
4. Revisa el pedido, marca la confirmación y descarga una copia JSON o usa la vista para imprimir.
5. En Números compara supuestos de merma, margen perdido y costo de captura. El caso base muestra 779 netos; demanda alta reduce la diferencia a 75. Son escenarios, no ahorros observados.
6. La explicación por reglas está disponible siempre. La opción de IA descarga un modelo abierto grande la primera vez y procesa localmente; su resultado está limitado a una prioridad de revisión con texto controlado.

## Límites y estado

La app y el OCR se probaron en navegador. La evidencia concreta está en `docs/TEST_LOG.md`. Los commits incluyen el Packet anterior al código y fallos reales corregidos. La publicación y dos despliegues están confirmados. La Persona PDF incluye transcripción y 16 capturas; BUILDCHAT es una exportación literal del registro real de mensajes visibles. La grabación y la entrega en Brightspace siguen pendientes. Ver `docs/DELIVERY_STATUS.md`.

No hay base de datos, pedidos enviados, pagos, pronósticos garantizados o datos reales. El modelo y los recursos OCR se descargan de sus proveedores públicos; los registros del caso no se suben.
