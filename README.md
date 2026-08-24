# Business Intelligence — Questions / Decisions

Un retrato interactivo y narrativo de Business Intelligence. La experiencia convierte
seis tipos de preguntas de negocio en un camino visible:

**dato → evidencia → decisión → resultado observado**

## Alcance de esta fase

- Una experiencia web responsive, sin backend.
- Seis escenarios demostrativos: clientes, crecimiento, pricing, operaciones, personas y riesgo.
- Dataset sintético y trazable en `data/scenarios.json`.
- Visuales específicos para cada pregunta (línea, barras comparadas, dispersión, waterfall y matriz).
- Clasificador local y orientativo de preguntas; no usa IA ni guarda información.
- Tres piezas audiovisuales curadas desde TED.
- Fotografías editoriales originales, generadas para este proyecto.

Los resultados incluidos son **demostrativos**. No representan el desempeño real de una
empresa ni prueban impacto causal.

## Ejecutar

```bash
npm install
npm run dev
```

## Verificar

```bash
npm test
npm run build
```

## Siguiente evidencia necesaria

Para reemplazar un escenario por un ciclo real se necesita, como mínimo:

1. fuente y definición del dato;
2. pregunta y decisión registrada;
3. responsable y fecha de intervención;
4. métrica antes/después o grupo comparable;
5. resultado observado y sus límites.
