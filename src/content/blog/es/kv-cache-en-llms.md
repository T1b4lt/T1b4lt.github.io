---
idx: 3
title: "KV Cache: La Memoria Oculta que Acelera los LLMs"
author: "Guillermo"
pubDate: "3 de julio de 2026"
pubDateLogical: "2026-07-03"
tags: ["IA", "LLMs", "Transformers", "Inferencia"]
---

Si alguna vez te has preguntado por qué un modelo de lenguaje como GPT, Llama o DeepSeek puede generar texto a una velocidad razonable a pesar de tener miles de millones de parámetros, gran parte de la respuesta se resume en tres letras: **KV cache**. Esta técnica de optimización es tan fundamental para la inferencia en LLMs que, sin ella, la generación de texto sería prácticamente inviable a escalas de producción.

En este post voy a explicar qué es la KV cache, por qué existe, cómo funciona por dentro, y cuáles son las técnicas de investigación más recientes para lidiar con su principal limitación: el consumo masivo de memoria.

## El problema: redundancia cuadrática

Los modelos de lenguaje basados en la arquitectura Transformer generan texto de forma **autorregresiva**: predicen y producen un solo token (palabra o subpalabra) a la vez, condicionado por toda la secuencia anterior.

En cada paso de generación, el mecanismo de atención necesita calcular tres vectores para cada token de la secuencia:

- **Query (Q):** Lo que el token actual "pregunta" al contexto.
- **Key (K):** Lo que cada token pasado "ofrece" como identificador.
- **Value (V):** La información que cada token pasado aporta si resulta relevante.

Sin ninguna optimización, cada vez que el modelo genera un nuevo token tiene que **recalcular K y V para todos los tokens anteriores desde cero**. En el paso 1 calcula 1 par KV. En el paso 2, recalcula 2 pares. En el paso 100, recalcula 100 pares. El coste total crece de forma cuadrática: O(n\*\*2).

![Generación autorregresiva: el problema de la redundancia](/images/blog/kv-cache-redundancy.svg)

Esto hace que la generación sea extremadamente lenta para secuencias largas. Si generar 100 tokens cuesta X, generar 200 no cuesta 2X sino 4X.

## La solución: KV Cache

La KV cache es conceptualmente simple: **almacenar los vectores K y V de los tokens ya procesados para no tener que recalcularlos**. Funciona en dos fases:

### Fase 1: Prefill (procesamiento del prompt)

Cuando el modelo recibe el prompt del usuario, procesa todos los tokens de entrada en paralelo. Calcula los vectores Q, K y V para cada token y almacena los pares K y V en la cache. Esta fase aprovecha al máximo el paralelismo de la GPU.

### Fase 2: Decode (generación token a token)

A partir de aquí, para cada nuevo token generado:

1. Se calcula Q, K y V **únicamente para el nuevo token**.
2. Se recuperan de la cache los K y V de todos los tokens anteriores.
3. Se ejecuta la operación de atención usando el Q del token nuevo contra todos los K almacenados.
4. Se añaden los nuevos K y V a la cache para el siguiente paso.

El resultado es que el coste computacional por paso de generación se mantiene **constante**, y el coste total crece de forma lineal: O(n). La mejora de velocidad es dramática.

## El precio: memoria

La velocidad no es gratis. Almacenar todos esos vectores K y V consume una cantidad significativa de memoria de vídeo (VRAM) en la GPU, y esta cantidad crece linealmente con la longitud de la secuencia.

![El coste de memoria de la KV cache en contextos largos](/images/blog/kv-cache-memory-tradeoff.svg)

Para un modelo como Llama 3 70B en FP16, la KV cache de una secuencia de 128K tokens puede consumir alrededor de 80 GB de VRAM, superando incluso el espacio que ocupan los propios parámetros del modelo. Cuando además se procesan múltiples solicitudes simultáneas (batching), el problema se multiplica.

La KV cache se ha convertido en el **principal cuello de botella de memoria** de los LLMs modernos. Esto ha generado un campo de investigación extremadamente activo centrado en comprimirla sin sacrificar calidad.

## Implementación: cómo funciona por dentro

La KV cache no es una capa de la red neuronal con pesos entrenables. Es un **búfer de memoria dinámica** (tensores) que reside asociado a cada capa de autoatención del modelo.

Dado que cada capa del Transformer tiene su propio mecanismo de atención con matrices de proyección independientes para K y V, la cache se implementa como una pareja de tensores por capa, con dimensiones `[batch, num_heads, seq_len, head_dim]`. La cache completa del modelo se estructura como:

```
((K_1, V_1), (K_2, V_2), ..., (K_L, V_L))
```

donde `L` es el número de capas.

En librerías como `transformers` de Hugging Face, la KV cache viene implementada de forma nativa. El parámetro `use_cache=True` (activado por defecto en generación) controla su uso. Internamente, el objeto `past_key_values` se propaga entre pasos de generación: en el primer paso contiene los KV del prompt, y en cada paso siguiente se le concatenan los KV del nuevo token. Todo esto ocurre de forma transparente cuando se llama a `model.generate()`.

## Técnicas de optimización: comprimiendo la KV cache

Debido a la importancia del problema, existen múltiples líneas de investigación activas para reducir el consumo de memoria de la KV cache. Las principales se dividen en tres categorías: modificaciones arquitectónicas, cuantización, y gestión dinámica del contexto.

### Modificaciones arquitectónicas

La idea es reducir el número de pares KV que el modelo necesita almacenar, rediseñando cómo se organizan las cabezas de atención.

![Comparación de mecanismos de atención: MHA vs MQA vs GQA vs MLA](/images/blog/kv-cache-attention-comparison.svg)

#### Multi-Head Attention (MHA) - La línea base

La atención estándar: cada cabeza de consulta Q tiene su propio par K y V independiente. Es la arquitectura original del Transformer y ofrece la mejor calidad, pero con el mayor coste de memoria para la cache.

#### Multi-Query Attention (MQA) - El extremo minimalista

Propuesta como optimización agresiva: **todas las cabezas Q comparten un único par KV**. Reduce la cache a una fracción (por ejemplo, al 12.5% con 8 cabezas), pero la pérdida de calidad es significativa. Fue usada en modelos tempranos como Falcon, pero hoy está **mayormente superada**.

#### Grouped-Query Attention (GQA) - El estándar actual

El punto intermedio que domina la industria. Las cabezas Q se organizan en **g grupos**, y cada grupo comparte un par KV. Con g=2 sobre 8 cabezas, la cache se reduce al 25% manteniendo una calidad muy cercana a MHA.

Es la técnica por defecto en la mayoría de modelos abiertos actuales: **Llama 2, Llama 3, Mistral, Gemma**.

#### Multi-Head Latent Attention (MLA) - La nueva frontera

Introducida por DeepSeek (V2, V3, R1), MLA toma un enfoque radicalmente diferente: en lugar de agrupar cabezas, **comprime los vectores K y V en un único vector latente de baja dimensión** (`c_t`). Este vector comprimido es lo único que la GPU necesita almacenar. Al momento de calcular la atención, el vector se descomprime bajo demanda o se absorbe matemáticamente en las matrices de proyección de Q.

Para que funcione, MLA requiere **desacoplar la codificación de posición rotatoria (RoPE)** del vector latente, ya que RoPE depende de la posición absoluta del token y no puede comprimirse junto con el contenido semántico.

Los resultados son notables: MLA logra reducciones de hasta el **93.3% de la memoria** de la KV cache respecto a MHA, manteniendo o incluso superando su calidad. Otros modelos de frontera como **Kimi K2** y **GLM-5** ya están adoptando esta arquitectura.

Una línea de investigación reciente, **MHA2MLA**, propone convertir modelos ya entrenados con MHA (como Llama) a la arquitectura MLA sin reentrenarlos desde cero, utilizando factorizaciones de matrices (SVD) con solo un ~0.5% de datos de ajuste fino.

### Cuantización de la KV cache

Otra aproximación complementaria es reducir la **precisión numérica** de los datos almacenados. En lugar de guardar los vectores en 16 bits (FP16/BF16), se comprimen a 8, 4 o incluso 2 bits. La reducción de memoria es casi proporcional a los bits recortados.

Esta técnica es **ortogonal** a las modificaciones arquitectónicas, es decir, se puede combinar con GQA o MLA para multiplicar los beneficios.

Métodos destacados:

- **KIVI (ICML 2024):** Permite cuantizar la cache asimétricamente a 2 bits sin necesidad de reentrenamiento, aplicando cuantización por canal a las Keys y por token a los Values. Logra **2.6x menos memoria pico**, lotes de hasta **4x más grandes** y un rendimiento de **2.35-3.47x** mayor.
- **TurboQuant (Google):** Utiliza rotaciones ortogonales basadas en el algoritmo de Johnson-Lindenstrauss para lograr cuantización a 3-4 bits casi sin pérdida de precisión, acercándose al límite teórico de compresión.

### Evicción de tokens y compresión dinámica

La tercera familia de técnicas parte de una observación empírica: **no todos los tokens del contexto son igual de importantes** para predecir la siguiente palabra. Los modelos tienden a prestar atención masiva a ciertos "tokens ancla" (attention sinks) y a tokens locales recientes, mientras que los tokens intermedios reciben poca atención.

Las técnicas de evicción **descartan de la cache los tokens irrelevantes** y retienen un presupuesto fijo de tokens de alta importancia (Heavy Hitters) o tokens en una ventana local.

Enfoques destacados:

- **H2O y StreamingLLM:** Pioneros en mantener solo los tokens iniciales (attention sinks) junto con los tokens recientes más relevantes. StreamingLLM (ICLR 2024) demostró generación estable con más de **4 millones de tokens** y un speedup de **22.2x** respecto a la recomputación por ventana deslizante, sin necesidad de fine-tuning.
- **SnapKV y PyramidKV (2024):** Comprimen la KV cache durante la fase de prefill utilizando una ventana de observación al final del prompt para identificar posiciones clave por cabeza de atención. SnapKV logra una decodificación **3.6x más rápida** y una mejora de **8.2x en memoria**, procesando hasta **380K tokens en una sola GPU A100-80GB**. PyramidKV va un paso más allá reduciendo el número de tokens almacenados en capas más profundas del modelo, donde hay menos diversidad de atención.
- **Ada-KV y FastKV (2024-2025):** Ada-KV asigna presupuestos de memoria **adaptativos por cabeza de atención** en lugar de uniformes. FastKV desacopla la reducción del contexto de la compresión de la cache, propagando selectivamente tokens entre capas para acelerar tanto el prefill como la decodificación.

## Tabla resumen

| Técnica          | Tipo         | Ahorro de memoria | Estado                   |
| ---------------- | ------------ | ----------------- | ------------------------ |
| MQA              | Arquitectura | ~87.5%            | Superada                 |
| GQA              | Arquitectura | ~75%              | Estándar de la industria |
| MLA              | Arquitectura | ~93%              | Estado del arte          |
| KIVI (2-bit)     | Cuantización | ~87.5%            | En producción            |
| TurboQuant       | Cuantización | ~75-81%           | Investigación activa     |
| H2O/StreamingLLM | Evicción     | Variable          | En producción            |
| SnapKV/PyramidKV | Evicción     | Variable          | Investigación activa     |
| Ada-KV/FastKV    | Evicción     | Variable          | Investigación activa     |

## Conclusión

La KV cache es una de esas optimizaciones que resulta invisible cuando funciona correctamente, pero cuya ausencia haría que la generación de texto fuera impracticable. Es, en esencia, la **memoria a corto plazo** del modelo durante la inferencia.

El reto actual no es si usarla o no (es imprescindible), sino cómo gestionar su crecimiento de memoria a medida que los contextos se alargan y el batching se intensifica. Las tres familias de optimización (arquitectura, cuantización y evicción) no compiten entre sí, sino que se complementan: un modelo moderno puede usar GQA o MLA como base, aplicar cuantización a 4 bits sobre la cache resultante, y además implementar evicción dinámica de tokens irrelevantes.

La KV cache es, hoy por hoy, el campo donde convergen la mayor parte de los esfuerzos de optimización de inferencia en LLMs. Y entenderla es clave para comprender tanto los límites como las posibilidades de los modelos de lenguaje actuales.
