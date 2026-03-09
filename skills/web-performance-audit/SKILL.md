---
name: web-performance-audit
description: "Web performance and Lighthouse audits. Use when checking storefront performance, Core Web Vitals, accessibility, SEO, or best practices. Triggers on: performance audit, Lighthouse, PageSpeed, Core Web Vitals, LCP, CLS, INP, accessibility check."
compatibility: "chrome-devtools MCP"
---

# Web Performance Audit

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references in scope).

Run Lighthouse audits and performance traces on web pages using Chrome DevTools MCP. Covers accessibility, SEO, best practices, and Core Web Vitals (LCP, INP, CLS).

## When to Use

- Auditing storefront or web app performance
- Checking Core Web Vitals (LCP, INP, CLS)
- Running Lighthouse accessibility, SEO, or best-practices audits
- Debugging slow page loads or layout shifts
- Comparing mobile vs desktop performance

## Prerequisites

- **Chrome DevTools MCP** must be installed (bundled via plugin `.mcp.json`)
- **Node.js** v20.19+
- **Chrome** (stable or newer)
- **npm** (for `npx`)

When Chrome DevTools MCP is unavailable, inform the user to install it and ensure Chrome is installed.

## Workflow

### 1. Navigate to the URL

Use `navigate_page` with `type: "url"` and the target URL, or `new_page` to open in a new tab.

### 2. Choose Audit Type

| Goal | Tool | Notes |
|------|------|-------|
| Accessibility, SEO, best practices | `lighthouse_audit` | Excludes performance; use `device: "mobile"` or `"desktop"` |
| Performance, Core Web Vitals | `performance_start_trace` | Set `reload: true` for fresh load; `autoStop: true` recommended |
| Detailed performance insight | `performance_analyze_insight` | Use after trace; requires `insightSetId` and `insightName` from trace results |

### 3. Run the Audit

- **Lighthouse**: Call `lighthouse_audit` with `mode: "navigation"` to reload and audit, or `mode: "snapshot"` to audit current state.
- **Performance**: Call `performance_start_trace` with `reload: true`, `autoStop: true`. Navigate to the URL first if needed.

### 4. Summarize Results

Present scores, metrics, and actionable recommendations. For performance traces, highlight Core Web Vitals (LCP, INP, CLS) and any insight sets.

## Tool Reference (Chrome DevTools MCP)

| Category | Tool | Purpose |
|---------|------|---------|
| **Performance** | `performance_start_trace` | Start trace; Core Web Vitals, LCP, INP, CLS |
| **Performance** | `performance_stop_trace` | Stop active trace |
| **Performance** | `performance_analyze_insight` | Deep dive on specific insight from trace |
| **Performance** | `take_memory_snapshot` | Capture heap for memory leak debugging |
| **Debugging** | `lighthouse_audit` | Accessibility, SEO, best practices (excludes performance) |
| **Navigation** | `navigate_page` | Go to URL, back, forward, reload |
| **Navigation** | `new_page` | Open URL in new tab |
| **Debugging** | `take_snapshot` | Text snapshot of page (a11y tree) |
| **Debugging** | `take_screenshot` | Screenshot of page or element |
| **Network** | `list_network_requests` | List requests since last navigation |
| **Network** | `get_network_request` | Get request/response details |
| **Emulation** | `emulate` | Throttle network, CPU, viewport, device |
| **Emulation** | `resize_page` | Resize viewport |

## Error Handling

- **MCP unavailable**: Tell the user Chrome DevTools MCP is required; link to [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp).
- **Chrome not found**: User must install Chrome and ensure it is on PATH.
- **No page selected**: Use `list_pages` then `select_page` before running audits.
- **Trace not started**: Call `performance_start_trace` before `performance_stop_trace` or `performance_analyze_insight`.

## References

- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Core Web Vitals](https://web.dev/articles/vitals)
