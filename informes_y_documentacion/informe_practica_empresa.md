# INFORME DE FORMACIÓN PRÁCTICA EN EMPRESA

## 1. Tarea más significativa durante las dos semanas
**Nombre de la tarea:** Desarrollo e Integración de Prototipo Base (MVP) para Sistema Omnicanal de Gestión de Pedidos mediante Inteligencia Artificial.

* **¿Por qué eligió esta tarea?** 
Se eligió esta tarea por ser un pilar crítico en la transformación digital de las ventas de la empresa. Sienta la base tecnológica y la arquitectura de infraestructura que permite automatizar por primera vez la recepción de pedidos a través de WhatsApp, minimizando errores humanos al centralizar todo hacia un panel web en tiempo real.

* **Operaciones del PEA cumplidas con su ejecución (aplicables al desarrollo de software):**
1. Análisis de requerimientos técnicos y conceptualización de sistemas.
2. Diseño, modelado y administración de Bases de Datos Relacionales en entornos Cloud.
3. Desarrollo de aplicaciones de Front-End empleando frameworks modernos (React, Vite).
4. Implementación y consumo sincrónico de APIs y Webhooks REST.
5. Despliegue de software, integración continua y gestión de ramas de repositorios (Git/GitHub/CI-CD).

---

## 2. Descripción del proceso (Secuencia lógica)

**Paso 1: Aprovisionamiento de Bases de Datos Cloud**
* *Sub paso:* Configuración de proyecto en Supabase (PostgreSQL en la Nube).
* *Sub paso:* Generación de sentencias para la construcción del esquema, creando las tablas iniciales `pedidos` y `productos`.
* *Sub paso:* Emisión de credenciales seguras de conexión (Anon Keys y DB URLs) y configuración preliminar de políticas RLS.

**Paso 2: Despliegue de Infraestructura y Orquestación (Backend)**
* *Sub paso:* Implementación de entornos de alojamiento en la plataforma Render para servicios empaquetados.
* *Sub paso:* Despliegue continuo de *Evolution API* para abstraer el flujo oficial de WhatsApp.
* *Sub paso:* Instalación de un servidor autónomo de *n8n* enfocado en la automatización de túneles de información (Webhooks).

**Paso 3: Configuración Lógica del Agente de Inteligencia Artificial**
* *Sub paso:* Enlace del orquestador n8n hacia motores de modelos masivos de lenguaje (OpenRouter API) usando el framework nativo Langchain incorporado.
* *Sub paso:* Ingeniería de instrucciones (*Prompting* estructurado) para restringir el comportamiento del bot de ventas.
* *Sub paso:* Creación de Herramientas (*Tools*) de IA que le permiten al agente leer el catálogo e insertar filas SQL, resolviendo errores de contexto en memoria y paso de parámetros estables entre nodos.

**Paso 4: Construcción PWA (Progressive Web App) del Panel de Control (Frontend)**
* *Sub paso:* Inicialización de un proyecto monolítico superficial basado en React.js y el motor Vite.
* *Sub paso:* Maquetado del panel visual (Dashboard interactivo). Se utilizó y afinó la librería Tailwind CSS para estandarizar estilos globales, reparando herencias CSS y diseñando rutinas lógicas para admitir Modo Oscuro nativo a nivel administrador.
* *Sub paso:* Conexión real (vía cliente `@supabase/supabase-js`) para listar e interactuar con el *stock* de zapatos de manera inmediata.

**Paso 5: Puesta en Producción (Despliegue y Distribución)**
* *Sub paso:* Transformación estática de la página inicial en componente instanciable (*Service Workers / Manifest.json*) para instalación local similar a una aplicación de escritorio (PWA).
* *Sub paso:* Configuración inicial del control de versión local mediante `git` e indexado total del código fuente.
* *Sub paso:* Vinculación al sistema de Integración Continua de Vercel (CI/CD) desde un repositorio de Github para despliegue global.

---

## 3. Máquinas, equipos, herramientas y materiales

* **Entornos de Alojamiento (Cloud & PaaS):**
  * Servidores en nube de Render (Ejecución y aislamiento de n8n y Evolution API).
  * Servidores Edge de Vercel (Alojamiento sin servidor del UI Frontend / Despliegue).
  * Supabase Cloud Platform (Software como servicio para la BD).
  * Github (Sistema de control y almacenamiento de código).

* **Software, Lenguajes y Frameworks (Desarrollo):**
  * Entorno de Edición / Terminal: Visual Studio Code, intérprete CLI.
  * Node.js / NPM (Entorno de ejecución de servidor).
  * Tecnologías de lenguajes base: JavaScript moderno (ES6), CSS3, HTML5 PWA.
  * Frameworks de Interfaz: React.js de Meta y librería construccional Vite.
  * Frameworks de Estilo: Tailwind CSS y Lucide-React (vectoriales).
  * Integración de API: `@supabase/supabase-js` (Cliente HTTP).

* **Hardware Físico:**
  * Estación de trabajo o computador portátil local para el flujo diario del desarrollador e inspección web (`localhost:5173`).

*(Nota de redacción: La sección de Seguridad e higiene industrial ha sido completamente omitida acorde al giro de la carrera técnica, ya que es 100% de desarrollo de software lógico).*

---

## 4. Resultados de la ejecución de la tarea / Recomendaciones

**Resultados obtenidos:**
Se logró completar y verificar exitosamente el objetivo motivador. El Prototipo Base se encuentra operando en cadena ininterrumpida sin caídas. Actualmente el ciclo completo funciona de manera técnica: es capaz de recibir una consulta orgánica de cliente por el teléfono físico de la empresa (vía WhatsApp), derivarla en tiempo sub-segundo al agente n8n que interpreta la necesidad real usando modelos de lenguaje natural (IA), inserta filas validadas en la estructura PostgreSQL (Supabase), las cuales a su vez, aparecen renderizadas en directo bajo la moderna plataforma global provista por Vercel.

**Recomendaciones sugeridas para operatividad:**
1. **Refactorización Planificada:** Dado que fue construido estrictamente bajo pautas de "Prototipo Base de Funcionalidad Técnica" (Prueba de Concepto), recomiendo imperativamente realizar una reconstrucción esquemática profunda en la Base de Datos para fases posteriores, donde logre absorber catálogos en escalera en vez de valores planos de inventario (Ej. atributos de talla, variaciones y curados).
2. **Estandarización de Modelos del Agente:** Emplear modelos comerciales confiables y predecibles (de menor alucinación) en la plataforma del Agente. Los modelos gratuitos y no controlados impactan dramáticamente las herramientas conversacionales, causando inserciones mal estructuradas o variables no esperadas (undefined) como fue registrado en pruebas pre-lanzamiento.
3. **Control de Recursos Paralelos:** Supervisar continuamente el consumo de Memoria RAM de las instancias virtuales de `n8n` y `Evolution API` en la plataforma Render, contemplando moverlos a contenedores propios de alto rendimiento en caso de incrementar la frecuencia transaccional simultánea.
