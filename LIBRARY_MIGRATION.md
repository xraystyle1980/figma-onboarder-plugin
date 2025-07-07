# Library Migration Guide

This guide explains how to migrate the Onboarder Figma plugin from using template-based components to published library components.

## Overview

The plugin has been updated to support importing components from a published Figma library instead of requiring users to have a template file. This provides a better user experience as users can run the plugin on any of their own files.

## Migration Steps

### 1. Create the Component Library

1. **Create a new Figma file** for your onboarding components
2. **Add all required components** with the following names:
   - `full-screen-layout`
   - `modal-layout-form`
   - `modal-layout`
   - `tooltip-layout`
   - `split-screen-layout`

3. **Organize components** into component sets if they have variants
4. **Ensure proper naming** - component names must match exactly

### 2. Publish the Library

1. **Select all components** in your library file
2. **Right-click** and select "Add to team library"
3. **Publish the library** to your team
4. **Note the library key** for each component

### 3. Get Component Keys

To get the library keys for your components:

1. **Open the published library** in Figma
2. **Right-click on a component** and select "Copy link"
3. **Extract the key** from the URL:
   ```
   https://www.figma.com/file/[FILE_KEY]/[FILE_NAME]?node-id=[NODE_ID]&t=[TOKEN]
   ```
   The key is the `NODE_ID` part

### 4. Update Plugin Code

1. **Open `code.ts`** in the plugin
2. **Replace the placeholder keys** in `LIBRARY_KEYS`:

```typescript
const LIBRARY_KEYS = {
  'full-screen-layout': 'YOUR_ACTUAL_KEY_HERE',
  'modal-layout-form': 'YOUR_ACTUAL_KEY_HERE', 
  'modal-layout': 'YOUR_ACTUAL_KEY_HERE',
  'tooltip-layout': 'YOUR_ACTUAL_KEY_HERE',
  'split-screen-layout': 'YOUR_ACTUAL_KEY_HERE',
};
```

### 5. Test the Plugin

1. **Build the plugin** (`npm run build`)
2. **Test in Figma** with a file that doesn't have the template components
3. **Verify components import** correctly from the library

## Component Requirements

Each component in your library should:

- **Have the exact name** specified in `LIBRARY_KEYS`
- **Include all necessary variants** (e.g., modal types)
- **Use proper component properties** for dynamic content
- **Be properly structured** with nested instances for content areas

## Fallback Behavior

The plugin includes fallback behavior:

1. **First**: Try to import from published library
2. **Second**: Try to find components in current document (backward compatibility)
3. **Third**: Show error message with instructions

## Troubleshooting

### "Component not found" error
- Verify the library is published and accessible
- Check that component names match exactly
- Ensure library keys are correctly updated in the code

### Import failures
- Check that the library is accessible to your team
- Verify component keys are correct
- Ensure the library file is not in draft mode

### Variant issues
- Make sure component variants are properly set up
- Check that variant property names match the expected values

## Benefits of Library Migration

- **No template dependency**: Users can run the plugin on any file
- **Centralized components**: All components in one published library
- **Easier updates**: Update components once in the library
- **Better collaboration**: Team members can access the same components
- **Version control**: Library versions provide component history

## Next Steps

After completing the migration:

1. **Test thoroughly** with different file types
2. **Update documentation** for users
3. **Consider component versioning** for future updates
4. **Monitor usage** and gather feedback 