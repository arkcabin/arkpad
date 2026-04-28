# AgentEdit: Architectural Vision

This document outlines the conceptual shift from a standard rich text editor to an **Agentic Editing Platform**.

## 1. The Core Philosophy

We distinguish between two layers of the system:

*   **UIEditor (Headless Engine)**: The foundational layer built on ProseMirror. It handles the "how" of editing—managing the document state, schema, and raw commands. It is entirely headless and agnostic to how it is controlled.
*   **AgentEdit (Agentic Wrapper)**: The intelligence layer. It handles the "what" and "why" of editing. Every request made to the editor passes through this layer, allowing an AI agent to validate, enhance, or automate the editing process.

## 2. The Interception Layer

In a standard editor, a command like `bold` is executed immediately:
`User Click -> runCommand('bold') -> Document Updated`

In **AgentEdit**, we introduce an **Interception Layer**:
`User/System Request -> Interceptor -> Agent Analysis -> Execution/Modification -> Document Updated`

### Key Benefits:
*   **Validation**: The agent can ensure the requested change follows specific style guides.
*   **Automation**: A simple request like "make this look like a professional header" can be expanded by the agent into multiple commands (Bold, Heading 1, specific alignment).
*   **Context Awareness**: The agent can suggest changes based on the surrounding text.

## 3. API Evolution

We will evolve the API to support this agentic workflow:

*   **`editor.runCommand(name, args)`**: Low-level execution (Direct access to the engine).
*   **`editor.request(prompt)`**: High-level intent (Routes through the agent).
*   **`useAgentEditor()`**: A React hook that provides integrated agent status, allowing the UI to show when an agent is "thinking" or "executing."

## 4. Proposed Package Structure

*   **`@agent-edit/core`**: The headless ProseMirror core (formerly Arkpad Core).
*   **`@agent-edit/react`**: React components and hooks for the Agentic experience.
*   **`apps/agent-demo`**: A reference implementation showcasing an AI-driven editing workflow.
