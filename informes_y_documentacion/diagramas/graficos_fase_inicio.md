# Diagramas Técnicos: Fase de Inicio (ERP Emssa Valems)

Este documento contiene los gráficos técnicos sugeridos para el Capítulo 4 de la documentación del proyecto de innovación.

## 1. Diagrama de Casos de Uso (Funcionalidad por Roles)

Este diagrama visualiza cómo interactúan los diferentes actores con el sistema omnicanal.

```mermaid
graph LR
    subgraph "Actores"
        G((Gerente))
        O((Operario))
        C((Cliente))
    end

    subgraph "Sistema ERP"
        UC1(Gestionar Insumos)
        UC2(Crear Recetas BOM)
        UC3(Consultar Stock)
        UC4(Realizar Pedido AI)
        UC5(Ver Reportes)
    end

    G --> UC1
    G --> UC2
    G --> UC3
    G --> UC5
    O --> UC3
    C --> UC4
```

---

## 2. Diagrama de Arquitectura Conceptual (Ecosistema Tecnológico)

Muestra el flujo de datos entre la Inteligencia Artificial, la Base de Datos y la Interfaz Web.

```mermaid
graph TD
    subgraph "Canales"
        A[Dashboard React]
        B[WhatsApp]
    end

    subgraph "Lógica e IA"
        C[Evolution API]
        D[Node.js Vercel]
        E[Gemini AI]
    end

    subgraph "Datos"
        F[(Supabase DB)]
    end

    A <--> D
    B <--> C
    C <--> D
    D <--> E
    D <--> F
```
