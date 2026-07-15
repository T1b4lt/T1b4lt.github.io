---
idx: 5
title: "Deja de quemar tokens: tres estrategias para agentes de código"
author: "Guillermo"
pubDate: "15 de julio de 2026"
pubDateLogical: "2026-07-15"
tags: ["AI", "Coding Agents", "Tokens", "Productividad"]
---

Si usas agentes de código como Claude Code, OpenCode, Codex o GitHub Copilot a diario, seguramente has vivido esta escena: es martes, estás en mitad de un refactor, y la herramienta te recibe con un _"has alcanzado tu límite de uso"_. O peor: llega la factura de la API a final de mes y tiene más dígitos de los que esperabas.

Los agentes de código son glotones. Cada pregunta que haces, cada fichero que abren, cada comando que ejecutan se convierte en **tokens**, y los tokens son exactamente lo que pagas. La buena noticia: buena parte de ese consumo es puro desperdicio, y hay herramientas cada vez mejores para recortarlo.

Llevo un tiempo investigando el ecosistema de herramientas de ahorro de tokens y he encontrado que casi todo encaja en **tres estrategias**, ordenadas de más barata a más cara de adoptar. Pero antes de verlas, hay que entender adónde se va el dinero realmente.

## Anatomía de la factura: input vs output

Cada mensaje que se intercambia con un LLM tiene dos caras:

- **Tokens de input:** todo lo que el modelo _lee_. El system prompt, las definiciones de herramientas, tus instrucciones, los ficheros que abre, la salida de los comandos que ejecuta... y, crucialmente, **toda la conversación reenviada en cada turno**, porque el modelo no tiene memoria entre llamadas.
- **Tokens de output:** todo lo que el modelo _escribe_. Sus explicaciones, el código, las llamadas a herramientas.

![Adónde van los tokens en una sesión de agente de código](/images/blog/token-saving-where-tokens-go.svg)

La asimetría es doble. En **volumen**, el input gana por goleada: en una sesión típica de agente puede ser tranquilamente el ~95% de todos los tokens, porque el historial se reenvía una y otra vez. En **precio unitario**, gana el output: los proveedores suelen cobrar en torno a **5 veces más** por token de output que por token de input.

Y hay un detalle perverso: cada token que el modelo escribe se convierte en input en el siguiente turno. La verborrea te la cobran dos veces.

Esto nos da dos superficies de ataque muy distintas: encoger la riada de input, o domar el (caro) output. Las tres estrategias que vienen juegan en ese tablero.

![Tres estrategias, tres niveles de compromiso](/images/blog/token-saving-three-strategies.svg)

## Estrategia 1: skills de control de output

**Esfuerzo: minutos. Coste: cero.**

El output es la parte más difícil de controlar: no puedes comprimir con un script lo que el modelo escribe _después_ de que lo haya escrito — para entonces ya lo has pagado. La única palanca disponible es el **prompting**: instruir al modelo para que escriba menos. Eso es exactamente lo que hace esta familia de "skills" (ficheros de instrucciones que el agente carga).

[**caveman**](https://github.com/juliusbrussee/caveman) es la versión más literal de la idea: hace que el agente hable como un cavernícola. Nada de frases de relleno, nada de "¡Gran pregunta!", nada de explicaciones de tres párrafos para un cambio de una línea. Fragmentos y estilo telegráfico, manteniendo intactos el código, los comandos y los mensajes de error. Su benchmark reporta una **reducción media del 65% en tokens de output** en sus prompts de prueba: una explicación de un bug de React pasó de 1.180 tokens a 159. Dos detalles honestos que se agradecen: los autores admiten que la propia skill añade 1–1,5k tokens de input por turno, así que el ahorro de la sesión completa es menor que el titular; e incluye `/caveman-stats` para que midas lo que ahorras, en vez de fiarte de su palabra.

[**ponytail**](https://github.com/DietrichGebert/ponytail) ataca el mismo problema desde un ángulo más interesante: en vez de comprimir la _prosa_, comprime el _código_. Su lema es hacer que el agente "piense como el senior más vago de la sala". Antes de escribir nada, el agente debe subir una escalera de decisión: ¿esto necesita existir? ¿ya existe en el repositorio? ¿está en la librería estándar? ¿puede ser una línea? Solo después de todo eso puede escribir código mínimo. Sus pruebas reportan **un 54% menos de código generado y un 22% menos de tokens totales**, sin recortes de seguridad. La parte sutil: menos código generado también significa menos código que el agente tendrá que _releer_ en sesiones futuras. Ahorra en output hoy y en input para siempre.

¿Por qué empezar por aquí? Porque es gratis, se instala con un comando, y golpea a los tokens más caros de la tarifa. Si te molesta (el estilo cavernícola no es para todo el mundo), lo desinstalas y no ha pasado nada.

## Estrategia 2: comprimir el input

**Esfuerzo: bajo. Coste: cero. Letra pequeña: mide primero.**

La segunda familia se coloca en medio de la tubería: entre tu entorno y el modelo, comprimiendo lo que el agente lee antes de que llegue al contexto.

[**RTK**](https://github.com/rtk-ai/rtk) (Rust Token Killer) es un único binario en Rust que intercepta los comandos de shell y los reescribe en versiones comprimidas: `git status` se convierte silenciosamente en `rtk git status`, que filtra ruido, agrupa líneas parecidas y deduplica repeticiones antes de que la salida llegue al modelo. Promete reducciones del 70–90% en cosas como la salida de los tests o `git diff`.

Y aquí viene la lección más valiosa de este post, cortesía de mis propias pruebas: **RTK cumple lo que promete, y aun así no me ahorró casi nada**. La compresión es real — un 60–70% sobre la salida de shell. El problema es que en mi pipeline de desarrollo, la salida de comandos de shell no llega ni al **1% del input total**. El grueso son lecturas de ficheros, historial de conversación, system prompt. Así que el ahorro real fue un 60% del 1%.

![Un compresor del 70% aplicado al 1% de tus tokens](/images/blog/token-saving-sixty-of-one.svg)

Es la misma lógica que la ley de Amdahl en optimización de sistemas: da igual cuánto optimices una parte; la ganancia total está limitada por el peso de esa parte en el conjunto. Un porcentaje espectacular aplicado a una porción diminuta es un ahorro diminuto. **Antes de instalar cualquier compresor, mide cuánto pesa en _tu_ uso la porción que comprime.** Si tu agente vive entre logs de build enormes y suites de tests, RTK puede ser un chollo. Si no, es un error de redondeo.

[**headroom**](https://github.com/headroomlabs-ai/headroom) es la versión más ambiciosa de la idea: no un compresor de comandos de shell sino un **proxy completo** entre tu agente y la API (`headroom wrap claude` y listo). Enruta cada tipo de contenido a un compresor especializado: el JSON recibe compactación estructural (reducción del 60–95%), el código se analiza vía AST, la prosa pasa por un pequeño modelo entrenado. La compresión es reversible: guarda los originales en local y le da al modelo una herramienta de recuperación por si necesita el detalle perdido. Para agentes de código en concreto promete un **15–20%**, más modesto y creíble — una cifra que, fíjate, es coherente con mi experiencia del "60% del 1%": los números sobre el pipeline completo siempre son mucho menores que los titulares por componente.

## Estrategia 3: un grafo de conocimiento de tu repositorio

**Esfuerzo: setup y mantenimiento reales. Recompensa: solo si lo amortizas.**

La tercera estrategia ataca el gasto más grande y menos visible de todos: la **exploración**. Cuando le pides a un agente que arregle un bug, no sabe dónde está nada. Así que hace greps, abre ficheros, los lee enteros, los descarta, abre otros... decenas de miles de tokens solo para _situarse_. Y lo cruel: en la siguiente tarea lo ha olvidado todo y vuelve a pagar la factura entera.

La idea aquí es construir, una sola vez, un **mapa de tu repositorio** — qué funciones existen, quién llama a quién, qué importa a qué — para que el agente pueda hacer preguntas precisas en vez de rebuscar a ciegas.

![Explorar un repositorio: bucle de greps vs grafo de conocimiento](/images/blog/token-saving-graph-vs-grep.svg)

[**graphify**](https://github.com/Graphify-Labs/graphify) convierte cualquier carpeta de código en un grafo de conocimiento consultable. La extracción base usa tree-sitter para parsear el AST de más de 36 lenguajes y sacar las relaciones (imports, llamadas, herencia) **en local, de forma determinista y sin una sola llamada a un LLM** — construir el grafo del código es gratis. Produce un grafo HTML interactivo, un informe de conceptos clave y un JSON que el agente puede consultar con comandos como `graphify query` o `graphify explain` en vez de hacer greps. Opcionalmente puede enriquecer el grafo con documentación, PDFs o imágenes usando un LLM, pero esa parte sí cuesta dinero.

[**codegraph**](https://github.com/colbymchenry/codegraph) es la misma filosofía con un acabado más de "infraestructura invisible": todo vive en una base de datos SQLite local con búsqueda de texto completo, y un observador de ficheros actualiza el grafo automáticamente mientras editas. Ejecutas `codegraph init` en cada proyecto, conectas tus agentes con `codegraph install` (Claude Code, Cursor, Codex...) y te olvidas. Sus benchmarks sobre 7 repositorios reales reportan una mediana de **58% menos llamadas a herramientas** y hasta **64% menos tokens** en repos tan grandes como el de VS Code. Y de nuevo, honestidad loable en la letra pequeña: el ahorro _depende de la escala_ — modesto en un proyecto de 500 ficheros, sustancial en monorepos con uso intensivo.

Ese es exactamente el marco para decidir: esta estrategia tiene un coste de entrada (montarlo, aprenderlo, mantener el índice vivo) que solo tiene sentido **si lo vas a amortizar**. ¿Repositorio grande, muchas sesiones por semana, un equipo entero apuntando agentes al mismo código? Las cuentas salen. ¿Un proyecto personal de 40 ficheros? El agente se lo explora entero por menos de lo que te cuesta el índice.

## Chuleta final

| Estrategia                  | Ejemplos            | Ataca a...                   | Esfuerzo              | Instálalo si...                                        |
| --------------------------- | ------------------- | ---------------------------- | --------------------- | ------------------------------------------------------ |
| Skills de control de output | caveman, ponytail   | El output (los tokens a 5×)  | Minutos               | Siempre — probarlo es gratis                           |
| Compresión de input         | RTK, headroom       | El input (el 95% en volumen) | Bajo                  | Has medido, y la porción comprimible es gorda          |
| Grafo de conocimiento       | graphify, codegraph | La exploración (repetida)    | Setup + mantenimiento | Repo grande, uso intensivo, puedes amortizar el índice |

## Reflexión final

Si tuviera que destilar este post en tres frases: **empieza por una skill** porque es gratis y golpea a los tokens caros; **mide antes de instalar compresores**, porque un porcentaje espectacular de una porción diminuta es un ahorro diminuto; e **invierte en un grafo de conocimiento solo cuando los números digan que lo vas a amortizar**.

Y un último recordatorio que ninguna herramienta sustituye: el mayor ahorro de tokens sigue estando en los hábitos aburridos — tareas bien acotadas, un buen `CLAUDE.md`/`AGENTS.md` para que el agente no tenga que redescubrir tus convenciones, y empezar sesiones nuevas en vez de arrastrar kilómetros de historial. Las herramientas comprimen tokens; los hábitos los evitan.

## Para seguir leyendo

- [caveman](https://github.com/juliusbrussee/caveman) — compresión de output hablando como un cavernícola, con estadísticas medibles.
- [ponytail](https://github.com/DietrichGebert/ponytail) — generación de código mínimo, YAGNI como system prompt.
- [RTK](https://github.com/rtk-ai/rtk) — compresor de salida de shell en un único binario de Rust.
- [headroom](https://github.com/headroomlabs-ai/headroom) — proxy de compresión consciente del contenido, con compresión reversible.
- [graphify](https://github.com/Graphify-Labs/graphify) — de código (y docs) a grafo de conocimiento consultable, basado en tree-sitter.
- [codegraph](https://github.com/colbymchenry/codegraph) — grafo de código local en SQLite con sincronización automática, hecho para agentes.
