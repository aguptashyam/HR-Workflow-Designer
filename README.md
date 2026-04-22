# HR Workflow Designer Module

A Next.js + React Flow based assessment project for visually designing and simulating HR process workflows (for example onboarding, approvals, and automation-backed tasks).

## Introduction

This module provides a drag-and-drop workflow editor where users can:

- compose a graph of HR steps,
- configure each node through type-specific forms,
- validate graph/business constraints,
- run a simulation using mock APIs,
- review execution logs in a modal.

The implementation prioritizes delivery speed, clean modular architecture, and extensibility for future node types and backend integration.

## Features

### Workflow Canvas (React Flow)

- Drag-and-drop node creation from a left sidebar palette
- Five custom node types:
  - Start
  - Task
  - Approval
  - Automated Step
  - End
- Node connection via edges and handle-based linking
- Node/edge deletion with Delete/Backspace
- Fit-view startup behavior with minimap and controls
- Node selection for opening configuration panel

### Node Configuration Forms

- Start: title + metadata key-value pairs
- Task: title, description, assignee, due date, custom fields
- Approval: title, approver role, auto-approve threshold
- Automated Step: title, action + dynamic params fetched from API
- End: end message + generate summary flag

### Validation + Execution

- Structural validation checks:
  - single Start node
  - Start has no incoming edges
  - End has no outgoing edges
  - cycle prevention
  - connectivity from Start path
- Node-level semantic checks (for example missing assignee/action)
- Workflow simulation through mock API endpoint
- Execution log modal with success/failure state and timeline

### Import / Export

- Export current workflow to JSON
- Import workflow JSON with schema/shape validation
- Confirmation prompts before destructive actions

## Architecture

### Project Structure

```text
app/
  api/
    automations/
      route.ts
    simulate/
      route.ts
  globals.css
  layout.tsx
  page.tsx

components/
  canvas/
    WorkflowCanvas.tsx
  panels/
    ExecutionLogModal.tsx
    NodeConfigPanel.tsx
    SimulationPanel.tsx
    WorkflowToolbar.tsx
  sidebar/
    NodeSidebar.tsx

hooks/
  useNodeConfig.ts
  useSimulation.ts
  useWorkflowState.ts

nodes/
  ApprovalNode.tsx
  AutomatedNode.tsx
  EndNode.tsx
  StartNode.tsx
  TaskNode.tsx

types/
  workflow.ts

utils/
  graphUtils.ts
  templates.ts
  validation.ts
```

### Design Decisions

1. Graph state is centralized in a custom hook (`useWorkflowState`) for predictable mutations and business-rule guards.
2. Form handling is centralized in `NodeConfigPanel` with `react-hook-form` for dynamic, type-aware fields.
3. Domain contracts are strongly typed in `types/workflow.ts` to keep API, nodes, and forms aligned.
4. Validation logic is extracted into utilities (`utils/validation.ts`) instead of being embedded in UI components.
5. Simulation and automations are consumed through dedicated hooks (`useSimulation`, `useNodeConfig`) for clean async abstraction.
6. API routes in `app/api/*` mirror backend boundaries and can be replaced by real services with minimal UI changes.

### Scalability Considerations

- Adding a new node type requires isolated updates in known extension points:
  - type/config in `types/workflow.ts`
  - visual component in `nodes/`
  - node mapping in `WorkflowCanvas.tsx`
  - form branch in `NodeConfigPanel.tsx`
  - validation and simulation rules
- Utilities keep graph algorithms independent from rendering.
- Hook abstraction allows swapping mock endpoints with real APIs later.
- Folder layout separates concerns by behavior and feature domain.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000`.

### How to run checks before submission

```bash
npm run lint
npm run build
```

## Usage

### Creating a Workflow

1. **Start the Canvas**: Open the application in your browser. You will see an empty canvas on the right side and a sidebar of available node types on the left.
2. **Add a Start Node**: Drag the **Start** node from the left sidebar onto the canvas. Every workflow must begin with a Start node. This node will contain metadata about the workflow (title, key-value pairs).
3. **Add Process Nodes**: Drag additional node types (**Task**, **Approval**, **Automated Step**) onto the canvas to model your workflow steps in sequence.
4. **End Your Workflow**: Drag an **End** node onto the canvas as the final step. This closes the workflow and can generate a summary message.
5. **Organize Layout**: Drag nodes around the canvas to arrange them in a logical top-to-bottom or left-to-right flow. There is no enforced positioning; organize as you see fit.

### Connecting Nodes

1. **Identify Handles**: Each node displays small circular ports on its sides—these are connection handles. The left side is the input; the right side is the output.
2. **Create Edges**: Click and drag from an output handle (right side) of one node to the input handle (left side) of another node to create a directed edge.
3. **Verify Connection**: Once released, a line connecting the two nodes appears on the canvas.
4. **Delete Edges**: Click on any edge to select it, then press **Delete** or **Backspace** to remove the connection.
5. **Linear Flow Assumption**: By default, the workflow is sequential (one path from Start to End). Each node should have exactly one outgoing edge, except for the End node which has none.

### Editing Nodes

1. **Select a Node**: Click on any node on the canvas. The node will highlight to show it is selected.
2. **Open Configuration Panel**: When a node is selected, a detailed configuration panel appears on the right side of the screen. This panel is specific to the node type.
3. **Edit Based on Node Type**:
   - **Start Node**: Enter a workflow title and add optional key-value metadata pairs (e.g., department = HR, season = Q1).
   - **Task Node**: Fill in title, description, assignee name, due date, and any custom fields relevant to the task.
   - **Approval Node**: Set the approver role, configure the auto-approve threshold (percentage of votes required), and add approval instructions.
   - **Automated Step Node**: Select an action from a dropdown (fetched dynamically from a mock API) and configure action-specific parameters.
   - **End Node**: Enter a closing message and optionally enable a "generate summary" flag to collect workflow results.
4. **Submit Changes**: Changes in the configuration panel are saved automatically. Use the form to mark fields as complete.
5. **Deselect**: Click on an empty area of the canvas or press **Escape** to deselect a node and close the configuration panel.

### Testing Workflows

1. **Prepare Your Workflow**: Ensure your workflow is logically complete (Start → nodes → End) before testing.
2. **Run Simulation**: Click the **Run Workflow** button in the top toolbar to initiate a simulation of the workflow.
3. **Mock Execution**: The application calls a mock simulation API (`/api/simulate`) that processes your workflow step-by-step and generates synthetic execution results.
4. **Review Results**: After simulation, an **Execution Log** modal appears showing:
   - Overall workflow status (Success or Failure)
   - Timeline of each step with timestamps
   - Step-by-step results and outputs
   - Any error messages or warnings
5. **Close Modal**: Click the **X** button in the top-right corner of the modal to close the execution log and return to editing.

### Validating Workflows

1. **Structural Validation** (automatic before simulation):
   - Ensures exactly **one Start node** exists
   - Ensures Start node has **no incoming edges**
   - Ensures End node has **no outgoing edges**
   - Checks for **cycles** (loops) in the graph
   - Verifies **connectivity** from Start to End via a valid path
2. **Semantic Validation** (node-level checks):
   - Start node must have a title
   - Task nodes must have a title and an assignee
   - Approval nodes must have an approver role
   - Automated Step nodes must have an action selected
   - End nodes must have a closing message
3. **Error Feedback**: If validation fails, an alert displays the specific error. Fix the issue(s) and try again.
4. **Manual Review**: Even if validation passes, review your workflow logic to ensure it makes business sense for your HR process.

### Visual Feedback and Indicators

1. **Node Selection**: Selected nodes display a blue highlight border, making it clear which node's configuration is open.
2. **Canvas Status**: The minimap (bottom-right corner) shows an overview of your entire workflow layout and your current viewport.
3. **Fit View**: Click the **Fit View** button in the toolbar to automatically zoom and pan to show all nodes on screen.
4. **Zoom Controls**: Use the mouse wheel to zoom in/out, or use the zoom buttons (+/-) in the bottom-right control panel.
5. **Pan**: Click and drag on empty canvas space to pan around.
6. **Visual Node Styling**: Different node types have distinct visual appearance (color, icon, label) to help distinguish workflow stages at a glance.

### Export/Import Workflows

#### **Exporting a Workflow**

1. **Click Export**: Press the **Export** button (down-arrow icon) in the top toolbar.
2. **File Download**: Your workflow is exported as a JSON file and automatically downloaded to your default download folder. The filename includes a timestamp for easy identification.
3. **JSON Structure**: The exported JSON contains the full workflow definition (nodes, edges, and configurations) in a portable format.
4. **Share or Backup**: Use the exported JSON file to share workflows with colleagues or backup your progress.

#### **Importing a Workflow**

1. **Click Import**: Press the **Import** button (up-arrow icon) in the top toolbar.
2. **Select File**: A file picker dialog opens. Navigate to and select a previously exported workflow JSON file.
3. **Replace Current Workflow**: If a workflow is already on the canvas, you will be prompted to confirm that you want to replace it. Click **OK** to proceed or **Cancel** to abort.
4. **Validation on Import**: The application validates the imported JSON against the expected schema. If the file is malformed or incompatible, an error alert is shown and the import is rejected.
5. **Resume Editing**: Once imported, the workflow appears on the canvas ready for editing or testing.

### Clearing the Canvas

1. **Clear Workflow**: Click the **Clear** button in the top toolbar to remove all nodes and edges from the canvas.
2. **Confirmation**: You will be prompted to confirm the action. Click **OK** to clear or **Cancel** to keep your workflow.
3. **Fresh Start**: After clearing, the canvas is blank and ready for a new workflow design.

### Workflow Templates

1. **Load a Template**: Click the **Load Template** dropdown in the top toolbar to see available sample workflows (e.g., "Onboarding", "Simple Approval").
2. **Preview**: Select a template to load a pre-built workflow onto the canvas.
3. **Customize**: Templates serve as starting points. Edit the nodes, add/remove steps, and configure parameters to match your specific process.

### Keyboard Shortcuts

1. **Delete Node/Edge**: Select a node or edge and press **Delete** or **Backspace** to remove it.
2. **Canvas Navigation**: Use arrow keys to pan the canvas or Ctrl/Cmd + mouse wheel to zoom.
3. **Deselect**: Press **Escape** to deselect the currently selected node.

## Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- React Flow
- React Hook Form
- ESLint

## Completed Features

- End-to-end React Flow editor with custom node rendering
- Typed dynamic form configuration per node type
- Edge management and graph mutation constraints
- Workflow validation (structural + semantic)
- Mock API integration for automations and simulation
- Execution log modal and run-state reporting
- JSON import/export flow with replacement confirmation
- Onboarding template bootstrap
- Responsive UI and modular folder architecture



## Future Enhancements (Not Implemented)

- Robust undo/redo with complete history guarantees
- Conditional branching and path-based execution semantics
- Better key-value UX (row remove/reorder and type hints)
- Additional templates (leave flow, verification flow, escalation flow)
- Unit/integration test suite for graph rules and core user journeys
- Persistent workflow storage + retrieval from backend
- Multi-user collaboration and role-based permissions

## Assumptions

1. This is an assessment-grade prototype with mock API routes.
2. A valid workflow should have a single Start and connected path.
3. Simulation is deterministic and intentionally simplified.
4. Browser target is modern Chromium/Firefox/Safari environments.

## Known Limitations

1. No persistent database layer.
2. No advanced branching/parallel execution semantics.
3. No automated end-to-end test coverage yet.
4. Import error messaging is minimal and intentionally non-intrusive.

## What Was Completed vs What Would Be Added With More Time

### Completed

- Production-style modular architecture
- React Flow custom nodes + edge management
- Complex dynamic node forms + validation
- Mock API interaction patterns with hooks
- Extensible utilities/types structure

### With More Time

- Comprehensive test automation
- Full workflow history (undo/redo)
- Better authoring ergonomics and governance features
- Real backend persistence and collaboration features

## License

This is a prototype/demo project for assessment purposes only.
