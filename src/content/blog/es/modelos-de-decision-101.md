---
idx: 6
title: "Modelos de decisión: cuando a la IA no le pedimos que escriba, sino que decida"
author: "Guillermo"
pubDate: "28 de octubre de 2026"
pubDateLogical: "2026-10-28"
tags: ["IA", "LLMs", "Modelos de decisión", "Calibración"]
---

Imagina que tienes un sistema de soporte y quieres que una IA decida a qué equipo va cada ticket. Le pasas a un chatbot el mensaje _"¡Ayuda! Mis pagos llevan 3 días fallando"_ y te responde algo como: _"Parece un problema de pagos, así que probablemente debería ir al equipo de facturación, aunque podría tratarse también de un fallo técnico..."_.

La respuesta es correcta. Y, a la vez, bastante inútil para tu código. Lo que tu código necesita es rellenar esto:

```python
team = ???
if team == "billing":
    send_to_billing(ticket)
```

Para llegar ahí tienes que interpretar texto libre, adivinar si ese _"probablemente"_ es un 60 % o un 95 %, y asumir que mañana la misma pregunta puede venir redactada de otra forma. Los LLMs están optimizados para conversar con personas, pero buena parte del software necesita otra cosa: **decisiones pequeñas, rápidas y fiables**.

En septiembre de 2026 apareció una categoría de modelos pensada exactamente para eso: los **modelos de decisión** (o _System One models_). En este post resumo qué son, cómo funcionan por dentro, cómo se entrenan para que sus probabilidades sean honestas y cuándo tiene sentido usarlos. Es la versión escrita de la charla [Modelos de decisión 101](/talks/decisions-models-101/).

## Pensar rápido, pensar despacio

El nombre _System One_ viene del Sistema 1 que popularizó Daniel Kahneman en _Pensar rápido, pensar despacio_: el modo de pensar rápido e intuitivo (reconocer una cara, notar que alguien está enfadado), frente al Sistema 2, lento y deliberado (hacer la declaración de la renta).

- **Sistema 2: LLMs y modelos de razonamiento.** Escriben, explican, planifican y programan. Generan la respuesta palabra a palabra y tardan segundos.
- **Sistema 1: modelos de decisión.** Emiten un juicio concreto con la información delante, eligiendo entre respuestas que tú defines. Tardan decenas o cientos de milisegundos.

Un modelo de decisión hace el juicio de "un segundo" que haría una persona experta con el contexto delante. Por eso no todas las preguntas le valen:

- **Buena pregunta:** "¿Este mensaje transmite urgencia?"
- **Mala pregunta:** "Analiza el mensaje y decide qué hacer."

La segunda no es mala por difícil, sino porque **no es una decisión cerrada**. Hay que partirla en preguntas pequeñas.

## Dos semanas que crearon una categoría

Todo pasó muy rápido:

| Fecha (aprox.) | Hito                     | Qué aporta                                                                                                                   |
| -------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 15 sep 2026    | **Jev**, de TypeSafe     | Define la categoría y la API. Es cerrado: no publica ni arquitectura ni tamaño, solo el nombre de su método de entrenamiento |
| 17 sep 2026    | **Kev** (open source)    | Un LLM Qwen congelado con un adaptador y un _head_ de decisión. API compatible con Jev                                       |
| 18 sep 2026    | **Laya** (open source)   | Un encoder tipo BERT que decide en una sola pasada                                                                           |
| 21 sep 2026    | **CLM** (open source)    | Un enfoque contrastivo: estado y opciones en el mismo espacio de _embeddings_                                                |
| 29 sep 2026    | **OpenAI Decisions API** | Presentada en DevDay sobre GPT-6 Luna, en preview limitada                                                                   |

El patrón es interesante: un pionero cerrado define la idea, en pocos días aparecen alternativas open source que publican pesos y receta, y finalmente el actor más grande del sector lanza su propia versión. Como Jev y OpenAI son cajas negras, **las alternativas open source son nuestra ventana** para entender cómo funcionan probablemente por dentro.

## El contrato: estado, preguntas y respuestas

Toda la categoría se resume en una fórmula:

```text
decisión = f(estado, preguntas)  →  respuesta tipada + probabilidades
```

- **Estado:** el contexto que se evalúa, en texto o JSON. Un ticket, un pedido, un correo, la escena de un juego...
- **Preguntas:** una o varias, cada una con su tipo, sus instrucciones y, sobre todo, **las respuestas posibles**. Las defines tú y el modelo no puede salirse de ellas.
- **Respuestas:** por cada pregunta, la opción elegida, **la probabilidad de cada opción** y una medida de confianza. Listo para usar en código.

Una analogía útil: es un formulario de opción múltiple que el modelo rellena, pero diciendo además cuánta seguridad tiene en cada casilla.

### Choice, score y noul

Hay tres tipos de pregunta, comunes a todos los modelos (todos copian el contrato de TypeSafe):

| Tipo     | Pregunta de ejemplo                 | Qué devuelve                                                   |
| -------- | ----------------------------------- | -------------------------------------------------------------- |
| `choice` | ¿Qué equipo debe atenderlo?         | La opción elegida y una probabilidad por opción                |
| `score`  | ¿Cómo de frustrado está el cliente? | Una posición en una escala ordenada (puede caer entre niveles) |
| `noul`   | ¿Transmite urgencia?                | La probabilidad de "sí", entre 0 y 1                           |

"Noul" es el nombre que TypeSafe da a las preguntas de sí o no.

### Una petición, todas las respuestas

La API, `POST /v1/systemone`, funciona casi como un estándar: Kev, Laya y CLM aceptan los mismos campos, así que cambiar de proveedor suele ser cambiar la URL y el nombre del modelo. Este es un ejemplo real de la documentación pública de Jev, con las tres preguntas en la misma petición:

```json
{
  "model": "jev-latest",
  "state": "Help! My payouts have been failing for 3 days.",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    },
    "department": {
      "type": "choice",
      "instructions": "Which team should handle this?",
      "criteria": {
        "billing": "Payments, invoicing, refunds",
        "technical": "Bugs, outages, integrations",
        "sales": "Pricing, upgrades, new accounts"
      }
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated is the customer?",
      "criteria": ["Calm", "Frustrated", "Very angry"]
    }
  }
}
```

Y la respuesta (resumida):

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "is_urgent": { "type": "noul", "noul": 0.95 },
    "department": {
      "type": "choice",
      "choice": "billing",
      "confidence": 0.8,
      "probabilities": { "billing": 0.87, "sales": 0, "technical": 0.13 }
    },
    "frustration": {
      "type": "score",
      "score": 1.04,
      "confidence": 0.94,
      "probabilities": { "0": 0, "1": 0.96, "2": 0.04 }
    }
  },
  "usage": { "input_tokens": 426, "output_tokens": 73 }
}
```

Cómo leerla: es urgente (0,95), va a facturación con confianza 0,8 (aunque hay un 13 % de que sea un problema técnico, y ventas queda descartada) y el cliente está "frustrado", no "muy enfadado" (score 1,04). Fíjate también en el uso: casi todo el coste está en **leer**. En Jev, de hecho, la salida es gratis.

## Por dentro: generar frente a decidir

La diferencia clave con un LLM está en cómo se produce la respuesta. Un LLM genera de forma **autorregresiva**: cada palabra exige una pasada completa por el modelo (_forward pass_), y en cada pasada se elige la siguiente palabra, a menudo con algo de azar. Un modelo de decisión hace **una sola pasada** y de ella salen todas las probabilidades a la vez.

![Generar palabra a palabra frente a decidir de una vez](/images/blog/decision-models-generate-vs-decide.svg)

De ahí vienen tres de sus ventajas: velocidad, coste bajo y determinismo. Y una cuarta: como el modelo solo puede elegir entre las opciones que le diste, **la salida no puede tener errores de formato**.

### La arquitectura común

Cada proyecto se ha construido de forma distinta, pero todos comparten el mismo esquema:

![La arquitectura común de los modelos de decisión](/images/blog/decision-models-architecture.svg)

1. **Tokens.** El estado y cada pregunta se trocean en tokens, igual que en cualquier LLM.
2. **_Backbone_ preentrenado.** Un modelo de lenguaje normal, el que "sabe leer". Suele estar congelado o casi.
3. **Estado latente.** El resultado de leer el estado: vectores que resumen lo que el modelo ha entendido. Se calcula **una sola vez**.
4. **Pregunta y opciones.** Cada pregunta, con sus opciones, se procesa leyendo ese estado latente.
5. **_Head_ de decisión.** La única pieza realmente nueva: un componente pequeño que, en lugar de predecir la siguiente palabra, **compara la pregunta con cada opción** y le da una puntuación.
6. **Softmax.** Las puntuaciones se convierten en probabilidades que suman 1, y el servidor devuelve el JSON.

### Un estado, muchas preguntas

Como el estado se lee una vez, añadir preguntas cuesta muy poco. Además, cada pregunta ve el estado y a sí misma, pero **no ve las demás**: preguntar "¿es urgente?" no influye en la respuesta a "¿qué equipo?". Kev mide que hacer las preguntas juntas o por separado da probabilidades prácticamente idénticas (diferencias de millonésimas en fp32).

Esto habilita un patrón que TypeSafe llama _speculative fan-out_: preguntar "de más" por si acaso y que tu código use solo lo que necesite. Según su documentación, en un ejemplo con 13 preguntas sobre un mismo texto, agruparlas en una llamada fue **12,2 veces más barato y 10 veces más rápido** que hacer una llamada por pregunta.

### Tres formas de construirlo

Los modelos open source muestran tres maneras distintas de implementar la misma idea:

| Modelo           | Cómo está hecho                                                                                                                                        | Idea intuitiva                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Kev**          | Un LLM Qwen (de 0,8B a 27B) congelado, con un pequeño adaptador LoRA y un _pointer head_ que compara el vector de la pregunta con el de cada opción    | "Señala" la opción correcta                        |
| **Laya**         | Un encoder tipo BERT (~0,3–0,4B) que lee estado y preguntas a la vez, en ambas direcciones, con un _head_ por tipo de pregunta. ~33 ms por pregunta    | "Lee todo de una vez y rellena el formulario"      |
| **CLM**          | Un Qwen3-8B congelado con dos _projection heads_ que llevan estado y opciones a un mismo espacio de _embeddings_. Gana la opción más cercana al estado | "Busca la acción que más se parece a la situación" |
| **Jev / OpenAI** | No publicado. **Suponemos** algo parecido: un _backbone_ grande, con _post-training_ para decidir y calibrado                                          | Caja negra                                         |

Un detalle práctico de CLM: como estado y opciones se codifican por separado, los _embeddings_ de las opciones se pueden precalcular, lo que le permite elegir entre muchísimos candidatos (su ficha habla de unos 1.000) muy rápido.

El denominador común es claro: **un modelo de lenguaje preentrenado hace de lector y un _head_ pequeño puntúa las opciones** en lugar de generar texto.

## Cómo se entrenan

Ningún modelo de decisión se entrena desde cero. Todos siguen, con variaciones, la misma receta en tres pasos:

1. **Aprender a leer.** Se parte de un modelo de lenguaje ya preentrenado con enormes cantidades de texto, que ya entiende el idioma y sabe cosas del mundo. Kev y CLM usan Qwen; Laya, ModernBERT y mmBERT; OpenAI dice usar GPT-6 Luna, y TypeSafe no lo publica.
2. **Aprender a decidir.** Se le enseñan ejemplos de _(estado, pregunta, respuesta correcta)_ procedentes de datasets públicos y datos sintéticos. Las escalas varían muchísimo: unos 12.600 ejemplos en Kev frente a decenas de millones en CLM. De Jev se dice que sus datos son 100 % sintéticos, según una entrevista a su creador.
3. **Aprender a ser honesto.** Se ajusta para que sus probabilidades digan la verdad: si dice 80 %, que acierte el 80 % de las veces. Este paso es el que más los diferencia.

### RLHF, RLVR y RLCD

Todos los modelos modernos pasan por una fase de _post-training_ con aprendizaje por refuerzo (RL). Lo que cambia es **qué se premia**:

|                   | RLHF                                                            | RLVR                                           | RLCD                                                         |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Se premia...      | que la respuesta le guste a una persona                         | que la respuesta sea verificablemente correcta | que la probabilidad declarada coincida con la realidad       |
| Produce           | Chatbots (ChatGPT)                                              | Modelos de razonamiento                        | Modelos de decisión                                          |
| Efecto secundario | Sicofancia y **exceso de confianza**: sonar seguro puntúa mejor | Lentos y caros: razonan antes de responder     | No generan texto: solo deciden                               |
| Analogía          | El alumno que dice lo que el profesor quiere oír                | El alumno que resuelve el problema paso a paso | El hombre del tiempo cuyos "70 %" llueven 7 de cada 10 veces |

El argumento de TypeSafe es que RLHF enseña a sonar convincente, porque las respuestas seguras gustan más a quien evalúa. Y algo puede ser convincente sin ser lo bastante fiable como para automatizarlo sin supervisión. RLCD (_Reinforcement Learning for Calibrated Decisions_) cambia el objetivo: premia decir la probabilidad correcta, no sonar seguro.

Un matiz importante: el nombre lo puso TypeSafe y su receta exacta **no es pública**. No hay paper ni función de recompensa publicada. Laya es la única implementación open source que dice usarlo.

### La apuesta honesta

¿Cómo se premia "decir la probabilidad correcta"? Con un truco matemático elegante: las **reglas de puntuación propias** (_proper scoring rules_).

Imagina que eres el hombre del tiempo y sabes que mañana llueve con una probabilidad real del 70 %. Te penalizan con el **_Brier score_**: si llueve, pagas (1 − p)²; si no llueve, pagas p², donde p es la probabilidad que anuncias. ¿Qué te conviene decir?

| Lo que anuncias  | Penalización esperada              |
| ---------------- | ---------------------------------- |
| 100 % (exagerar) | 0,7 × 0² + 0,3 × 1² = 0,30         |
| 50 % (cubrirte)  | 0,7 × 0,5² + 0,3 × 0,5² = 0,25     |
| 70 % (la verdad) | 0,7 × 0,3² + 0,3 × 0,7² = **0,21** |

![La apuesta honesta: la penalización esperada solo es mínima diciendo la verdad](/images/blog/decision-models-honest-bet.svg)

La curva tiene un único mínimo, y cae **justo en la verdad**. Eso es lo que significa que una regla sea _estrictamente propia_: la única forma de obtener la mejor puntuación esperada es decir la probabilidad que de verdad crees. Si entrenas a un modelo con una recompensa así, **mentir nunca le compensa**.

Con un matiz: la regla garantiza que el óptimo es la honestidad, pero que el modelo llegue a ese óptimo depende de los datos y del entrenamiento. Con datos finitos o cambios de distribución, la calibración puede quedar imperfecta.

### El termostato de la confianza

El segundo mecanismo es mucho más sencillo: el **temperature scaling**. El _head_ puntúa las opciones y una softmax convierte esas puntuaciones en probabilidades. Si antes de la softmax divides las puntuaciones entre una temperatura T > 1, las probabilidades se suavizan y el modelo deja de estar "demasiado seguro".

Lo bonito es que **el orden no cambia**: la temperatura nunca altera qué opción gana, solo cuánta seguridad expresa. Se ajusta con datos de validación (_held-out_) que el modelo no vio al entrenar. Cada checkpoint de Kev trae la suya, entre 1,32 y 2,41.

## Qué significa estar calibrado

Un modelo está calibrado si, entre muchas de sus respuestas, las que dice al 80 % aciertan alrededor del 80 % de las veces, las que dice al 20 % aciertan alrededor del 20 %, y así sucesivamente.

Se mide agrupando miles de respuestas según la confianza declarada y mirando cuántas acertaron en cada grupo. Un modelo calibrado cae sobre la diagonal del **diagrama de fiabilidad** (_reliability diagram_); uno sobreconfiado queda por debajo. La distancia media a esa diagonal es el **ECE** (_Expected Calibration Error_). Algunos datos publicados:

- **Kev-9B:** con la temperatura, el ECE baja de 0,103 a 0,041, y los errores "muy seguros" (probabilidad ≥ 0,9) pasan del 8,2 % al 2,4 % (Jev: 3,7 %).
- **Laya:** tras ajustar las temperaturas, el ECE medio baja de 0,466 a 0,081.

Ojo: **la calibración es una propiedad de grupos de respuestas**. No garantiza que una respuesta concreta al 0,9 sea correcta; garantiza que, de cada diez respuestas al 0,9, falla más o menos una. Y calibración no es lo mismo que precisión: un modelo que acierta el 90 % pero siempre dice 99 % es inútil para fijar umbrales; uno que dice 70 % cuando acierta el 70 % sí sirve.

### De probabilidades a confianza

Además de las probabilidades, las respuestas `choice` y `score` traen un campo `confidence` que resume la distribución en un solo número. Para `choice`, la fórmula de TypeSafe es:

```text
confianza = (p_max − 1/n) / (1 − 1/n)
```

Vale 1 si toda la probabilidad está en una opción y 0 si está repartida por igual entre las n opciones. Con (0,6; 0,3; 0,1), por ejemplo, sale 0,4. Para `noul` no hace falta: la probabilidad ya lo dice todo, aunque se puede usar |2p − 1| para tenerla en la misma escala.

Esto es lo que hace útil la calibración: **el modelo puede decir "no estoy seguro"**, y el software puede reaccionar.

## Ventajas frente a un LLM

¿Por qué no usar un LLM y pedirle JSON? Porque no es lo mismo:

|                  | LLM con JSON mode                                  | Modelo de decisión                                                        |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Salida           | Texto con forma de JSON: hay que validarlo         | Un valor del conjunto que tú defines: imposible salirse                   |
| Probabilidades   | No expuestas o poco fiables; tiende a sonar seguro | Calibradas, en cada respuesta y para cada opción                          |
| Determinismo     | Muestreo: la misma pregunta puede variar           | Sin muestreo: misma entrada, mismas probabilidades                        |
| Velocidad        | De uno a varios segundos                           | Decenas a cientos de ms (Jev: 70–500 ms; OpenAI: ~150 ms frente a ~1,6 s) |
| Coste            | Pagas la entrada y cada token generado             | Casi todo es entrada (en Jev, la salida es gratis)                        |
| Varias preguntas | Una tras otra, o mezcladas en un mismo prompt      | En paralelo y aisladas, sobre una sola lectura del estado                 |

Sobre el determinismo hay dos salvedades. Servir el modelo en bf16 en lugar de fp32 mueve un poco las probabilidades (según Kev, hasta unos 0,03, y la opción ganadora cambia en una de cada 300 preguntas). Y un alias como `jev-latest` puede pasar a apuntar a otra versión sin aviso, así que en producción conviene fijar la versión.

¿Y alucinan? No pueden inventar una respuesta fuera de las opciones. Sí pueden **equivocarse** eligiendo la opción incorrecta, y para eso está la confianza.

## Ventajas frente a un clasificador clásico

Si un LLM es generalista, lento y caro, un clasificador clásico es lo contrario: especializado, rápido y barato. Los modelos de decisión se sitúan en medio y toman lo mejor de cada lado:

- **Un modelo para muchas tareas.** Con un clasificador clásico hay que recoger datos, etiquetar, entrenar y desplegar un modelo por tarea. Aquí, la pregunta y las opciones viajan en la petición.
- **¿Una categoría nueva?** Con un clasificador, a reentrenar. Aquí, se añade una línea al JSON.
- **Generalizan a tareas que no han visto** (_zero-shot_), porque heredan la comprensión del lenguaje de un modelo grande.

El matiz honesto es que los modelos open source son, por ahora, menos potentes que Jev en general. Laya, por ejemplo, rinde cerca del azar en tareas nuevas hasta que se ajusta con datos propios. Pero precisamente **se pueden ajustar (_fine-tuning_)**, y compensa: con 5.219 reclamaciones reales etiquetadas, Kev-4B pasó de un 0,804 a un 0,904 de acierto, y un fine-tuning de ejemplo tarda unos 15 minutos en una H100.

Jev, en cambio, no admite fine-tuning: los mismos pesos sirven a todos los clientes y se adapta a cada caso solo a través del estado, las instrucciones y los criterios de cada pregunta. Es el intercambio clásico entre cerrado (más potente, sin tocar) y open source (menos potente, pero adaptable y desplegable en tu propia infraestructura).

## En la práctica

### La confianza decide el camino

El patrón estrella es el **_routing_ por confianza**. La respuesta dice _qué_ hacer; la confianza, _si actuar_:

| Confianza | Qué hace el sistema                                                |
| --------- | ------------------------------------------------------------------ |
| Alta      | Actuar automáticamente                                             |
| Media     | Pedir confirmación, marcar para revisión o recabar más información |
| Baja      | No actuar: pasar a una persona o a un LLM de razonamiento          |

Los umbrales dependen del riesgo de cada acción, no son un número global: mostrar un saldo equivocado se arregla, aprobar una transferencia equivocada no tanto. **Ese criterio lo pone tu código, no el modelo.** Lo sensato es empezar con umbrales conservadores y ajustarlos midiendo con tus propios datos.

Para hacerse una idea de cuánto se puede automatizar: según el README de Kev, tolerando un 5 % de error, Jev resuelve automáticamente un 70 % de las decisiones en fuentes que no vio al entrenar, y Kev-4B, 9B y 27B entre un 52 % y un 69 %.

### Un ejemplo vivo: el dinosaurio de Chrome

Para la charla monté una demo en la que un modelo de decisión juega al dinosaurio de Chrome. A cada momento se describe la escena en texto y se le hace una pregunta `choice` con tres opciones: `jump`, `duck` y `nothing`. Ninguno de los modelos está entrenado para este juego.

![Kev-9B jugando al dinosaurio de Chrome: la escena, el estado en texto, el historial de decisiones y las probabilidades de cada acción](/talks/decisions-models-101/assets/img/juego-kev9b.png)

Kev-9B salta con una probabilidad de 0,98 (confianza 0,97). Kev-0.8B, un modelo diez veces más pequeño, duda: 0,55 frente a 0,33.

![Kev-0.8B dudando: probabilidades casi repartidas entre saltar y no hacer nada](/talks/decisions-models-101/assets/img/juego-kev0_8b.png)

Su confianza de 0,33 es su forma de decir **"no lo tengo claro"**, y eso es información útil: un sistema real podría, en ese caso, no actuar o delegar en otro componente. Seguro no significa infalible, pero un modelo que sabe cuándo duda es mucho más fácil de integrar que uno que siempre suena convencido.

### Cuándo usarlos y cuándo no

**Encajan bien en:**

- Clasificar y enrutar tickets, correos y casos.
- Triaje y priorización.
- Guardrails a la entrada y a la salida de un LLM.
- Elegir el siguiente paso o la herramienta de un agente.
- Comprobar si un documento dice algo.

**No son para:**

- Redactar, resumir o explicar.
- Razonar en muchos pasos.
- Preguntas abiertas o mal acotadas.
- Decisiones críticas sin supervisión humana.

**Con cuidado:**

- **El orden de las opciones puede influir.** Kev, Laya y los análisis de Jev lo documentan; la mitigación habitual es rotar el orden y promediar.
- **Rinden mejor en inglés.**
- **Contextos muy largos o muchas opciones.** Laya, por ejemplo, pierde precisión con más de unas 20 opciones.
- **Una pregunta y su negación pueden devolver ambas 0,7.** No hay coherencia garantizada entre preguntas distintas.
- **Mide con tus datos** antes de fijar umbrales.

Una pista para decidir: si una persona experta lo decidiría **en un segundo** con la información delante, es buen candidato. Si tendría que pensarlo un rato, divide la pregunta o usa un LLM.

### Cómo se combinan con el resto del sistema

Cuatro patrones habituales:

1. **_Speculative fan-out_.** Hacer de golpe todas las preguntas que _podrían_ hacer falta. Cuesta casi lo mismo que hacer una.
2. **_Routing_ por confianza.** Automatizar, confirmar o escalar según la confianza.
3. **Puntuación compuesta.** Partir un juicio complejo en preguntas atómicas y combinarlas en código, con los pesos que tú controlas.
4. **Cascada Sistema 1 → Sistema 2.** El modelo de decisión resuelve lo fácil y rápido; lo dudoso pasa a un LLM razonador o a una persona.

La regla de oro es que **el código manda**. El modelo aporta sentido común en puntos concretos, pero el flujo, las reglas y los permisos siguen en el software. Nunca debería ser tu capa de autorización.

## Quién es quién

| Modelo        | Quién                | Acceso                   | Por dentro                                      | Calibración          | ¿Ajustable?                 |
| ------------- | -------------------- | ------------------------ | ----------------------------------------------- | -------------------- | --------------------------- |
| Jev           | TypeSafe             | API de pago              | No publicado                                    | RLCD                 | No (estado e instrucciones) |
| Kev           | `jaredpalmer/kev`    | Open source · Apache-2.0 | Qwen congelado + LoRA + pointer head · 0,8B–27B | Temperatura ajustada | Sí                          |
| Laya          | `NandhaKishorM/laya` | Open source · Apache-2.0 | Encoder ModernBERT o mmBERT · ~0,3–0,4B         | RLCD + temperatura   | Sí                          |
| CLM           | `Contrastive-LM`     | Open source · Apache-2.0 | Qwen3-8B congelado + 2 _projection heads_       | Contrastiva          | Sí (_heads_)                |
| Decisions API | OpenAI               | API · preview limitada   | Versión especializada de GPT-6 Luna             | No publicado         | No anunciado                |

Una advertencia: las cifras de rendimiento de cada proyecto no son comparables entre sí, porque cada uno se evalúa con sus propios benchmarks. Y todas son las publicadas por sus autores; nadie las ha reproducido de forma independiente.

## Conclusión

Si me tuviera que quedar con tres ideas:

1. **No escriben, deciden.** Leen como un LLM, pero responden eligiendo entre opciones que tú defines, en una sola pasada.
2. **Dicen cuánto saben.** Sus probabilidades están entrenadas para ser honestas, y eso permite automatizar con umbrales: actuar, confirmar o escalar.
3. **Están entre el clasificador y el LLM.** Generalizan sin entrenar para cada caso y, si son open source, se pueden ajustar al tuyo.

Los modelos de decisión no sustituyen a los LLMs: los complementan. El modelo de decisión toma las decisiones cerradas y frecuentes, y el LLM se reserva para redactar, razonar o resolver lo dudoso. Después de unos años intentando que los LLMs hagan absolutamente de todo, resulta refrescante ver una categoría de modelos que hace una sola cosa, la hace rápido y, sobre todo, te dice cuándo no está segura.

## Para seguir leyendo

- [TypeSafe · Introducing System One models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe · System One](https://docs.typesafe.ai/concepts/system-one.md), [AI primer (RLHF, RLVR, RLCD)](https://docs.typesafe.ai/introduction/machine-learning-primer.md) y [Confidence](https://docs.typesafe.ai/confidence.md)
- [Cloudflare Workers AI · Jev](https://developers.cloudflare.com/ai/models/typesafe/jev/) (ejemplos JSON)
- [RLCD explained: qué se sabe y qué no](https://systemonemodels.org/guides/rlcd-explained/)
- [jaredpalmer/kev](https://github.com/jaredpalmer/kev), [NandhaKishorM/laya](https://github.com/NandhaKishorM/laya) y [Contrastive-LM/CLM-v0.1-8B](https://huggingface.co/Contrastive-LM/CLM-v0.1-8B)
- [The Decoder · DevDay 2026 y la Decisions API](https://the-decoder.com/openai-expands-codex-and-its-api-at-devday-with-security-scans-a-decisions-api-and-ultrafast/)
- [Las diapositivas de la charla](/talks/decisions-models-101/)
