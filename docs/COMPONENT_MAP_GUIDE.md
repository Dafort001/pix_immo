# Component Map Guide

## ✅ Quick Start

### Option 1: Direct Command (Recommended)
```bash
tsx tools/component-map.ts
```

### Option 2: Shell Script
```bash
./audit-components.sh
```

### Option 3: NPM Script (Manual Setup Required)

**Step 1**: Open `package.json` manually

**Step 2**: Add to `"scripts"` section:
```json
"audit:components": "tsx tools/component-map.ts"
```

**Step 3**: Run:
```bash
npm run audit:components
```

> ⚠️ **Note**: Replit Agent cannot edit `package.json` automatically to prevent environment breakage.

---

## 📊 Generated Outputs

### 1. JSON Map (`docs/component_map.json`)

**Format**: Bidirectional mapping structure

```json
{
  "components": {
    "SEOHead": ["/about", "/kontakt", "/", ...],
    "WebHeader": ["/portal/uploads", "/portal/delivery/:jobId", ...],
    "BottomNav": ["/app/camera", "/gallery", ...]
  },
  "routes": {
    "/": ["SEOHead", "SchemaTemplates"],
    "/about": ["SEOHead"],
    "/app/camera": ["StatusBar", "BottomNav", "HapticButton", ...]
  },
  "statistics": {
    "totalComponents": 27,
    "totalRoutes": 50,
    "averageComponentsPerRoute": 1.3,
    "mostUsedComponents": [
      { "component": "SEOHead", "count": 19 },
      { "component": "WebHeader", "count": 5 }
    ]
  }
}
```

**Key Features**:
- **components**: Maps each component to all routes that use it
- **routes**: Maps each route to all components it imports
- **statistics**: Aggregated metrics

**Use Cases**:
- Automated testing: Know which routes to test when a component changes
- Refactoring: Find all usages of a component
- Dead code detection: Find unused components (`routes: []`)
- Impact analysis: Understand blast radius of changes

### 2. Markdown Report (`docs/component_map.md`)

**Format**: Human-readable documentation

**Sections**:
1. **Statistics** - Overview metrics
2. **Top 10 Most Used Components** - Ranked table
3. **Component → Routes Mapping** - Alphabetical list
4. **Routes → Components Mapping** - Alphabetical list

**Example**:

```markdown
## 🏆 Top 10 Most Used Components

| Rank | Component | Usage Count | Routes |
|------|-----------|-------------|--------|
| 1 | `SEOHead` | 19 | /about, /kontakt, /datenschutz, ... (+16) |
| 2 | `WebHeader` | 5 | /portal/delivery/:jobId, ... (+2) |
| 3 | `BottomNav` | 5 | /app/camera, /gallery, ... (+2) |

### `SEOHead`

- /about
- /kontakt
- /datenschutz
- ...
```

**Use Cases**:
- Code reviews: See component usage patterns
- Documentation: Understand component hierarchy
- Onboarding: Help new devs understand structure
- Stakeholder reports: Show component reuse metrics

---

## 🔍 How It Works

### 1. Component Discovery

Scans `client/src/components/**/*.{ts,tsx}` for exports:

```typescript
// Finds these patterns:
export function ComponentName() { ... }
export const ComponentName = () => { ... }
export default function ComponentName() { ... }
```

### 2. Route Discovery

Parses `client/src/App.tsx` for route definitions:

```typescript
<Route path="/about" component={About} />
```

### 3. Import Analysis

For each page in `client/src/pages/**/*.tsx`:

**Named imports**:
```typescript
import { Button, Card } from '@/components/ui';
```

**Default imports**:
```typescript
import SEOHead from '@/components/SEOHead';
```

**JSX usage** (fallback):
```typescript
<Button /> // Adds 'Button' if not already imported
```

### 4. Bidirectional Mapping

Creates two-way lookup:
- **Component → Routes**: "Which pages use this component?"
- **Route → Components**: "Which components does this page use?"

---

## 📈 Current Stats (2025-10-28)

```
🗺️  Component Map Tool

📂 Scanning components: /home/runner/workspace/client/src/components
📂 Scanning pages: /home/runner/workspace/client/src/pages

✅ Analysis complete

📊 Statistics:
   - Components found: 27
   - Routes analyzed: 50
   - Avg components/route: 1.3

📄 Wrote: /home/runner/workspace/docs/component_map.json
📄 Wrote: /home/runner/workspace/docs/component_map.md

🏆 Top 5 Components:
   1. SEOHead (19 routes)
   2. WebHeader (5 routes)
   3. BottomNav (5 routes)
   4. HapticButton (5 routes)
   5. StatusBar (5 routes)

✨ Done!
```

---

## 🎯 Use Cases

### 1. Refactoring Analysis

**Question**: "If I change `SEOHead`, which routes are affected?"

**Answer**:
```bash
# Check JSON
cat docs/component_map.json | grep -A 20 '"SEOHead"'

# Or read Markdown
grep -A 20 "### \`SEOHead\`" docs/component_map.md
```

**Result**: 19 routes use `SEOHead` → Plan testing for all 19.

### 2. Dead Code Detection

**Question**: "Which components are not being used?"

**Answer**:
```json
{
  "MasonryGrid": []  // Not used in any route!
}
```

**Action**: Consider removing or documenting why it's kept.

### 3. Impact Analysis

**Question**: "How many routes will break if I delete `BottomNav`?"

**Answer**: 5 routes → Review each before deletion.

### 4. Testing Strategy

**Question**: "Which components need the most regression testing?"

**Answer**: Top 3 components (`SEOHead`, `WebHeader`, `BottomNav`) are used most → Prioritize.

### 5. Documentation

**Question**: "Show stakeholders component reuse metrics"

**Answer**: Average 1.3 components per route → Good modularity.

---

## 🔧 Advanced Usage

### Filter by Component Type

```bash
# Find all Mobile PWA components
grep -B 1 "/app/" docs/component_map.md | grep "###"

# Find all Portal components
grep -B 1 "/portal/" docs/component_map.md | grep "###"
```

### Find Unused Components

```bash
# Extract components with 0 usage
grep -A 1 '^\[' docs/component_map.md | grep "Not used"
```

### Generate Dependency Graph

```bash
# Convert to DOT format for Graphviz
# (Custom script needed - JSON structure is ready)
```

---

## 🐛 Troubleshooting

### No components found

**Cause**: Components directory not found

**Solution**:
```bash
ls client/src/components/
# Should show .tsx files
```

### Wrong route paths

**Cause**: `App.tsx` routes don't match file structure

**Solution**: Tool falls back to directory structure if no route found. Check `App.tsx` for correct route definitions.

### Missing imports not detected

**Cause**: Dynamic imports not supported

```typescript
// NOT detected:
const Component = await import('./Component');

// Detected:
import Component from './Component';
```

**Limitation**: Only static imports are analyzed.

---

## 📊 Statistics Explained

### Total Components (27)

Components found in `client/src/components/**/*.{ts,tsx}` with `export` statements.

**Excludes**:
- Internal helper functions
- Non-exported utilities
- Type definitions

### Total Routes (50)

Pages analyzed in `client/src/pages/**/*.tsx`.

**Includes**:
- Static routes (`/about`)
- Dynamic routes (`/portal/job/:jobId`)

**Excludes**:
- Routes not registered in `App.tsx` (orphaned pages)

### Average Components per Route (1.3)

```
Total Component Usages / Total Routes = 1.3
```

**Interpretation**:
- **Low** (<1.0): Pages are self-contained, little reuse
- **Medium** (1.0-3.0): Good balance ✅
- **High** (>3.0): High component reuse, good modularity

### Most Used Components

Sorted by usage count (routes that import them).

**Top components indicate**:
- Core UI building blocks
- High-value components to test thoroughly
- Candidates for extra documentation

---

## 🔄 Workflow Integration

### During Development

1. Make changes to a component
2. Run: `tsx tools/component-map.ts`
3. Check JSON: Which routes need testing?
4. Test affected routes

### Before Refactoring

1. Identify component to refactor
2. Check `component_map.json` for usage
3. Create test plan for all affected routes
4. Refactor with confidence

### Code Review

1. Reviewer checks component changes
2. Consults `component_map.md` for usage
3. Verifies test coverage matches usage

### Documentation

1. Generate component map regularly
2. Commit to repo for team visibility
3. Reference in architecture docs

---

## 📚 Related Documentation

- `tools/README.md` - Tools overview
- `tools/component-map.ts` - Source code
- `docs/component_map.json` - Raw data (bidirectional)
- `docs/component_map.md` - Human-readable report

---

**Last Updated**: 2025-10-28  
**Components Analyzed**: 27  
**Routes Analyzed**: 50  
**Data Format**: JSON + Markdown
