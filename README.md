# Personal Portfolio

Angular portfolio for Tjorven Burdorf, with public Home, About, Projects, and Contact pages and a protected Accounting and Fuel workspace. Banking and Proximity are currently unavailable.

## Approved design and implementation handoff

- [Implementation specification](docs/design/IMPLEMENTATION-SPEC.md)
- [Ordered plan and route checklist](docs/design/IMPLEMENTATION-PLAN.md)
- [Ready-to-paste model prompt](docs/design/MODEL-PROMPT.md)
- [Design tokens](docs/design/tokens.json)

Run `npm start -- --host 127.0.0.1 --port 4200` to open the public portfolio.
The Portfolio / Workspace switch connects the public pages and guarded tools.
Current content sources are recorded in [portfolio content notes](docs/design/PORTFOLIO-CONTENT.md).
Earlier visual experiments remain preserved in
[future portfolio designs](docs/design/future-portfolio/README.md).
Shared implementation patterns
are documented in [the component guide](docs/design/COMPONENT-GUIDE.md), with
fixture-only component examples preserved in the docs archive; `/ui-kit` is no longer an application route.

Validate the design tokens (including contrast floors), production build, and full
browser test suite with:

```text
npm run check:design-tokens
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Some sandboxed environments require local Chrome flags; see the progress record
for the latest verified command and known external/backend limitations.

Development changes use full-page live reload (`serve.options.hmr: false`).
This avoids retaining chart/grid component state across template replacements.
Restart `npm start` after changing this setting and reload any already-open tabs.
Live reload resets unsaved input, so finish or save edits before changing source files.

To check populated chart and grid rendering with intercepted fixture data, run
`node scripts/check-design-browser.cjs --widgets-only --url=http://127.0.0.1:4200`
against a running development server. This checks actual canvases/grid rows and
captures Angular console errors as well as uncaught exceptions.
