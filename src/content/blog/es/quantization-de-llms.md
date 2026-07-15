---
idx: 4
title: "Quantization de LLMs: Descifrando la Sopa de Letras de los Modelos"
author: "Guillermo"
pubDate: "7 de julio de 2026"
pubDateLogical: "2026-07-07"
tags: ["IA", "LLMs", "Quantization", "Inferencia"]
---

Entras en Ollama o en Hugging Face buscando un modelo para ejecutar en tu ordenador y te encuentras con esto:

```
Llama-3.1-8B-Instruct-Q4_K_M.gguf
Mistral-7B-Instruct-v0.3.Q5_K_S.gguf
Qwen2.5-14B-Instruct-IQ2_XS.gguf
```

¿`Q4_K_M`? ¿`IQ2_XS`? ¿Esto es un modelo de lenguaje o una partida de Scrabble?

Toda esa sopa de letras existe por una única razón: la **quantization** (cuantización), la técnica que permite que un modelo que necesitaría una GPU de servidor de 30.000 euros funcione en tu portátil. En este post vamos a ver qué es, cómo funciona por dentro, y sobre todo, cómo leer esos nombres para elegir el modelo adecuado sin morir en el intento.

## Un LLM es (básicamente) una lista gigante de números

Cuando decimos que Llama tiene **7B de parámetros**, hablamos de 7.000 millones de números: los pesos de la red neuronal. Cada peso es un número decimal que, por defecto, se almacena en formato **float32 (FP32)**: 32 bits, es decir, 4 bytes.

Hagamos la cuenta:

```
7.000.000.000 parámetros x 4 bytes = 28 GB
```

Solo cargar el modelo en memoria ya requiere **28 GB**. ¿Y un modelo de 70B? **280 GB**. Olvídate de ejecutarlo en tu ordenador, y de hecho olvídate de ejecutarlo en una sola GPU profesional.

Pero, ¿y si usáramos menos bytes por parámetro? Si cada peso ocupa 1 byte (INT8) en vez de 4, el modelo de 7B pasa a ocupar 7 GB. Si bajamos a 4 bits (INT4), 3.5 GB. Eso ya cabe en un portátil.

![Memoria necesaria para cargar un modelo de 7B según la precisión](/images/blog/quantization-precision-memory.svg)

Ese es exactamente el truco: la quantization es el proceso de **convertir números de alta precisión a formatos de baja precisión** para reducir los requisitos de memoria y cómputo. Se pierde algo de exactitud por el camino, sí, pero la práctica ha demostrado que la pérdida es sorprendentemente pequeña. Luego veremos cuánto.

## Bits, floats y enteros: el catálogo de precisiones

Antes de cuantizar nada, conviene entender qué significa cada formato numérico. Un número en coma flotante reparte sus bits en tres partes:

- **Signo:** 1 bit. Positivo o negativo.
- **Exponente:** controla el **rango**, es decir, cómo de grandes o pequeños pueden ser los números.
- **Mantisa:** controla la **precisión**, es decir, cuántos decimales podemos distinguir.

![Cómo reparte sus bits cada formato numérico](/images/blog/quantization-bit-layout.svg)

Los formatos que te vas a encontrar:

- **FP32:** el formato clásico de entrenamiento. Máximo rango y precisión, máximo coste.
- **FP16:** la mitad de bits. Mantiene bastante precisión pero recorta mucho el exponente, así que los valores grandes pueden desbordarse (overflow).
- **BF16 (bfloat16):** el favorito del deep learning. Mismo número de bits que FP16, pero repartidos de otra forma: conserva los 8 bits de exponente de FP32 (mismo rango, adiós overflows) a cambio de sacrificar precisión. Para redes neuronales, ese intercambio compensa.
- **INT8 / INT4:** aquí ya no hay exponente ni decimales. Son enteros de toda la vida: INT8 puede representar 256 valores (de -128 a 127) e INT4 solo **16 valores**. Convertir pesos float a estos formatos es el corazón de la quantization.

## Cómo se cuantiza un peso: scale y zero-point

Vamos a lo concreto. Los pesos de una red neuronal suelen moverse en un rango pequeño, digamos entre -1 y 1: valores como `-0.91`, `0.78`, `-0.28`... ¿Cómo convertimos eso a enteros entre -128 y 127?

Con un cambio de escala, muy parecido al scaling clásico de machine learning. Primero calculamos el factor de escala:

```
scale = (Xmax - Xmin) / (Qmax - Qmin) = (1 - (-1)) / (127 - (-128)) = 0.0078
```

Y después mapeamos cada peso `x` a su versión cuantizada `q`:

```
q = round((x - zero_point) / scale)
```

El `zero_point` indica donde centramos el rango (en nuestro ejemplo, 0). Para el peso `-0.91`:

```
q = round(-0.91 / 0.0078) = -116
```

El float `-0.91` se convierte en el entero `-116`. Para usar el peso durante la inferencia se hace la operación inversa (**dequantization**):

```
x' = q * scale + zero_point = -116 * 0.0078 = -0.9048
```

Guardamos `-0.91` y recuperamos `-0.9048`. No es idéntico: esa diferencia es el **error de cuantización**. Es como comprimir y descomprimir un archivo con pérdida: recuperas algo muy parecido, pero no exactamente igual. La apuesta de la quantization es que la red neuronal es lo bastante robusta como para que millones de pequeños errores de este tipo apenas afecten a sus respuestas.

Dos variantes que verás mencionadas:

- **Simétrica (absmax):** el rango se centra en cero y se escala usando el valor absoluto máximo. Más simple y rápida.
- **Asimétrica (zero-point):** usa el mínimo y máximo reales, con un desplazamiento adicional. Aprovecha mejor los bits cuando la distribución no está centrada.

## El truco de NF4: no todos los bins son iguales

Con 4 bits solo tenemos 16 valores posibles. El enfoque ingenuo es dividir el rango en 16 intervalos (bins) del mismo tamaño y asignar cada peso al suyo. Pero aquí aparece un problema: si dibujas el histograma de los pesos de un LLM, obtienes una **distribución normal**, la clásica campana centrada en cero.

Con bins de igual anchura, la inmensa mayoría de los pesos (que viven cerca del cero) acaban amontonados en 3 o 4 valores centrales, mientras que los bins de los extremos se quedan casi vacíos. Estamos malgastando la mayoría de nuestros escasos 16 valores.

![Bins lineales vs bins de igual probabilidad (NF4)](/images/blog/quantization-linear-vs-nf4.svg)

La solución es de puro sentido común: en lugar de bins de igual **anchura**, usar bins de igual **probabilidad**. Se diseñan los 16 niveles de forma que cada uno capture el 6.25% de los pesos: bins estrechitos cerca del cero (donde hay muchos pesos y necesitamos resolución fina) y anchos en las colas (donde apenas hay nada).

Eso es exactamente **NF4 (NormalFloat 4-bit)**, el formato que usa la librería `bitsandbytes` y que está en el corazón de **QLoRA**, la técnica estándar para hacer fine-tuning de LLMs en GPUs modestas.

## Descifrando el nombre del modelo

Con la teoría en la mochila, ya podemos volver a la sopa de letras del principio:

![Anatomía del nombre de un modelo cuantizado](/images/blog/quantization-name-anatomy.svg)

La parte de quantization en los ficheros GGUF sigue el patrón `Q{bits}_{metodo}_{mezcla}`:

- **Q4:** número medio de **bits por peso**. Q8 es casi sin pérdida, Q4 es el equilibrio típico, Q2 es compresión extrema.
- **K:** indica **k-quants**, el esquema moderno de llama.cpp. En lugar de una única escala global, los pesos se agrupan en bloques y super-bloques, cada uno con su propia escala. Así el error de cuantización se adapta localmente a cada zona del modelo.
- **S / M / L (small/medium/large):** la **mezcla de precisión**. No todas las capas son igual de sensibles: las variantes M y L guardan las capas más críticas (como atención y embeddings) con más bits, a cambio de un fichero algo mayor.

Con eso ya puedes leer casi cualquier nombre:

- **Q8_0:** 8 bits, esquema legacy (el `_0` indica solo escala, sin offset). Prácticamente indistinguible del original.
- **Q6_K:** 6 bits con k-quants. Muy conservador.
- **Q4_K_M:** 4 bits, k-quants, mezcla media. **El estándar de facto**, y el que Ollama descarga por defecto.
- **IQ2_XS:** la familia **IQ (i-quants)** usa técnicas más sofisticadas apoyadas en una **imatrix** (importance matrix): se pasa un dataset de calibración por el modelo para medir qué pesos importan más y protegerlos al cuantizar. Es lo que hace viable bajar de 3 bits sin que el modelo empiece a decir tonterías. Las siglas XXS/XS/S/M son, de nuevo, puntos en el eje tamaño-calidad.

## El zoo de formatos: GGUF, GPTQ, AWQ y bitsandbytes

GGUF no es la única familia. Según dónde y para qué quieras ejecutar el modelo, te encontrarás estos nombres:

| Formato          | Dónde brilla                           | La idea clave                                                                                     |
| ---------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **GGUF**         | Local: CPU, Apple Silicon, GPU parcial | Fichero único para llama.cpp/Ollama/LM Studio. Permite repartir capas entre CPU y GPU             |
| **GPTQ**         | Inferencia en GPU                      | Cuantiza capa a capa usando información de segundo orden y compensa el error en los pesos vecinos |
| **AWQ**          | Servidores GPU (vLLM)                  | Detecta el ~1% de pesos más importantes mirando las activaciones y los protege de la cuantización |
| **bitsandbytes** | Fine-tuning (QLoRA)                    | Cuantiza al vuelo al cargar el modelo (`load_in_4bit=True`). Cómodo, pero lento para servir       |

La regla rápida: para ejecutar modelos en tu máquina, **GGUF**; para servir modelos en GPU a muchos usuarios, **AWQ o GPTQ**; para hacer fine-tuning barato, **bitsandbytes + QLoRA**.

Un último apunte de vocabulario: todo lo anterior es **PTQ (Post-Training Quantization)**, cuantizar un modelo ya entrenado, que es lo habitual por ser barato. La alternativa es **QAT (Quantization-Aware Training)**: entrenar el modelo simulando la cuantización para que aprenda a convivir con ella. Da mejores resultados a bits muy bajos, pero requiere reentrenar, algo que solo está al alcance de quien entrenó el modelo (Google, por ejemplo, publica versiones QAT de Gemma).

## ¿Y cuánta calidad estoy perdiendo?

La pregunta del millón. La respuesta corta: **mucha menos de la que crees, hasta que de repente pierdes muchísima**.

![Calidad vs tamaño en las quantizations de llama.cpp](/images/blog/quantization-quality-size.svg)

Los datos de la gráfica (Llama-3.1-8B-Instruct evaluado sobre MMLU, GSM8K, HellaSwag y otros benchmarks) cuentan una historia muy clara:

- De **F16 a Q8_0** el modelo pasa de 15 GB a 8 GB y la diferencia de calidad es ruido estadístico.
- En **Q4_K_M** el fichero es **3.3 veces más pequeño** que el original y la puntuación media apenas baja 0.3 puntos. Por eso es el punto dulce.
- Por debajo de ~3.5 bits por peso (**Q3_K_S** y menos), la curva se despeña. Y no cae de forma uniforme: las tareas de razonamiento como las mates de GSM8K se desploman primero (9 puntos), mientras que tareas más simples apenas se inmutan. Un modelo sobre-cuantizado puede parecer normal chateando y fallar estrepitosamente calculando.

## Chuleta final

Si solo te llevas una tabla de este post, que sea esta:

| Si...                                       | Usa...                                       |
| ------------------------------------------- | --------------------------------------------- |
| Te sobra memoria y quieres máxima fidelidad | Q8_0 o Q6_K                                  |
| Quieres el equilibrio estándar              | **Q4_K_M**                                   |
| Vas justo de memoria                        | Q4_K_S o IQ4_XS                              |
| El modelo no cabe ni a la de tres           | IQ3/IQ2 con imatrix, y baja tus expectativas |
| Vas a hacer fine-tuning con poca GPU        | bitsandbytes NF4 (QLoRA)                     |
| Vas a servir un modelo en GPU en producción | AWQ o GPTQ                                   |

La quantization es probablemente la técnica con mejor relación esfuerzo-beneficio de todo el ecosistema LLM: cuatro veces menos memoria a cambio de una pérdida de calidad que en la mayoría de casos ni notarás. Y ahora, además, cuando veas `Q4_K_M` en un nombre de fichero ya no verás una jugada de Scrabble, sino exactamente lo que le han hecho a esos 8.000 millones de números para que quepan en tu portátil.

## Para profundizar

- [A Visual Guide to Quantization](https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-quantization) - explicación visual excelente de Maarten Grootendorst.
- [Which Quantization Should I Use?](https://arxiv.org/html/2601.14277v1) - la evaluación sistemática de la que salen los datos de la gráfica calidad-tamaño.
- [LLM Fine Tuning Crash Course](https://www.youtube.com/watch?v=IIvORO248Zs) - el tramo 13:00-29:00 explica la quantization y NF4 paso a paso con código.
