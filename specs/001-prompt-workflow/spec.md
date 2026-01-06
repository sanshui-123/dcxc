# Feature Specification: Prompt Management and Rewrite Selection

**Feature Branch**: `001-prompt-workflow`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "Add a prompt management entry and page, allow creating/editing/deleting/reordering prompts, and select a prompt per article during rewrite. Default to the first prompt. Use template placeholders such as {{title}}/{{sourceUrl}}/{{html}}."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage prompts (Priority: P1)

As a content operator, I can create, edit, delete, and reorder prompts so the team can maintain multiple rewrite styles.

**Why this priority**: Prompt control is the core of the rewrite workflow and must be stable before automation.

**Independent Test**: Open `/prompts`, create a prompt, edit its content, move it up/down, delete it, and confirm order updates.

**Acceptance Scenarios**:

1. **Given** no prompts exist, **When** I open `/prompts`, **Then** a default prompt is available and selectable.
2. **Given** multiple prompts, **When** I move one up or down, **Then** the order is updated and the first prompt becomes default.
3. **Given** more than one prompt, **When** I delete a prompt, **Then** it is removed and the remaining prompts persist.

---

### User Story 2 - Select prompt per article (Priority: P1)

As a content operator, I can pick a prompt for each article card so that the rewrite uses the chosen template.

**Why this priority**: Different topics need different rewrite instructions; per-article selection prevents mix-ups.

**Independent Test**: Fetch articles, choose different prompts per article, rewrite each, and confirm output changes.

**Acceptance Scenarios**:

1. **Given** a list of articles, **When** I open a prompt selector on an article card, **Then** the first prompt is selected by default.
2. **Given** I change the prompt selector, **When** I click rewrite, **Then** the rewrite uses that prompt template.

---

### User Story 3 - Persist prompts (Priority: P2)

As a content operator, I can refresh or restart the app without losing prompts.

**Why this priority**: Prompt definitions are operational data and must persist across sessions.

**Independent Test**: Create a prompt, restart the server, and confirm the prompt still exists.

**Acceptance Scenarios**:

1. **Given** prompts exist, **When** I refresh the page, **Then** the prompt list and order are preserved.
2. **Given** no prompts exist, **When** I fetch prompts, **Then** a default prompt is created server-side.

---

### Edge Cases

- What happens when there are no prompts and a rewrite is requested?
- How does the system handle invalid or missing template placeholders?
- What happens when a prompt is deleted while selected for an article?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide CRUD operations for prompt templates.
- **FR-002**: The system MUST allow reordering prompts and use the first prompt as default.
- **FR-003**: Users MUST be able to select a prompt per article before rewriting.
- **FR-004**: The rewrite request MUST render the selected template with placeholders `{{title}}`, `{{sourceUrl}}`, and `{{html}}`.
- **FR-005**: The system MUST surface prompt load or rewrite errors to the user.
- **FR-006**: Prompt templates MUST be persisted server-side.

### Key Entities *(include if feature involves data)*

- **Prompt**: id, name, template, sortOrder, createdAt, updatedAt.
- **PromptSelection**: per-article UI selection state (client-side only).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and save a prompt in under 1 minute.
- **SC-002**: Reordering prompts changes the default selection immediately.
- **SC-003**: Rewriting with different prompts produces distinct outputs for the same article.
