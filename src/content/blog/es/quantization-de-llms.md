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

Toda esa sopa de letras existe por una unica razon: la **quantization** (cuantizacion), la tecnica que permite que un modelo que necesitaria una GPU de servidor de 30.000 euros funcione en tu portatil. En este post vamos a ver que es, como funciona por dentro, y sobre todo, como leer esos nombres para elegir el modelo adecuado sin morir en el intento.

## Un LLM es (basicamente) una lista gigante de numeros

Cuando decimos que Llama tiene **7B de parametros**, hablamos de 7.000 millones de numeros: los pesos de la red neuronal. Cada peso es un numero decimal que, por defecto, se almacena en formato **float32 (FP32)**: 32 bits, es decir, 4 bytes.

Hagamos la cuenta:

```
7.000.000.000 parametros x 4 bytes = 28 GB
```

Solo cargar el modelo en memoria ya requiere **28 GB**. ¿Y un modelo de 70B? **280 GB**. Olvidate de ejecutarlo en tu ordenador, y de hecho olvidate de ejecutarlo en una sola GPU profesional.

Pero, ¿y si usaramos menos bytes por parametro? Si cada peso ocupa 1 byte (INT8) en vez de 4, el modelo de 7B pasa a ocupar 7 GB. Si bajamos a 4 bits (INT4), 3.5 GB. Eso ya cabe en un portatil.

![Memoria necesaria para cargar un modelo de 7B segun la precision](/images/blog/quantization-precision-memory.svg)

Ese es exactamente el truco: la quantization es el proceso de **convertir numeros de alta precision a formatos de baja precision** para reducir los requisitos de memoria y computo. Se pierde algo de exactitud por el camino, si, pero la practica ha demostrado que la perdida es sorprendentemente pequeña. Luego veremos cuanto.

## Bits, floats y enteros: el catalogo de precisiones

Antes de cuantizar nada, conviene entender que significa cada formato numerico. Un numero en coma flotante reparte sus bits en tres partes:

- **Signo:** 1 bit. Positivo o negativo.
- **Exponente:** controla el **rango**, es decir, como de grandes o pequeños pueden ser los numeros.
- **Mantisa:** controla la **precision**, es decir, cuantos decimales podemos distinguir.

![Como reparte sus bits cada formato numerico](/images/blog/quantization-bit-layout.svg)

Los formatos que te vas a encontrar:

- **FP32:** el formato clasico de entrenamiento. Maximo rango y precision, maximo coste.
- **FP16:** la mitad de bits. Mantiene bastante precision pero recorta mucho el exponente, asi que los valores grandes pueden desbordarse (overflow).
- **BF16 (bfloat16):** el favorito del deep learning. Mismo numero de bits que FP16, pero repartidos de otra forma: conserva los 8 bits de exponente de FP32 (mismo rango, adios overflows) a cambio de sacrificar precision. Para redes neuronales, ese intercambio compensa.
- **INT8 / INT4:** aqui ya no hay exponente ni decimales. Son enteros de toda la vida: INT8 puede representar 256 valores (de -128 a 127) e INT4 solo **16 valores**. Convertir pesos float a estos formatos es el corazon de la quantization.

## Como se cuantiza un peso: scale y zero-point

Vamos a lo concreto. Los pesos de una red neuronal suelen moverse en un rango pequeño, digamos entre -1 y 1: valores como `-0.91`, `0.78`, `-0.28`... ¿Como convertimos eso a enteros entre -128 y 127?

Con un cambio de escala, muy parecido al scaling clasico de machine learning. Primero calculamos el factor de escala:

```
scale = (Xmax - Xmin) / (Qmax - Qmin) = (1 - (-1)) / (127 - (-128)) = 0.0078
```

Y despues mapeamos cada peso `x` a su version cuantizada `q`:

```
q = round((x - zero_point) / scale)
```

El `zero_point` indica donde centramos el rango (en nuestro ejemplo, 0). Para el peso `-0.91`:

```
q = round(-0.91 / 0.0078) = -116
```

El float `-0.91` se convierte en el entero `-116`. Para usar el peso durante la inferencia se hace la operacion inversa (**dequantization**):

```
x' = q * scale + zero_point = -116 * 0.0078 = -0.9048
```

Guardamos `-0.91` y recuperamos `-0.9048`. No es identico: esa diferencia es el **error de cuantizacion**. Es como comprimir y descomprimir un archivo con perdida: recuperas algo muy parecido, pero no exactamente igual. La apuesta de la quantization es que la red neuronal es lo bastante robusta como para que millones de pequeños errores de este tipo apenas afecten a sus respuestas.

Dos variantes que veras mencionadas:

- **Simetrica (absmax):** el rango se centra en cero y se escala usando el valor absoluto maximo. Mas simple y rapida.
- **Asimetrica (zero-point):** usa el minimo y maximo reales, con un desplazamiento adicional. Aprovecha mejor los bits cuando la distribucion no esta centrada.

## El truco de NF4: no todos los bins son iguales

Con 4 bits solo tenemos 16 valores posibles. El enfoque ingenuo es dividir el rango en 16 intervalos (bins) del mismo tamaño y asignar cada peso al suyo. Pero aqui aparece un problema: si dibujas el histograma de los pesos de un LLM, obtienes una **distribucion normal**, la clasica campana centrada en cero.

Con bins de igual anchura, la inmensa mayoria de los pesos (que viven cerca del cero) acaban amontonados en 3 o 4 valores centrales, mientras que los bins de los extremos se quedan casi vacios. Estamos malgastando la mayoria de nuestros escasos 16 valores.

![Bins lineales vs bins de igual probabilidad (NF4)](/images/blog/quantization-linear-vs-nf4.svg)

La solucion es de puro sentido comun: en lugar de bins de igual **anchura**, usar bins de igual **probabilidad**. Se diseñan los 16 niveles de forma que cada uno capture el 6.25% de los pesos: bins estrechitos cerca del cero (donde hay muchos pesos y necesitamos resolucion fina) y anchos en las colas (donde apenas hay nada).

Eso es exactamente **NF4 (NormalFloat 4-bit)**, el formato que usa la libreria `bitsandbytes` y que esta en el corazon de **QLoRA**, la tecnica estandar para hacer fine-tuning de LLMs en GPUs modestas.

## Descifrando el nombre del modelo

Con la teoria en la mochila, ya podemos volver a la sopa de letras del principio:

![Anatomia del nombre de un modelo cuantizado](/images/blog/quantization-name-anatomy.svg)

La parte de quantization en los ficheros GGUF sigue el patron `Q{bits}_{metodo}_{mezcla}`:

- **Q4:** numero medio de **bits por peso**. Q8 es casi sin perdida, Q4 es el equilibrio tipico, Q2 es compresion extrema.
- **K:** indica **k-quants**, el esquema moderno de llama.cpp. En lugar de una unica escala global, los pesos se agrupan en bloques y super-bloques, cada uno con su propia escala. Asi el error de cuantizacion se adapta localmente a cada zona del modelo.
- **S / M / L (small/medium/large):** la **mezcla de precision**. No todas las capas son igual de sensibles: las variantes M y L guardan las capas mas criticas (como atencion y embeddings) con mas bits, a cambio de un fichero algo mayor.

Con eso ya puedes leer casi cualquier nombre:

- **Q8_0:** 8 bits, esquema legacy (el `_0` indica solo escala, sin offset). Practicamente indistinguible del original.
- **Q6_K:** 6 bits con k-quants. Muy conservador.
- **Q4_K_M:** 4 bits, k-quants, mezcla media. **El estandar de facto**, y el que Ollama descarga por defecto.
- **IQ2_XS:** la familia **IQ (i-quants)** usa tecnicas mas sofisticadas apoyadas en una **imatrix** (importance matrix): se pasa un dataset de calibracion por el modelo para medir que pesos importan mas y protegerlos al cuantizar. Es lo que hace viable bajar de 3 bits sin que el modelo empiece a decir tonterias. Las siglas XXS/XS/S/M son, de nuevo, puntos en el eje tamaño-calidad.

## El zoo de formatos: GGUF, GPTQ, AWQ y bitsandbytes

GGUF no es la unica familia. Segun donde y para que quieras ejecutar el modelo, te encontraras estos nombres:

| Formato          | Donde brilla                           | La idea clave                                                                                     |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **GGUF**         | Local: CPU, Apple Silicon, GPU parcial | Fichero unico para llama.cpp/Ollama/LM Studio. Permite repartir capas entre CPU y GPU             |
| **GPTQ**         | Inferencia en GPU                      | Cuantiza capa a capa usando informacion de segundo orden y compensa el error en los pesos vecinos |
| **AWQ**          | Servidores GPU (vLLM)                  | Detecta el ~1% de pesos mas importantes mirando las activaciones y los protege de la cuantizacion |
| **bitsandbytes** | Fine-tuning (QLoRA)                    | Cuantiza al vuelo al cargar el modelo (`load_in_4bit=True`). Comodo, pero lento para servir       |

La regla rapida: para ejecutar modelos en tu maquina, **GGUF**; para servir modelos en GPU a muchos usuarios, **AWQ o GPTQ**; para hacer fine-tuning barato, **bitsandbytes + QLoRA**.

Un ultimo apunte de vocabulario: todo lo anterior es **PTQ (Post-Training Quantization)**, cuantizar un modelo ya entrenado, que es lo habitual por ser barato. La alternativa es **QAT (Quantization-Aware Training)**: entrenar el modelo simulando la cuantizacion para que aprenda a convivir con ella. Da mejores resultados a bits muy bajos, pero requiere reentrenar, algo que solo esta al alcance de quien entreno el modelo (Google, por ejemplo, publica versiones QAT de Gemma).

## ¿Y cuanta calidad estoy perdiendo?

La pregunta del millon. La respuesta corta: **mucha menos de la que crees, hasta que de repente pierdes muchisima**.

![Calidad vs tamaño en las quantizations de llama.cpp](/images/blog/quantization-quality-size.svg)

Los datos de la grafica (Llama-3.1-8B-Instruct evaluado sobre MMLU, GSM8K, HellaSwag y otros benchmarks) cuentan una historia muy clara:

- De **F16 a Q8_0** el modelo pasa de 15 GB a 8 GB y la diferencia de calidad es ruido estadistico.
- En **Q4_K_M** el fichero es **3.3 veces mas pequeño** que el original y la puntuacion media apenas baja 0.3 puntos. Por eso es el punto dulce.
- Por debajo de ~3.5 bits por peso (**Q3_K_S** y menos), la curva se despeña. Y no cae de forma uniforme: las tareas de razonamiento como las mates de GSM8K se desploman primero (9 puntos), mientras que tareas mas simples apenas se inmutan. Un modelo sobre-cuantizado puede parecer normal chateando y fallar estrepitosamente calculando.

## Chuleta final

Si solo te llevas una tabla de este post, que sea esta:

| Si...                                       | Usa...                                       |
| ------------------------------------------- | -------------------------------------------- |
| Te sobra memoria y quieres maxima fidelidad | Q8_0 o Q6_K                                  |
| Quieres el equilibrio estandar              | **Q4_K_M**                                   |
| Vas justo de memoria                        | Q4_K_S o IQ4_XS                              |
| El modelo no cabe ni a la de tres           | IQ3/IQ2 con imatrix, y baja tus expectativas |
| Vas a hacer fine-tuning con poca GPU        | bitsandbytes NF4 (QLoRA)                     |
| Vas a servir un modelo en GPU en produccion | AWQ o GPTQ                                   |

La quantization es probablemente la tecnica con mejor relacion esfuerzo-beneficio de todo el ecosistema LLM: cuatro veces menos memoria a cambio de una perdida de calidad que en la mayoria de casos ni notaras. Y ahora, ademas, cuando veas `Q4_K_M` en un nombre de fichero ya no veras una jugada de Scrabble, sino exactamente lo que le han hecho a esos 8.000 millones de numeros para que quepan en tu portatil.

## Para profundizar

- [A Visual Guide to Quantization](https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-quantization) - explicacion visual excelente de Maarten Grootendorst.
- [Which Quantization Should I Use?](https://arxiv.org/html/2601.14277v1) - la evaluacion sistematica de la que salen los datos de la grafica calidad-tamaño.
- [LLM Fine Tuning Crash Course](https://www.youtube.com/watch?v=IIvORO248Zs) - el tramo 13:00-29:00 explica la quantization y NF4 paso a paso con codigo.
