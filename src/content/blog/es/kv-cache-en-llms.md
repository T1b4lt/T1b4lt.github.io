---
idx: 3
title: "KV Cache: La Memoria Oculta que Acelera los LLMs"
author: "Guillermo"
pubDate: "3 de julio de 2026"
pubDateLogical: "2026-07-03"
tags: ["IA", "LLMs", "Transformers", "Inferencia"]
---

Si alguna vez te has preguntado por que un modelo de lenguaje como GPT, Llama o DeepSeek puede generar texto a una velocidad razonable a pesar de tener miles de millones de parametros, gran parte de la respuesta se resume en tres letras: **KV cache**. Esta tecnica de optimizacion es tan fundamental para la inferencia en LLMs que, sin ella, la generacion de texto seria practicamente inviable a escalas de produccion.

En este post voy a explicar que es la KV cache, por que existe, como funciona por dentro, y cuales son las tecnicas de investigacion mas recientes para lidiar con su principal limitacion: el consumo masivo de memoria.

## El problema: redundancia cuadratica

Los modelos de lenguaje basados en la arquitectura Transformer generan texto de forma **autorregresiva**: predicen y producen un solo token (palabra o subpalabra) a la vez, condicionado por toda la secuencia anterior.

En cada paso de generacion, el mecanismo de atencion necesita calcular tres vectores para cada token de la secuencia:

- **Query (Q):** Lo que el token actual "pregunta" al contexto.
- **Key (K):** Lo que cada token pasado "ofrece" como identificador.
- **Value (V):** La informacion que cada token pasado aporta si resulta relevante.

Sin ninguna optimizacion, cada vez que el modelo genera un nuevo token tiene que **recalcular K y V para todos los tokens anteriores desde cero**. En el paso 1 calcula 1 par KV. En el paso 2, recalcula 2 pares. En el paso 100, recalcula 100 pares. El coste total crece de forma cuadratica: O(n\*\*2).

![Generacion autorregresiva: el problema de la redundancia](/images/blog/kv-cache-redundancy.svg)

Esto hace que la generacion sea extremadamente lenta para secuencias largas. Si generar 100 tokens cuesta X, generar 200 no cuesta 2X sino 4X.

## La solucion: KV Cache

La KV cache es conceptualmente simple: **almacenar los vectores K y V de los tokens ya procesados para no tener que recalcularlos**. Funciona en dos fases:

### Fase 1: Prefill (procesamiento del prompt)

Cuando el modelo recibe el prompt del usuario, procesa todos los tokens de entrada en paralelo. Calcula los vectores Q, K y V para cada token y almacena los pares K y V en la cache. Esta fase aprovecha al maximo el paralelismo de la GPU.

### Fase 2: Decode (generacion token a token)

A partir de aqui, para cada nuevo token generado:

1. Se calcula Q, K y V **unicamente para el nuevo token**.
2. Se recuperan de la cache los K y V de todos los tokens anteriores.
3. Se ejecuta la operacion de atencion usando el Q del token nuevo contra todos los K almacenados.
4. Se anaden los nuevos K y V a la cache para el siguiente paso.

El resultado es que el coste computacional por paso de generacion se mantiene **constante**, y el coste total crece de forma lineal: O(n). La mejora de velocidad es dramatica.

## El precio: memoria

La velocidad no es gratis. Almacenar todos esos vectores K y V consume una cantidad significativa de memoria de video (VRAM) en la GPU, y esta cantidad crece linealmente con la longitud de la secuencia.

![El coste de memoria de la KV cache en contextos largos](/images/blog/kv-cache-memory-tradeoff.svg)

Para un modelo como Llama 3 70B en FP16, la KV cache de una secuencia de 128K tokens puede consumir alrededor de 80 GB de VRAM, superando incluso el espacio que ocupan los propios parametros del modelo. Cuando ademas se procesan multiples solicitudes simultaneas (batching), el problema se multiplica.

La KV cache se ha convertido en el **principal cuello de botella de memoria** de los LLMs modernos. Esto ha generado un campo de investigacion extremadamente activo centrado en comprimirla sin sacrificar calidad.

## Implementacion: como funciona por dentro

La KV cache no es una capa de la red neuronal con pesos entrenables. Es un **bufer de memoria dinamica** (tensores) que reside asociado a cada capa de autoatencion del modelo.

Dado que cada capa del Transformer tiene su propio mecanismo de atencion con matrices de proyeccion independientes para K y V, la cache se implementa como una pareja de tensores por capa, con dimensiones `[batch, num_heads, seq_len, head_dim]`. La cache completa del modelo se estructura como:

```
((K_1, V_1), (K_2, V_2), ..., (K_L, V_L))
```

donde `L` es el numero de capas.

En librerias como `transformers` de Hugging Face, la KV cache viene implementada de forma nativa. El parametro `use_cache=True` (activado por defecto en generacion) controla su uso. Internamente, el objeto `past_key_values` se propaga entre pasos de generacion: en el primer paso contiene los KV del prompt, y en cada paso siguiente se le concatenan los KV del nuevo token. Todo esto ocurre de forma transparente cuando se llama a `model.generate()`.

## Tecnicas de optimizacion: comprimiendo la KV cache

Debido a la importancia del problema, existen multiples lineas de investigacion activas para reducir el consumo de memoria de la KV cache. Las principales se dividen en tres categorias: modificaciones arquitectonicas, cuantizacion, y gestion dinamica del contexto.

### Modificaciones arquitectonicas

La idea es reducir el numero de pares KV que el modelo necesita almacenar, rediseñando como se organizan las cabezas de atencion.

![Comparacion de mecanismos de atencion: MHA vs MQA vs GQA vs MLA](/images/blog/kv-cache-attention-comparison.svg)

#### Multi-Head Attention (MHA) - La linea base

La atencion estandar: cada cabeza de consulta Q tiene su propio par K y V independiente. Es la arquitectura original del Transformer y ofrece la mejor calidad, pero con el mayor coste de memoria para la cache.

#### Multi-Query Attention (MQA) - El extremo minimalista

Propuesta como optimizacion agresiva: **todas las cabezas Q comparten un unico par KV**. Reduce la cache a una fraccion (por ejemplo, al 12.5% con 8 cabezas), pero la perdida de calidad es significativa. Fue usada en modelos tempranos como Falcon, pero hoy esta **mayormente superada**.

#### Grouped-Query Attention (GQA) - El estandar actual

El punto intermedio que domina la industria. Las cabezas Q se organizan en **g grupos**, y cada grupo comparte un par KV. Con g=2 sobre 8 cabezas, la cache se reduce al 25% manteniendo una calidad muy cercana a MHA.

Es la tecnica por defecto en la mayoria de modelos abiertos actuales: **Llama 2, Llama 3, Mistral, Gemma**.

#### Multi-Head Latent Attention (MLA) - La nueva frontera

Introducida por DeepSeek (V2, V3, R1), MLA toma un enfoque radicalmente diferente: en lugar de agrupar cabezas, **comprime los vectores K y V en un unico vector latente de baja dimension** (`c_t`). Este vector comprimido es lo unico que la GPU necesita almacenar. Al momento de calcular la atencion, el vector se descomprime bajo demanda o se absorbe matematicamente en las matrices de proyeccion de Q.

Para que funcione, MLA requiere **desacoplar la codificacion de posicion rotatoria (RoPE)** del vector latente, ya que RoPE depende de la posicion absoluta del token y no puede comprimirse junto con el contenido semantico.

Los resultados son notables: MLA logra reducciones de hasta el **93.3% de la memoria** de la KV cache respecto a MHA, manteniendo o incluso superando su calidad. Otros modelos de frontera como **Kimi K2** y **GLM-5** ya estan adoptando esta arquitectura.

Una linea de investigacion reciente, **MHA2MLA**, propone convertir modelos ya entrenados con MHA (como Llama) a la arquitectura MLA sin reentrenarlos desde cero, utilizando factorizaciones de matrices (SVD) con solo un ~0.5% de datos de ajuste fino.

### Cuantizacion de la KV cache

Otra aproximacion complementaria es reducir la **precision numerica** de los datos almacenados. En lugar de guardar los vectores en 16 bits (FP16/BF16), se comprimen a 8, 4 o incluso 2 bits. La reduccion de memoria es casi proporcional a los bits recortados.

Esta tecnica es **ortogonal** a las modificaciones arquitectonicas, es decir, se puede combinar con GQA o MLA para multiplicar los beneficios.

Metodos destacados:

- **KIVI (ICML 2024):** Permite cuantizar la cache asimetricamente a 2 bits sin necesidad de reentrenamiento, aplicando cuantizacion por canal a las Keys y por token a los Values. Logra **2.6x menos memoria pico**, lotes de hasta **4x mas grandes** y un rendimiento de **2.35-3.47x** mayor.
- **TurboQuant (Google):** Utiliza rotaciones ortogonales basadas en el algoritmo de Johnson-Lindenstrauss para lograr cuantizacion a 3-4 bits casi sin perdida de precision, acercandose al limite teorico de compresion.

### Eviccion de tokens y compresion dinamica

La tercera familia de tecnicas parte de una observacion empirica: **no todos los tokens del contexto son igual de importantes** para predecir la siguiente palabra. Los modelos tienden a prestar atencion masiva a ciertos "tokens ancla" (attention sinks) y a tokens locales recientes, mientras que los tokens intermedios reciben poca atencion.

Las tecnicas de eviccion **descartan de la cache los tokens irrelevantes** y retienen un presupuesto fijo de tokens de alta importancia (Heavy Hitters) o tokens en una ventana local.

Enfoques destacados:

- **H2O y StreamingLLM:** Pioneros en mantener solo los tokens iniciales (attention sinks) junto con los tokens recientes mas relevantes. StreamingLLM (ICLR 2024) demostro generacion estable con mas de **4 millones de tokens** y un speedup de **22.2x** respecto a la recomputacion por ventana deslizante, sin necesidad de fine-tuning.
- **SnapKV y PyramidKV (2024):** Comprimen la KV cache durante la fase de prefill utilizando una ventana de observacion al final del prompt para identificar posiciones clave por cabeza de atencion. SnapKV logra una decodificacion **3.6x mas rapida** y una mejora de **8.2x en memoria**, procesando hasta **380K tokens en una sola GPU A100-80GB**. PyramidKV va un paso mas alla reduciendo el numero de tokens almacenados en capas mas profundas del modelo, donde hay menos diversidad de atencion.
- **Ada-KV y FastKV (2024-2025):** Ada-KV asigna presupuestos de memoria **adaptativos por cabeza de atencion** en lugar de uniformes. FastKV desacopla la reduccion del contexto de la compresion de la cache, propagando selectivamente tokens entre capas para acelerar tanto el prefill como la decodificacion.

## Tabla resumen

| Tecnica          | Tipo         | Ahorro de memoria | Estado                   |
| ---------------- | ------------ | ----------------- | ------------------------ |
| MQA              | Arquitectura | ~87.5%            | Superada                 |
| GQA              | Arquitectura | ~75%              | Estandar de la industria |
| MLA              | Arquitectura | ~93%              | Estado del arte          |
| KIVI (2-bit)     | Cuantizacion | ~87.5%            | En produccion            |
| TurboQuant       | Cuantizacion | ~75-81%           | Investigacion activa     |
| H2O/StreamingLLM | Eviccion     | Variable          | En produccion            |
| SnapKV/PyramidKV | Eviccion     | Variable          | Investigacion activa     |
| Ada-KV/FastKV    | Eviccion     | Variable          | Investigacion activa     |

## Conclusion

La KV cache es una de esas optimizaciones que resulta invisible cuando funciona correctamente, pero cuya ausencia haria que la generacion de texto fuera impracticable. Es, en esencia, la **memoria a corto plazo** del modelo durante la inferencia.

El reto actual no es si usarla o no (es imprescindible), sino como gestionar su crecimiento de memoria a medida que los contextos se alargan y el batching se intensifica. Las tres familias de optimizacion (arquitectura, cuantizacion y eviccion) no compiten entre si, sino que se complementan: un modelo moderno puede usar GQA o MLA como base, aplicar cuantizacion a 4 bits sobre la cache resultante, y ademas implementar eviccion dinamica de tokens irrelevantes.

La KV cache es, hoy por hoy, el campo donde convergen la mayor parte de los esfuerzos de optimizacion de inferencia en LLMs. Y entenderla es clave para comprender tanto los limites como las posibilidades de los modelos de lenguaje actuales.
