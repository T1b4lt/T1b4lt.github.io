---
idx: 8
title: "Todos los modelos miran el mismo mundo: la Hipótesis Platónica pasa de intuición a teorema"
author: "Guillermo Segovia"
pubDate: "3 de noviembre de 2026"
pubDateLogical: "2026-11-03"
tags: ["IA", "LLMs", "JEPA", "World models"]
---

Un modelo de texto de 109 millones de parámetros, que **nunca ha visto una imagen**, organiza el significado de forma más parecida a un modelo de visión que Qwen2.5-72B, un LLM unas 660 veces más grande. Y llega a ese nivel de alineación con **42 veces menos datos** que un modelo del mismo tamaño entrenado como un LLM.

Es el resultado principal de _Proving and Improving the Platonic Representation Hypothesis with JEPAs_, un _preprint_ publicado el 29 de octubre de 2026 por Randall Balestriero (Brown) y Yann LeCun (NYU), ambos afiliados también a AMI Labs. La prensa lo ha presentado como «el paper de LeCun», pero el primer autor es Balestriero. Detrás de las cifras hay una pregunta que la IA lleva haciéndose más de diez años: **¿están todos los modelos aprendiendo lo mismo?**

En este post resumo de dónde viene esa pregunta, qué demuestra el paper, qué no demuestra todavía y por qué importa para el debate entre escalar LLMs y construir _world models_. Es la versión escrita de la charla [Todos los modelos miran el mismo mundo](/talks/PRH-with-JEPA/).

## Un mapa del mundo dentro de cada modelo

Un modelo guarda lo que aprende como puntos en un espacio: cada palabra, imagen o frase recibe unas coordenadas (su _embedding_), y lo parecido acaba cerca. Nadie le dice que «perro» y «cachorro» se parecen; lo descubre a partir de los datos. El conjunto de todos esos puntos es su **representación**, su mapa del mundo.

La pregunta es si dos modelos distintos dibujan el mismo mapa. Las pistas se han ido acumulando:

| Año  | Trabajo                         | Qué mostró                                                                                                                                      |
| ---- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 2013 | Mikolov, Le y Sutskever         | Los espacios de palabras de dos idiomas, entrenados por separado, encajan con una transformación lineal: casi un 90 % de acierto en precision@5 |
| 2017 | Conneau et al. (MUSE)           | Ese encaje se puede encontrar **sin diccionario**, solo con la forma de las nubes de puntos                                                     |
| 2021 | CLIP (OpenAI)                   | Imagen y texto se alinean entrenándolos **juntos** con 400 millones de pares foto–pie de foto                                                   |
| 2024 | Huh et al., Hipótesis Platónica | Modelos de visión y lenguaje entrenados por separado se parecen más cuanto mejores son                                                          |
| 2026 | Gröger et al.; You et al.       | Críticas: al calibrar la métrica, coinciden los vecindarios locales, mucho menos la geometría global                                            |

El trabajo de Huh, Cheung, Wang e Isola (MIT) lo formuló como hipótesis: los modelos _"are converging to a shared statistical model of reality"_. El nombre viene de la caverna de Platón: imágenes y textos serían sombras distintas del mismo mundo, y los modelos, al mejorar, reconstruirían ese mundo común.

Pero era una observación, no una ley. El máximo de alineación que midieron rondaba 0,16 sobre 1, no había ninguna prueba de por qué ocurría y la única palanca conocida era escalar. Encajaba bien con la apuesta dominante de la industria desde las _scaling laws_ de 2020: más parámetros, más datos, y la comprensión del mundo llegaría sola.

## Dos formas de aprender: predecir el dato o su significado

Para entender el paper hay que conocer la alternativa que LeCun defiende desde 2022. Un LLM aprende a **predecir el siguiente _token_ exacto**: para acertar «playa» y no «arena», tiene que modelarlo todo, incluido el estilo y la redacción concreta del autor.

Una **JEPA** (_Joint-Embedding Predictive Architecture_) hace otra cosa. Recibe dos vistas de lo mismo, las pasa por un _encoder_ y predice la **representación** de una a partir de la otra, no los datos en bruto. Así puede ignorar lo impredecible. Necesita además un término «anti-colapso», porque la solución trivial sería mandarlo todo al mismo punto. LeCun lleva cuatro años construyendo sobre esta idea: I-JEPA (2023) para imágenes, V-JEPA 2 (2025) para vídeo y robótica, y LeJEPA (2025), firmado también por Balestriero, que le da una base teórica más limpia.

## La clave: qué le dices al modelo que es «lo mismo»

La aportación del paper es identificar la variable que decide lo que aprende una JEPA: los **positivos**, los pares de datos que le decimos que representan lo mismo.

- **Buenas vistas:** dos observaciones distintas de la misma escena. Dos fotos del mismo lugar, o dos pies de foto distintos de una imagen. Lo único que comparten es el mundo.
- **Malas vistas:** dos corrupciones de una misma observación, como enmascarar palabras de una frase o recortar la misma foto. Comparten la escena, pero **también** la redacción, el estilo o el encuadre. El paper llama a esto _nuisance_.

Una analogía: aprender a reconocer a una persona con fotos de días distintos, frente a hacerlo con recortes de una sola foto. En el segundo caso aprendes también la camiseta que llevaba ese día.

![Diagrama del paper: una escena con un cono y una esfera produce dos fotos y dos descripciones; dos JEPA entrenadas con buenas vistas llegan a la misma representación salvo una rotación](/talks/PRH-with-JEPA/assets/img/fig1-mundo-vistas.png)

Con esa distinción, los autores demuestran el **Teorema de la Representación Platónica**: dos JEPA entrenadas por separado, en cualquier modalidad, que usan buenas vistas llegan en su óptimo al mismo _embedding_ **salvo una rotación**. Es exactamente la rotación que Mikolov encontró entre idiomas en 2013, ahora demostrada y con condiciones. Un segundo teorema acota el error cuando las vistas no son perfectas: cuanto peores, más desalineación.

## Next-token prediction, una JEPA con malas vistas

El paper da un paso más, y es el que lo hace relevante fuera del mundo académico. Muestra que la pérdida con la que se entrena un LLM tiene literalmente la forma de una JEPA (Proposición 4): un término de predicción y uno anti-colapso. Sus dos vistas son un prefijo y su continuación dentro del **mismo documento**, así que comparten autor y estilo. Son malas vistas.

La consecuencia es que un LLM gasta parte de su capacidad en detalles de su modalidad que ninguna rotación puede alinear con una imagen. Los autores lo miden con la fracción de la representación que explica la escena:

![Fracción de la representación explicada por la escena: 0,804 con buenas vistas, 0,655 con malas vistas y 0,608 con next-token prediction](/images/blog/platonic-scene-fraction.svg)

Hay un matiz importante: la conexión entre _next-token prediction_ y el tercer teorema es heurística, y el propio paper lo presenta como _"a prediction to test rather than a corollary"_.

## La evidencia: 42 veces menos muestras

Los experimentos comparan un _encoder_ de texto de 109 millones de parámetros entrenado de tres formas sobre el mismo corpus. La métrica es la de Huh et al.: para cada pie de foto se miran sus 10 vecinos en el espacio de texto y los 10 de su imagen en el espacio de DINOv2, un modelo de visión, y se cuenta cuántos coinciden.

![Figura 1 del paper: alineación con DINOv2 frente a muestras de entrenamiento; la JEPA con buenas vistas alcanza con 21,6 millones de muestras lo que next-token consigue con 900 millones](/talks/PRH-with-JEPA/assets/img/fig1-42x.png)

Con buenas vistas, el modelo alcanza con 21,6 millones de muestras la alineación que _next-token prediction_ logra con 900 millones. Y con entrenamiento completo llega a 0,184, por encima de LLMs que han leído entre 15 y 18 billones de _tokens_, frente a los 116.000 millones del JEPA:

![Alineación con DINOv2: JEPA de 109M con buenas vistas 0,184; Qwen2.5-72B 0,154; Llama-3-70B 0,151; texto de CLIP 0,124; next-token de 109M 0,111; JEPA con malas vistas 0,088](/images/blog/platonic-alignment-comparison.svg)

Que baste una rotación tiene usos prácticos. Los autores construyen un generador de pies de foto que une un modelo de visión congelado con un decodificador de texto, donde lo único ajustado con pares imagen–texto es una matriz de rotación: alcanza un CIDEr de 0,838 en COCO. Y sin ningún par, buscando la rotación solo con la geometría de las nubes, consiguen un 64,4 % de acierto _top-5_ en ImageNet-100, frente al 56 % mejor reportado con modelos de lenguaje de hasta 8.000 millones de parámetros.

## La letra pequeña

Es lo que separa un resultado sólido de un titular, y el propio paper la detalla:

- **Un mundo idealizado.** El teorema supone un mundo finito, observaciones sin pérdida de información y modelos en su óptimo. Las modalidades reales pierden información.
- **Buenas vistas prestadas.** En texto web, las buenas vistas son pies de foto generados por LLaVA, un modelo que ya lleva CLIP dentro. Algo de información imagen–texto se cuela de forma indirecta: sin ese generador, la alineación cae de 0,107 a 0,060.
- **Alinear no es razonar.** El JEPA gana en alineación con visión, no en conversación, código ni razonamiento, que el paper no mide. Y los márgenes absolutos son modestos.
- **Sin replicación.** Es un _preprint_ sin revisión por pares, firmado por los principales proponentes de JEPA. El código es público y trae una guía para reproducir cada número, pero a 3 de noviembre nadie lo ha hecho todavía.

## Más allá de escalar: la apuesta por los world models

La frase del _abstract_ que resume la tesis es _"Positive views, and not scale alone, are thus the lever to build platonic representations"_. Conviene leerla entera: no dice que la escala no importe, sino que no es la única palanca ni la más eficiente para alinearse con el mundo.

El paper encaja con la agenda de LeCun, que defiende que _"real intelligence does not start in language. It starts in the world"_. Con esa tesis fundó AMI Labs, con sede en París, que según la prensa cerró en marzo de 2026 una ronda _seed_ de 1.030 millones de dólares, una cifra que la empresa no confirma en su web. Si _next-token prediction_ es una JEPA con malas vistas, aprender de muchas observaciones del mismo mundo (vídeo, audio, acciones) sería la ruta más eficiente. Es la lectura de los autores, no un hecho establecido.

No es la única apuesta por los _world models_:

| Proyecto | Quién            | Enfoque                                                                                               |
| -------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| JEPA     | AMI Labs (LeCun) | No generativo: predice representaciones. V-JEPA 2 ya planifica movimientos de un brazo robótico       |
| Genie 4  | Google DeepMind  | Generativo: simula mundos interactivos en tiempo real con audio. Preview de investigación, 27-10-2026 |
| Marble   | World Labs       | Generativo: crea mundos 3D exportables a partir de texto, imagen o vídeo. Noviembre de 2025           |

El sector coincide en el diagnóstico, que el mundo físico importa, pero no en el método.

Hay una lectura económica y geopolítica que me parece relevante. La carrera por escalar favorece a quien tiene más capital, más centros de datos y más energía, una carrera que hoy lideran unas pocas empresas estadounidenses y chinas. Si una parte de la palanca pasa a ser el **diseño de los datos** en lugar del volumen de cómputo, el terreno de juego se abre a laboratorios más pequeños y a regiones con menos músculo financiero, como Europa. No es casual que una de las apuestas más visibles por esta vía tenga sede en París. Eso sí, todavía es una hipótesis que depende de que los resultados se repliquen y escalen más allá de los _benchmarks_ de alineación.

## Conclusión

Si me tuviera que quedar con tres ideas:

1. **De intuición a teorema.** Que modelos distintos converjan al mismo mapa del mundo ya está demostrado para las JEPA, bajo supuestos idealizados.
2. **La palanca son las vistas, no solo la escala.** _Next-token prediction_ aprende de malas vistas y por eso necesita muchísimos más datos para alinearse con la visión.
3. **Un argumento para los _world models_.** Respalda la apuesta de aprender de muchas observaciones del mismo mundo. Falta que otros lo repliquen.

Mi lectura es que el paper no anuncia el final de los LLMs, que siguen siendo excelentes en lenguaje, código y razonamiento. Lo que sí cambia es la pregunta. Durante años, la conversación sobre cómo mejorar los modelos ha girado en torno a cuántos parámetros, cuántos _tokens_ y cuántos gigavatios. Este trabajo propone otra más barata y, en mi opinión, más interesante: **qué le decimos al modelo que es lo mismo**.

## Para seguir leyendo

- [Las diapositivas de la charla](/talks/PRH-with-JEPA/)
- [Demo «Captions Without Pairs» en Hugging Face](https://huggingface.co/spaces/galilai-group/prh_demo)
- [Código del paper: galilai-group/prh-proof](https://github.com/galilai-group/prh-proof)
- [KV Cache: la memoria oculta que acelera los LLMs](/es/blog/kv-cache-en-llms), para entender mejor cómo funciona un LLM por dentro

## Referencias

- [arXiv · Balestriero y LeCun, Proving and Improving the Platonic Representation Hypothesis with JEPAs (29-oct-2026)](https://arxiv.org/abs/2610.39302)
- [GitHub · galilai-group/prh-proof](https://github.com/galilai-group/prh-proof)
- [Hugging Face · Captions Without Pairs (demo)](https://huggingface.co/spaces/galilai-group/prh_demo)
- [arXiv · Mikolov, Le y Sutskever, Exploiting Similarities among Languages for Machine Translation (2013)](https://arxiv.org/abs/1309.4168)
- [arXiv · Conneau et al., Word Translation Without Parallel Data (2017)](https://arxiv.org/abs/1710.04087)
- [arXiv · Radford et al., Learning Transferable Visual Models From Natural Language Supervision (CLIP, 2021)](https://arxiv.org/abs/2103.00020)
- [arXiv · Huh, Cheung, Wang e Isola, The Platonic Representation Hypothesis (2024)](https://arxiv.org/abs/2405.07987)
- [arXiv · Gröger, Wen y Brbić, An Aristotelian View (2026)](https://arxiv.org/abs/2602.14486)
- [arXiv · You et al. (2026)](https://arxiv.org/abs/2609.27252)
- [arXiv · Kaplan et al., Scaling Laws for Neural Language Models (2020)](https://arxiv.org/abs/2001.08361)
- [arXiv · DINOv2 (2023)](https://arxiv.org/abs/2304.07193)
- [OpenReview · LeCun, A Path Towards Autonomous Machine Intelligence (2022)](https://openreview.net/forum?id=BZ5a1r-kVsf)
- [arXiv · I-JEPA (2023)](https://arxiv.org/abs/2301.08243)
- [arXiv · V-JEPA 2 (2025)](https://arxiv.org/abs/2506.09985)
- [arXiv · LeJEPA (2025)](https://arxiv.org/abs/2511.08544)
- [arXiv · Schnaus, Araslanov y Cremers, It's a (Blind) Match! (CVPR 2025)](https://arxiv.org/abs/2503.24129)
- [AMI Labs · Web oficial](https://amilabs.xyz)
- [Tech.eu · Yann LeCun's Paris-based AI world model startup raises more than $1bn (10-mar-2026)](https://tech.eu/2026/03/10/yann-lecun-s-paris-based-ai-world-model-startup-raises-more-than-1bn/)
- [Google DeepMind · Genie 4: a new generation of world simulation (27-oct-2026)](https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/)
- [World Labs · Marble](https://www.worldlabs.ai/blog/marble-world-model)
- [AICoder · LeCun and Balestriero JEPA Platonic Representation Theorem (29-oct-2026)](https://aicoder.com/news/news-20261029-lecun-balestriero-jepa-platonic-representation-theorem-109m-text-jepa-beats-72b-llms-alignment)
- [Charla · Todos los modelos miran el mismo mundo](/talks/PRH-with-JEPA/)
