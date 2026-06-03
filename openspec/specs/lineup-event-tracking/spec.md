## ADDED Requirements

### Requirement: lineup-generated event fires on successful rotation generation
When `generateLineup()` returns valid assignments (non-empty), a `lineup-generated` event SHALL be tracked with properties: `players` (batting order length), `innings`, `repeats` (from result), `has_locks` (boolean — any locked field positions set), `has_specs` (boolean — any player specializations set).

#### Scenario: Event fires with metadata after successful generation
- **WHEN** the coach clicks "Generate Rotation" and valid assignments are produced
- **THEN** `window.umami?.track('lineup-generated', { players, innings, repeats, has_locks, has_specs })` is called

#### Scenario: Event does not fire on conflict errors
- **WHEN** generation produces no valid assignments (conflict errors only)
- **THEN** no `lineup-generated` event is fired

### Requirement: docx-exported event fires on successful docx download
When the API returns a download URL and `setDownloadUrl` is called, a `docx-exported` event SHALL be tracked with no additional properties.

#### Scenario: Export event fires on success
- **WHEN** the coach clicks "Export .docx" and the API responds successfully
- **THEN** `window.umami?.track('docx-exported')` is called

### Requirement: file-imported event fires when a lineup file is loaded
When `handleImport()` successfully parses a file and applies it to form state, a `file-imported` event SHALL be tracked with no additional properties.

#### Scenario: Import event fires after successful parse
- **WHEN** the coach pastes a file and clicks "Load" and parsing succeeds
- **THEN** `window.umami?.track('file-imported')` is called

### Requirement: lineup-loaded-from-history event fires when a saved lineup is loaded
When `handleLoad()` is called with a saved lineup, a `lineup-loaded-from-history` event SHALL be tracked with no additional properties.

#### Scenario: History load event fires
- **WHEN** the coach clicks "Load" on a previous lineup entry
- **THEN** `window.umami?.track('lineup-loaded-from-history')` is called

### Requirement: Export format events fire when the current state is copied
When `handleExport('markdown')` or `handleExport('org')` successfully copies to the clipboard, the corresponding event SHALL be tracked.

#### Scenario: Markdown export tracked
- **WHEN** the coach clicks "Copy as Markdown" and the clipboard write succeeds
- **THEN** `window.umami?.track('lineup-exported-markdown')` is called

#### Scenario: Org export tracked
- **WHEN** the coach clicks "Copy as Org" and the clipboard write succeeds
- **THEN** `window.umami?.track('lineup-exported-org')` is called
