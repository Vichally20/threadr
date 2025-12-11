# 🧵 Threadr - Story Editor

Threadr is a modern, web-based story editor designed for writers and creators who need a visual and structured way to outline their narratives. It utilizes a node-based interface for visualizing complex plot threads and enforces structure using a strict JSON schema for robust data management.

## 🚀 Key Features

* **Visual Storyboarding:** Use a drag-and-drop node interface (powered by React Flow) to map out plot points, character arcs, and narrative timelines.
* **Structured Data:** Enforces data integrity and consistency using a defined JSON schema for all node content (e.g., character details, scene summary, emotional beats).
* **Real-time Collaboration (Future):** Built on a scalable Firebase backend for potential real-time features.
* **Clean Architecture:** Clear separation of concerns for maintainability, testability, and scalability.

## ⚙️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React** with **Vite** | Fast development, component-based UI, and efficient bundling. |
| **Backend/Database** | **Firebase** | Scalable, real-time database (Firestore) for persistent story data. |
| **State Management** | **React Context API** | Centralized, performant, and idiomatic React state management for the application. |
| **Visualization** | **React Flow** | Library for rendering, customizing, and interacting with the node graph interface. |
| **Styling** | **Custom CSS** | Ensures a unique, performant, and bespoke user interface design. |
| **Validation** | **Structured JSON Schema** | Used to define and validate the structure of story data objects (Nodes, Edges, etc.). |

---

## 🏗️ Architecture: Clean Architecture & Repository Pattern

Threadr adheres to **Clean Architecture** principles, dividing the application into three distinct layers to ensure that the core **Domain** logic is independent of external frameworks (Firebase, React).

### Project Structure (Layered)

src/ ├── domain/ # 1. DOMAIN (Core) 
       │ 
       ├── entities/ # Data structures (e.g., Node, Edge, Story) 
       │ 
       ├── repositories/ # Repository Interfaces (e.g., IStoryRepository.ts) │ ├── useCases/ # Business logic operations (e.g., validateNode, createNewStory) ├── data/ # 2. DATA (Infrastructure) │ ├── firebase/ # Firebase configuration and API wrapper │ ├── implementation/ # Concrete repository implementations (e.g., FirebaseStoryRepository.ts) │ └── mappers/ # Functions to map Firebase data to Domain Entities and vice versa ├── presentation/ # 3. PRESENTATION (UI/State) │ ├── components/ # Reusable UI components │ ├── context/ # State management using React Context API (e.g., StoryProvider.tsx) │ ├── hooks/ # Custom hooks for state or logic encapsulation │ └── views/ # Page-level components (e.g., EditorView.tsx) ├── styles/ # Custom CSS files and design tokens └── main.tsx # Application entry point.

       ### Layer Responsibilities

| Layer | Function | React | Location | Technology |
| :--- | :--- | :--- | :--- | :--- |
| **Domain (Core)** | Business Rules (e.g., Node validation, Graph analysis, Data structure definitions). | No | `src/domain/` | Pure JavaScript/TypeScript. |
| **Data (Infra)** | External Implementations (Firebase API calls, JSON parsing, Repository implementation). | No | `src/data/` | Firebase SDK, Repository Implementation. |
| **Presentation (UI/State)** | View Components, State Management. | Yes | `src/presentation/` | React Components, Context API, React Flow. |

### The Repository Pattern

The **Repository Pattern** is used to abstract the data layer.

1.  **Interface (Domain Layer):** The `src/domain/repositories/` directory defines interfaces (contracts) for data operations (e.g., `getStoryById(id: string)`, `saveStory(story: Story)`).
2.  **Implementation (Data Layer):** The `src/data/implementation/` directory provides the concrete implementation of these interfaces, specifically interacting with the **Firebase SDK** to handle Firestore CRUD operations.
3.  **Benefit:** This allows us to swap out Firebase for another database (e.g., local storage, PostgreSQL) without changing any code in the `domain` or `presentation` layers.

---

## 🛠️ Getting Started

### Prerequisites

* Node.js (LTS version)
* npm or yarn
* A Firebase Project with Firestore enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPO_URL]
    cd threadr
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration
?????
### Running Locally

```bash
npm run dev
# or
yarn dev

The application will typically be available at http://localhost:5173.

🤝 Contributing
We welcome contributions! Please see the CONTRIBUTING.md file (to be created) for guidelines on how to submit pull requests, report issues, and follow the project's coding standards.

©️ License