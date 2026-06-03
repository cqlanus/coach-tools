## ADDED Requirements

### Requirement: Umami script is loaded in the app layout
The Next.js layout SHALL include a `<Script>` component loading the Umami tracking script from `https://analytics.chrislanus.com/script.js` with `strategy="afterInteractive"` and `data-website-id` set from `process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID`. The script SHALL only render when the environment variable is non-empty.

#### Scenario: Script loads with valid website ID
- **WHEN** `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set and the page loads
- **THEN** the Umami script is injected after hydration and page views are recorded automatically

#### Scenario: Script absent without website ID
- **WHEN** `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is not set or empty
- **THEN** no script tag is rendered and no tracking requests are made; the app functions normally

### Requirement: A TypeScript ambient declaration types the umami global
A declaration file SHALL define `window.umami` as an optional object with a `track` method, allowing `window.umami?.track(...)` calls to compile without TypeScript errors.

#### Scenario: Event call compiles cleanly
- **WHEN** `window.umami?.track('lineup-generated', { players: 10 })` is called
- **THEN** TypeScript accepts it without error and it no-ops at runtime if the script hasn't loaded
