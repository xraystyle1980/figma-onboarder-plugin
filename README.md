# Onboarder.design Figma Plugin

This plugin generates onboarding UX flows from JSON data by importing components from a published Figma library.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the plugin**:
   ```bash
   npm run build
   ```

3. **Load in Figma**:
   - Open Figma
   - Go to Plugins > Development > Import plugin from manifest
   - Select the `manifest.json` file in this directory

## Library Setup

This plugin requires a published Figma library with onboarding components. See [LIBRARY_MIGRATION.md](./LIBRARY_MIGRATION.md) for detailed setup instructions.

### Required Components

The plugin expects these components in your published library:
- `full-screen-layout`
- `modal-layout-form`
- `modal-layout`
- `tooltip-layout`
- `split-screen-layout`

### Update Library Keys

After publishing your library, update the `LIBRARY_KEYS` object in `code.ts` with your component keys:

```typescript
const LIBRARY_KEYS = {
  'full-screen-layout': 'YOUR_ACTUAL_KEY_HERE',
  'modal-layout-form': 'YOUR_ACTUAL_KEY_HERE',
  // ... etc
};
```

Use the helper script to extract keys:
```bash
node extract-component-keys.js "https://www.figma.com/file/..."
```

## Development

### TypeScript Setup

This plugin uses TypeScript. Install globally:
```bash
npm install -g typescript
```

Install plugin typings:
```bash
npm install --save-dev @figma/plugin-typings
```

### Building

- **Watch mode**: `npm run watch` (regenerates on save)
- **Build once**: `npm run build`

### VS Code Setup

1. Open this directory in VS Code
2. Run "Terminal > Run Build Task..." > "npm: watch"
3. The JavaScript file will regenerate automatically on save

## Usage

1. Run the plugin in any Figma file
2. Paste your onboarding flow JSON
3. Click "Generate Screens"
4. Components will be imported from your published library

## Architecture

- **Library-first**: Components imported from published library
- **Fallback support**: Can use local components if library unavailable
- **Variant support**: Handles component variants and properties
- **Dynamic content**: Populates text, images, and form fields

## Troubleshooting

See [LIBRARY_MIGRATION.md](./LIBRARY_MIGRATION.md) for common issues and solutions.
