---
idx: 7
title: "Deuda, electricidad y personas: los tres cuellos de botella del boom de la IA"
author: "Guillermo Segovia"
pubDate: "4 de noviembre de 2026"
pubDateLogical: "2026-11-04"
tags: ["IA", "Economía", "Infraestructura", "Empleo"]
---

En agosto de 2026, Amazon esperaba recibir unos 5.000 millones de dólares en racks de servidores Nvidia GB300 para sus centros de datos en Estados Unidos, y unos 3.000 millones más cada mes _"for the foreseeable future"_. El problema es que algunos de esos centros tenían sitio para los racks, pero no electricidad suficiente para encenderlos. Según los correos internos que publicó Business Insider, parte de ese equipo terminado se quedó esperando en almacenes intermedios.

Ese mismo octubre, asegurar la deuda de CoreWeave, el mayor de los llamados _neoclouds_, pasó a costar más del 11 % al año, un nivel que los mercados asocian a empresas en apuros. Y el 26 de octubre Microsoft ofreció salidas voluntarias a unos 60.000 empleados, alrededor del 27 % de su plantilla, mientras sus ingresos crecen al 18 % anual.

Son tres titulares que parecen de secciones distintas del periódico (finanzas, energía y empleo), pero en mi opinión cuentan la misma historia: **la demanda de inteligencia artificial existe, pero el boom está chocando con tres límites que no se resuelven comprando más GPUs**. El dinero cuesta más, la electricidad no llega a tiempo y las empresas están pagando parte de la factura con sus plantillas.

En este post analizo cada uno de esos cuellos de botella con datos y, al final, propongo tres escenarios para los próximos cinco años con la probabilidad que yo les asigno. Si te interesa el marco histórico (por qué las burbujas tecnológicas casi siempre terminan en el crédito), lo desarrollé en la charla [Burbujas tecnológicas 101](/talks/burbujas-tecnologicas-101/).

## Qué es un neocloud y por qué vive de la deuda

Un _neocloud_ es un proveedor de nube especializado casi exclusivamente en alquilar capacidad de cómputo con GPUs para entrenar y servir modelos de IA. A diferencia de Amazon Web Services, Microsoft Azure o Google Cloud, que tienen negocios enormes y diversificados detrás, un _neocloud_ hace básicamente una cosa: compra GPUs, las instala en centros de datos y las alquila. Los nombres más conocidos son CoreWeave, Nebius, Lambda, Crusoe o IREN.

El modelo tiene una lógica sencilla, pero exigente:

1. **Firmar un contrato** de varios años con un cliente grande (Microsoft, OpenAI, Meta...).
2. **Pedir prestado** contra ese contrato y contra las propias GPUs, que sirven de garantía.
3. **Comprar e instalar** las GPUs, lo que exige también conseguir un centro de datos y, sobre todo, potencia eléctrica.
4. **Cobrar el alquiler** durante unos años y, con él, pagar intereses y devolver el préstamo antes de que las GPUs queden obsoletas.

Funciona si los pasos 3 y 4 llegan a tiempo y si el dinero del paso 2 es barato. CoreWeave es el mejor ejemplo de la tensión que se genera. En el segundo trimestre de 2026 sus ingresos crecieron un 112 %, hasta 2.575 millones de dólares, y su cartera de contratos firmados (_backlog_) alcanzó unos 104.000 millones. Son cifras de una empresa con demanda real. Pero en ese mismo trimestre:

- Pagó **640 millones de dólares en intereses**, frente a 267 millones un año antes.
- Su beneficio operativo ajustado fue de **128 millones**: los intereses fueron cinco veces mayores.
- Registró una **pérdida neta de 626 millones**.
- Invirtió **6.422 millones** en equipos e instalaciones (_capex_) y obtuvo **13.457 millones** en deuda nueva.

A esto se suma la concentración: según su informe anual, Microsoft supuso alrededor del 67 % de los ingresos de CoreWeave en 2025. La deuda total, dependiendo de si se incluyen los arrendamientos, se sitúa entre 35.000 y 52.000 millones de dólares según la fuente.

En la charla sobre burbujas usé la clasificación del economista Hyman Minsky, que distingue tres tipos de deudor: el que paga intereses y principal con sus ingresos (cubierto), el que solo paga intereses y necesita refinanciar el principal (especulativo) y el que ni siquiera cubre los intereses (lo que Minsky llamaba, como término técnico, _Ponzi_). Con resultados como los del segundo trimestre, un _neocloud_ apalancado depende de que el mercado de deuda siga abierto. Y eso es justo lo que ha empezado a cuestionarse.

## Primer cuello de botella: el crédito

### Qué es un CDS y por qué importa

Un _credit default swap_ (CDS) funciona como un seguro contra el impago de una empresa. Quien lo compra paga una prima anual y, si la empresa no devuelve su deuda, recibe una compensación. La prima se expresa en puntos básicos (pb): 100 pb equivalen a pagar un 1 % al año sobre la cantidad asegurada.

Es un termómetro muy útil por dos motivos. El primero es que lo fijan inversores profesionales que se juegan su dinero, no analistas haciendo previsiones. El segundo es que suele moverse antes que la bolsa: los acreedores tienen más que perder en un impago y miran el balance con más atención que el accionista medio.

### La escalada de CoreWeave

El CDS a cinco años de CoreWeave ha pasado de unos 421 pb hace un año a 1.167 pb el 22 de octubre de 2026, su máximo en los doce meses de datos de S&P Global Market Intelligence. A partir de 1.000 pb, el mercado considera que una empresa está en situación de _distress_ (tensión financiera grave).

![Animación de barras: el CDS a cinco años de CoreWeave sube de 421 puntos básicos en octubre de 2025 a 1.167 en su máximo del 22 de octubre de 2026, por encima del umbral de 1.000 puntos que el mercado asocia a tensión financiera](/images/blog/ai-bottlenecks-coreweave-cds.svg)

En términos prácticos, a 1.148 pb (el nivel del 26 de octubre) asegurar un millón de dólares de deuda de CoreWeave cuesta unos 114.800 dólares al año. Con una hipótesis estándar de recuperación del 40 %, ese precio implica una probabilidad de impago a cinco años de alrededor del 62 %. Conviene leer esa cifra con cuidado: las probabilidades implícitas en un CDS incluyen la prima que el inversor exige por soportar el riesgo, así que tienden a exagerar la probabilidad real. No dicen que CoreWeave vaya a quebrar; dicen que el mercado exige cobrar como si fuera bastante posible.

Los bonos cuentan lo mismo. El 15 de octubre, los bonos de CoreWeave con vencimiento en 2031 y 2032 cotizaban entre 78 y 80 céntimos por dólar, con rentabilidades de entre el 15,6 % y el 16,2 %. Por debajo de 80 céntimos, un bono se considera habitualmente _distressed_. S&P califica a la compañía en B+, dentro del grado especulativo. Ese mismo día, Jensen Huang, consejero delegado de Nvidia (que es a la vez accionista, proveedor y cliente de CoreWeave), declaró en Estocolmo que _"CoreWeave's strength is growing by the day"_ y que Nvidia no cree necesario actuar como respaldo financiero.

### El contagio

El problema no se ha quedado en CoreWeave:

- **Oracle**, que ha firmado contratos de centros de datos por valor de cientos de miles de millones (OpenAI supone cerca de la mitad de sus 638.000 millones de obligaciones pendientes), vio su CDS a cinco años marcar un récord de 288 pb el 15 de octubre, frente a 144 pb a comienzos de año. En julio, S&P la rebajó a BBB−, el último escalón antes del bono basura.
- **SoftBank**, uno de los grandes financiadores de OpenAI, cotizaba su CDS en 424 pb ese mismo día.
- En bolsa, durante octubre, CoreWeave cayó alrededor de un 35 %, Nebius cerca de un 29 % e IREN casi un 46 %, aunque las dos últimas no tienen la estructura de deuda de CoreWeave.

A esto se han sumado avisos de peso. El 13 de octubre, el Fondo Monetario Internacional incluyó una corrección de los activos ligados a la IA, en bolsa y en crédito, entre los tres riesgos principales de su informe de estabilidad financiera. El 15 de octubre, Gartner publicó que más del 80 % de los _neoclouds_ dejarán de operar de forma independiente antes de 2030 por presión de costes y falta de diferenciación. Y el 26 de octubre, Elon Musk afirmó que más de 200 _neoclouds_ se enfrentan a una consolidación inevitable porque los mercados de deuda se han cerrado casi por completo para quien no tenga ingresos al margen de los centros de datos. Musk compite en este mercado con xAI, así que su opinión no es neutral, pero coincide con lo que dicen los precios.

### Por qué esto importa más allá de CoreWeave

La razón de fondo es la escala. Goldman Sachs estima que en 2026 se emitirán más de 750.000 millones de dólares en deuda ligada a la IA. Morgan Stanley calcula que la inversión mundial en centros de datos entre 2025 y 2028 rondará los 2,9 billones de dólares (billones europeos, 10¹²), y que las grandes tecnológicas solo podrán cubrir con su caja alrededor de la mitad. El resto, en torno a 1,5 billones, tendrá que venir de deuda: la mayor parte, unos 800.000 millones, de crédito privado, un mercado menos transparente y menos regulado que la bolsa.

En otras palabras, la construcción de la infraestructura de la IA ha pasado de financiarse con beneficios a financiarse con deuda. Y cuando la financiación depende de la deuda, el coste de esa deuda se convierte en una variable tan importante como el rendimiento de los modelos.

## Segundo cuello de botella: la electricidad

### GPUs a oscuras

Business Insider ha llamado _dark GPUs_ al fenómeno con el que empezaba este post: chips y servidores comprados y pagados que no funcionan porque el centro de datos no tiene potencia eléctrica disponible. Amazon ha creado un programa, _Early Rack Receipt_, que le permite tomar posesión de los racks antes de que lleguen al centro de datos, cuando antes lo hacía a la entrega. La lógica es asegurarse un suministro escaso antes que la competencia. Al menos un equipo interno no tenía, según uno de los correos, _"a clear forecasted path"_ para instalar los racks que iban llegando. Amazon defiende que almacenar equipo cerca de los centros hasta que haya capacidad es _"best business practice"_.

El coste de esa espera se ve en las cuentas. Amazon prevé invertir unos 220.000 millones de dólares en 2026, más que ninguna otra gran tecnológica, y su flujo de caja libre de los doce meses hasta junio fue de −7.600 millones, frente a +18.200 millones un año antes. Según una grabación interna publicada por el mismo medio, el responsable financiero de AWS bromeó con el responsable de infraestructura sobre haber llevado a toda la compañía a un flujo de caja libre negativo, y este último prevé que siga así un par de años.

Hay que poner esto en contexto. Amazon no es un _neocloud_: AWS creció un 37 % en el segundo trimestre, tiene una cartera de 496.000 millones de dólares y una caja que le permite aguantar. Pero el mecanismo es el mismo que estrangula a los actores pequeños: **una GPU sin electricidad no genera ingresos, pero sí genera intereses y depreciación**.

![Animación de un ciclo: se pide deuda, se compran GPUs, las GPUs esperan sin electricidad y los intereses se acumulan, lo que obliga a pedir más deuda; solo la conexión a la red rompe el ciclo y genera ingresos por alquiler](/images/blog/ai-bottlenecks-debt-loop.svg)

### La paradoja de los precios

Hay un dato que, para mí, explica bien la situación. Entre 2023 y 2025, el precio de alquilar una GPU H100 cayó con fuerza, y muchos lo interpretaron como señal de exceso de oferta. En 2026 ha ocurrido lo contrario: según los índices de precios que recopilan agregadores del sector, el precio de los contratos anuales de H100 subió un 38 % entre octubre de 2025 y marzo de 2026, y Nebius subió su tarifa bajo demanda de 3,85 a 4,50 dólares por hora el 1 de octubre.

Es decir, no parece faltar demanda. Lo que falta es capacidad encendida. El cuello de botella se ha desplazado del chip a la red eléctrica, y la red eléctrica se mueve a otra velocidad: una planta de generación o una línea de alta tensión tardan años en planificarse y construirse, mientras que Nvidia lanza una generación de chips al año. PJM, el operador de la mayor red eléctrica de Estados Unidos, ya ha anunciado que, a partir de junio de 2027, podrá cortar temporalmente el suministro a centros de datos de 50 megavatios o más para evitar apagones. Morgan Stanley ha estimado un déficit de unos 32 gigavatios para los centros de datos estadounidenses hasta 2028, una cifra que he encontrado citada en prensa pero no en su fuente original.

Aquí aparece, en mi opinión, la dimensión geopolítica del problema. Durante años la competición en IA se ha medido en chips, y los controles de exportación de Estados Unidos se han centrado en ellos. Pero si el factor limitante es la electricidad, la ventaja pasa a quien sea capaz de construir generación y red más rápido. Es una variable de política industrial y energética, no solo tecnológica.

## Tercer cuello de botella: las personas

### Más ingresos, menos plantilla

El tercer límite es más silencioso. En su último año fiscal, cerrado el 30 de junio de 2026, Microsoft ingresó 331.800 millones de dólares, un 18 % más que el año anterior y el mayor aumento anual de su historia. En el mismo periodo, su plantilla bajó de 228.000 a 223.000 personas, la primera caída desde 2016, y el área de I+D pasó de un máximo de 81.000 empleados en 2024 a 77.000.

![Crecimiento acumulado de Microsoft desde el año fiscal 2007: los ingresos crecen un 549 % mientras la plantilla crece un 182 % y se estanca desde 2022](/images/blog/ai-bottlenecks-microsoft-revenue-headcount.svg)

Bloomberg publicó hace poco un gráfico que resume la tendencia; la versión de arriba está construida con los datos de los informes anuales de Microsoft. Desde 2007, los ingresos se han multiplicado por 6,5 y la plantilla por 2,8. Los ingresos por empleado han pasado de unos 650.000 dólares a casi 1,5 millones. Hasta 2022 ambas curvas subían juntas, a distinto ritmo; desde entonces, la plantilla se ha quedado plana mientras los ingresos se aceleran.

Los movimientos recientes son coherentes con ese gráfico:

- Más de 15.000 despidos en 2025.
- Un primer programa de salidas voluntarias en primavera de 2026.
- Unos 4.800 despidos en julio de 2026, concentrados en Xbox y ventas.
- El 26 de octubre, una oferta de salida voluntaria a unos 60.000 empleados en Estados Unidos, Reino Unido, Canadá e India, que deberán decidir a principios de diciembre para salir el 31 de diciembre.

Al mismo tiempo, Microsoft invirtió 41.000 millones de dólares en _capex_ solo en el trimestre de abril a junio.

### Qué se puede afirmar y qué no

Aquí conviene ser preciso. Microsoft sostiene que los puestos eliminados no se están sustituyendo por IA, sino que la IA está cambiando la forma de trabajar. No tengo datos para afirmar lo contrario, y sería un error presentar estos recortes como "la IA ha sustituido a 60.000 personas": se trata de una oferta voluntaria, y según la propia compañía, programas similares en otras tecnológicas han tenido una aceptación de entre el 3 % y el 5 %.

Lo que sí se puede afirmar es más sutil, y en mi opinión más relevante: **las grandes tecnológicas están financiando parte de su inversión en infraestructura conteniendo su gasto en personas**. No es exclusivo de Microsoft; Amazon recortó unos 30.000 puestos entre finales de 2025 y principios de 2026, y Google también ha ofrecido salidas voluntarias. Cuando cada trimestre hay que justificar ante el mercado decenas de miles de millones en centros de datos, la plantilla es una de las pocas partidas de coste que se pueden ajustar rápido.

El impacto social es doble. A corto plazo, son empleos cualificados que desaparecen en el sector que más crece. A medio plazo, si el modelo se consolida, el reparto de la riqueza que genera la tecnología se desplaza todavía más hacia el capital (quien posee los centros de datos) y menos hacia el trabajo. Es una conversación que va más allá de una empresa concreta y que, creo, deberíamos tener con datos y sin alarmismo.

## Tres futuros hasta 2031

Con estos tres cuellos de botella sobre la mesa, ¿qué puede pasar? Propongo tres escenarios para el corto plazo (2027) y el medio plazo (hasta 2031). Las probabilidades son una **estimación propia**, no un modelo cuantitativo. Las he asignado ponderando las señales anteriores y lo que enseñan los ciclos de inversión tecnológica pasados (ferrocarril, telecomunicaciones, puntocom), que suelen terminar con la tecnología ganando y una parte de sus financiadores perdiendo.

![Tres trayectorias ilustrativas de la inversión en infraestructura de IA entre 2026 y 2031: optimista con un 20 % de probabilidad, neutral con un 50 % y pesimista con un 30 %](/images/blog/ai-bottlenecks-three-scenarios.svg)

### Optimista: la red alcanza a la demanda (20 %)

**Corto plazo.** Los resultados del cuarto trimestre de 2026 y del primero de 2027 muestran que los ingresos de la IA crecen al ritmo prometido: los grandes laboratorios mantienen sus tasas de crecimiento y la cartera de contratos de los proveedores se convierte en facturación. CoreWeave refinancia sus vencimientos, quizá con apoyo de un socio estratégico, y sus diferenciales vuelven por debajo de los 600 pb. Las _dark GPUs_ se encienden a medida que entran en servicio nuevas subestaciones y generación in situ (gas, baterías).

**Medio plazo.** Entre 2028 y 2031, la inversión en red eléctrica y generación alcanza a la demanda. El coste de servir un modelo cae, aparecen aplicaciones con retorno claro y la productividad empieza a notarse en las estadísticas. Los _neoclouds_ que sobreviven se convierten en proveedores especializados rentables. El empleo tecnológico se recompone hacia nuevos perfiles.

**Por qué solo un 20 %.** Requiere que todo salga bien a la vez: ingresos, energía y crédito. Históricamente, los ciclos de inversión de esta magnitud rara vez terminan sin una corrección intermedia.

### Neutral: consolidación con daños (50 %)

**Corto plazo.** La IA sigue creciendo, pero no lo bastante rápido para sostener a todos. Uno o varios _neoclouds_ reestructuran su deuda, son comprados por un hiperescalador o por un fondo, o canjean sus bonos con pérdidas para los acreedores. Las grandes tecnológicas moderan el crecimiento de su _capex_ en 2027 y 2028 sin recortarlo en seco. Parte de las GPUs más antiguas se amortiza antes de lo previsto, con saneamientos contables visibles. Los recortes de plantilla continúan de forma gradual.

**Medio plazo.** El patrón se parece al de las telecomunicaciones tras 2001, pero acotado: la infraestructura se queda (centros de datos, chips y contratos eléctricos cambian de manos a precio menor) y la tecnología sigue avanzando, como ocurrió con la fibra que permitió después YouTube o la nube. Al final del periodo, el mercado está dominado por los hiperescaladores y por dos o tres _neoclouds_ consolidados, en línea con la previsión de Gartner. La electricidad sigue siendo el factor limitante y el principal motivo de las decisiones de localización.

**Por qué un 50 %.** Es el escenario más coherente con las señales actuales: crédito en tensión pero sin impagos relevantes todavía, demanda real, hiperescaladores con caja para absorber activos y una consolidación que el propio sector ya anticipa.

### Pesimista: se cierra el grifo (30 %)

**Corto plazo.** El estrés de crédito se contagia. Un impago relevante de un _neocloud_ provoca pérdidas en fondos de crédito privado, que limitan reembolsos y dejan de financiar nuevos proyectos. Oracle pierde el grado de inversión, lo que obliga a vender sus bonos a fondos que no pueden tener bonos basura. Alguno de los grandes laboratorios tiene dificultades para cerrar su siguiente ronda y renegocia sus compromisos de cómputo, lo que deja contratos de varios miles de millones en el aire. Las tecnológicas recortan el _capex_ con fuerza y la bolsa corrige de forma amplia.

**Medio plazo.** Varios años de recesión tecnológica, con despidos generalizados en el sector y una caída de la inversión que arrastra a la economía de Estados Unidos, donde la inversión en IA se ha convertido en uno de los soportes del crecimiento. La tecnología no desaparece, pero su despliegue se retrasa varios años, hasta que la capacidad sobrante se absorbe a precios de liquidación.

**Por qué un 30 %.** Las señales de crédito son las peores desde el inicio del ciclo, la dependencia de unos pocos clientes con pérdidas es alta y una parte creciente de la financiación está en mercados opacos. No lo considero el escenario base porque los mayores inversores siguen siendo algunas de las empresas más rentables del mundo y, a 28 de octubre de 2026, no he encontrado impagos relevantes de deuda ligada a la IA.

### Qué vigilar para saber en qué escenario estamos

| Indicador                             | Hoy (octubre de 2026) | Optimista            | Neutral                        | Pesimista                       |
| ------------------------------------- | --------------------- | -------------------- | ------------------------------ | ------------------------------- |
| CDS de CoreWeave a 5 años             | ~1.150 pb             | < 600 pb             | 800–1.500 pb, reestructuración | Impago o canje forzoso          |
| Calificación de Oracle                | BBB− (S&P)            | Se mantiene o mejora | BBB− con perspectiva negativa  | Pierde el grado de inversión    |
| _Capex_ de los hiperescaladores       | Crece cada trimestre  | Sigue creciendo      | Se estabiliza en 2027–28       | Recortes de doble dígito        |
| Precio de alquiler de una GPU         | Al alza en 2026       | Estable              | Cae al encenderse capacidad    | Se desploma por ventas forzosas |
| GPUs a la espera de electricidad      | Racks en almacenes    | Se encienden en 2027 | Retrasos de uno a dos años     | Proyectos cancelados            |
| Plantilla de las grandes tecnológicas | Estancada o a la baja | Se recompone         | Recortes graduales             | Despidos masivos                |

## Conclusión

Si me tuviera que quedar con tres ideas:

1. **La demanda no es el problema; la financiación sí.** CoreWeave crece al 112 % y, aun así, el mercado le cobra como a una empresa en apuros. En los ciclos tecnológicos, quién sobrevive lo decide el coste del dinero, no la calidad de la tecnología.
2. **El cuello de botella se ha movido del chip al enchufe.** GPUs pagadas que esperan en almacenes y precios de alquiler al alza dicen lo mismo: falta capacidad encendida, y la red eléctrica no se construye al ritmo de Nvidia.
3. **Parte de la factura la pagan las plantillas.** Los ingresos de Microsoft crecen un 18 % mientras su plantilla baja. No es una sustitución directa por IA, pero sí una reasignación de recursos de las personas a la infraestructura.

Mi lectura es que estamos más cerca del escenario neutral: una consolidación con daños, en la que algunos financiadores pierden dinero, la infraestructura cambia de manos y la tecnología sigue avanzando. Es lo que ha ocurrido casi siempre. Pero el margen entre el escenario neutral y el pesimista es estrecho, y la diferencia la marcará algo poco visible para el gran público: el mercado de crédito. Por eso, más que los titulares sobre nuevos modelos, en los próximos meses yo vigilaría los diferenciales de los bonos, las calificaciones de Oracle y la velocidad a la que se encienden esas GPUs que hoy esperan en un almacén.

## Para seguir leyendo

- [Burbujas tecnológicas 101](/talks/burbujas-tecnologicas-101/): la charla sobre el patrón histórico de las burbujas, de Minsky al ferrocarril y las telecomunicaciones.
- [FMI · Global Financial Stability Report, octubre de 2026](https://www.imf.org/en/Publications/GFSR): el análisis del riesgo de una corrección de la IA para la estabilidad financiera.
- [Goldman Sachs · How AI debt is reshaping credit markets](https://www.goldmansachs.com/insights/goldman-sachs-exchanges/how-ai-debt-is-reshaping-the-credit-market): una conversación sobre el papel de la deuda en el ciclo actual.

## Referencias

- [Business Insider · Amazon's Nvidia GPUs wait in warehouses as data centers face power shortages (20-oct-2026)](https://www.businessinsider.com/amazon-nvidia-ai-gpu-data-centers-power-shortages-2026-10)
- [Yahoo Finance · Amazon's Nvidia chips are sitting in warehouses without power, Business Insider reports](https://finance.yahoo.com/technology/ai/articles/amazons-nvidia-chips-sitting-warehouses-180630226.html)
- [CoreWeave · CoreWeave Reports Strong Second Quarter 2026 Results](https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Second-Quarter-2026-Results/default.aspx)
- [CNBC · CoreWeave credit default swaps hit distress levels as investors sour on AI debt (15-oct-2026)](https://www.cnbc.com/2026/10/15/coreweave-credit-default-swaps-hit-distress-levels-as-investors-sour-on-ai-debt.html)
- [Benzinga · CoreWeave debt fears hit a grim record (26-oct-2026)](https://www.benzinga.com/markets/bonds/26/10/62603452/coreweave-cds-record-lehman-default-risk)
- [BigGo Finance · CoreWeave's five-year default probability soars; Jensen Huang on financing costs](https://finance.biggo.com/news/7484e05c-561d-43d5-8c9e-95537e5b5688)
- [The Motley Fool · CoreWeave stock is getting crushed (21-oct-2026)](https://www.fool.com/investing/2026/10/21/coreweave-stock-is-getting-crushed-heres-what/)
- [Securitas Global · Oracle's CDS spread hits a record 288 basis points on AI debt](https://www.securitasglobal.com/risk-perspectives/oracle-cds-record-288-basis-points-ai-debt/)
- [24/7 Wall St. · AI cloud stocks sink as Gartner warns most neoclouds won't survive independently (15-oct-2026)](https://247wallst.com/investing/2026/10/15/ai-cloud-stocks-sink-as-gartner-warns-most-neoclouds-wont-survive-independently-iren-and-coreweave-fall-5-nebius-drops-4/)
- [CNBC · Elon Musk says more than 200 neoclouds face 'guppy-level death' (26-oct-2026)](https://www.cnbc.com/2026/10/26/neocloud-stocks-today-coreweave-nebius-iren-elon-musk.html)
- [Startup Fortune · AI neocloud stocks sink as CoreWeave debt fears spread to equities](https://startupfortune.com/ai-neocloud-stocks-sink-as-coreweave-debt-fears-spread-to-equities/)
- [BusinessDay / Reuters · IMF warns of risks from AI market correction and war (13-oct-2026)](https://www.businessday.co.za/world/americas/2026-10-13-imf-warns-of-risks-from-ai-market-correction-and-war/)
- [Goldman Sachs · How AI debt is reshaping credit markets](https://www.goldmansachs.com/insights/goldman-sachs-exchanges/how-ai-debt-is-reshaping-the-credit-market)
- [Forbes · The half-trillion-dollar silicon gamble: inside the AI debt boom (22-oct-2026)](https://www.forbes.com/sites/mayrarodriguezvalladares/2026/10/22/the-half-trillion-dollar-silicon-gamble-inside-the-ai-debt-boom/)
- [TechCrunch · Data centers may face temporary power cuts to prevent blackouts on largest US grid (28-jul-2026)](https://techcrunch.com/2026/07/28/data-centers-may-face-temporary-power-cuts-to-prevent-blackouts-on-largest-us-grid/)
- [IntuitionLabs · H100 rental prices compared across cloud providers (2026)](https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison)
- [Microsoft · Form 10-K, año fiscal 2026 (SEC)](https://www.sec.gov/Archives/edgar/data/0000789019/000119312526323660/msft-20260630.htm)
- [Microsoft · Informes anuales, años fiscales 2007–2025 (SEC EDGAR)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=10-K)
- [Fortune · Microsoft offers buyouts to nearly 30% of workforce in ongoing AI shift (26-oct-2026)](https://fortune.com/2026/10/26/microsoft-offers-buyouts-to-nearly-30-of-workforce-in-ongoing-ai-shift/)
- [CNBC · Microsoft offers voluntary buyouts to 60,000 employees (26-oct-2026)](https://www.cnbc.com/2026/10/26/microsoft-msft-voluntary-buyouts.html)
- [TechCrunch · Microsoft lays off nearly 5,000 employees across Xbox, commercial sales (6-jul-2026)](https://techcrunch.com/2026/07/06/microsoft-lays-off-nearly-5000-employees-across-xbox-commercial-sales/)
- Bloomberg · «Microsoft Headcount Flatlined as Revenue Exploded» (gráfico, octubre de 2026)
- [Charla · Burbujas tecnológicas 101](/talks/burbujas-tecnologicas-101/)
