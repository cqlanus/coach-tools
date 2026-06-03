## ADDED Requirements

### Requirement: Video Library page is accessible at /videos
The app SHALL provide a `/videos` route rendering the Video Library page. The page SHALL use the standard TopNav and page layout consistent with other tools.

#### Scenario: Page renders at /videos
- **WHEN** a user navigates to `/videos`
- **THEN** the Video Library page renders with the TopNav and four category tabs

### Requirement: TopNav includes a Videos entry
The TopNav SHALL include a "Videos" link pointing to `/videos`, consistent in style with the existing nav entries.

#### Scenario: Videos appears in nav
- **WHEN** any page in the app is loaded
- **THEN** "Videos" appears in the top navigation and is highlighted when on the `/videos` route

### Requirement: Four playlist tabs are displayed
The page SHALL display four tab buttons corresponding to the four playlist categories: Hitting, Throwing & Pitching, Catching & Fielding, and Situations. Exactly one tab is active at a time.

#### Scenario: All four tabs visible
- **WHEN** the Video Library page loads
- **THEN** four tab buttons are rendered and the first tab (Hitting) is active by default

#### Scenario: Switching tabs changes the active state
- **WHEN** a coach clicks a tab button
- **THEN** that tab becomes active and its playlist is shown

### Requirement: YouTube playlists are embedded as responsive iframes
Each tab SHALL display a YouTube playlist embed using the `videoseries` format. The embed SHALL fill the available width and maintain a 16:9 aspect ratio on all screen sizes.

#### Scenario: Embed is responsive
- **WHEN** the page is viewed on a narrow screen
- **THEN** the iframe scales down proportionally, maintaining 16:9 aspect ratio without overflow

### Requirement: Iframes are lazy-loaded on first tab activation
A tab's iframe SHALL only be injected into the DOM when that tab is first clicked. Once rendered, it SHALL remain in the DOM and be hidden/shown via CSS when switching tabs, preserving YouTube player state.

#### Scenario: First tab loaded on initial render
- **WHEN** the page first loads
- **THEN** only the Hitting playlist iframe is present in the DOM; other tabs' iframes are not yet rendered

#### Scenario: Iframe persists after tab switch
- **WHEN** a coach clicks the Throwing tab, watches part of a video, then clicks back to Hitting, then back to Throwing
- **THEN** the Throwing iframe is not re-created; the video resumes from where it was

#### Scenario: Other tabs load on first click
- **WHEN** a coach clicks a tab for the first time
- **THEN** that tab's iframe is injected and the video begins loading

### Requirement: Playlist data is defined in a static data file
The four playlist IDs and labels SHALL be defined in `src/data/playlists.ts` rather than inline in the page component. Adding or updating a playlist SHALL require editing only the data file.

#### Scenario: Data file contains all four playlists
- **WHEN** the playlists data file is read
- **THEN** it exports an array of four objects each with `id`, `label`, and `playlistId` fields
