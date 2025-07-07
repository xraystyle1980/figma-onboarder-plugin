import __html__ from "./ui.html";

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Library keys for published onboarding components
const LIBRARY_KEYS = {
  'full-screen-layout': '1612-2103',
  'modal-layout-form': '1667-23421', 
  'modal-layout': '1612-2656',
  'tooltip-layout': '1612-3898',
  'split-screen-layout': '1612-4016',
  // Add more component keys as needed
};

// Show the UI
figma.showUI(__html__, { width: 400, height: 400 });

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-screens') {
    try {
      const jsonData = JSON.parse(msg.json);
      let steps;

      // Handle cases where the JSON is an array of objects or a single object
      if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].steps) {
        steps = jsonData[0].steps; // Case: [ { "steps": [...] } ]
      } else if (jsonData.steps) {
        steps = jsonData.steps; // Case: { "steps": [...] }
      }

      if (!Array.isArray(steps)) {
        figma.notify('Error: The provided JSON does not contain a "steps" array.', { error: true });
        return;
      }

      const createdFrames: SceneNode[] = [];
      const totalSteps = steps.length;

      // Await all frame creation and text updates
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const frame = await createOnboardingFrame(step, i, totalSteps); // ensure all async work is awaited
        if ('x' in frame) {
          frame.x = i * (1440 + 80); // Desktop width + more spacing
          frame.y = 40; // fixed y position
        }
        figma.currentPage.appendChild(frame);
        createdFrames.push(frame);
      }

      // Center the created frames in the viewport
      figma.viewport.scrollAndZoomIntoView(createdFrames);
      // Select all created frames
      figma.currentPage.selection = createdFrames;
      
      // Notify the user and close the plugin
      figma.notify(`Successfully generated ${createdFrames.length} screens.`);
      figma.closePlugin();

    } catch (error: any) {
      figma.notify('Error processing JSON: ' + error.message, { error: true });
      // On error, we don't close the plugin so that logs can be inspected.
    }
  }
};

// Helper function to create an onboarding frame from a component
async function createOnboardingFrame(step: any, index: number, totalSteps: number): Promise<SceneNode> {
  // Load all pages to ensure components are accessible
  await figma.loadAllPagesAsync();

  const layoutType = step.layoutType || step.layout || 'full_screen';

  const componentOrErrorFrame = await findAndPopulateComponent(layoutType, step);

  // Create a container frame to hold the instance and its annotations
  const containerFrame = figma.createFrame();
  containerFrame.name = `Step ${index + 1}: ${step.stepName}`;
  containerFrame.layoutMode = "VERTICAL";
  containerFrame.primaryAxisSizingMode = "AUTO";
  containerFrame.counterAxisSizingMode = "AUTO";
  containerFrame.itemSpacing = 40;
  containerFrame.fills = []; // Make container transparent

  // Add and position the main component or error frame
  containerFrame.appendChild(componentOrErrorFrame);
  
  // If we successfully added a component instance, detach it now.
  if (componentOrErrorFrame.type === 'INSTANCE') {
    componentOrErrorFrame.detachInstance();
  }

  // --- CREATE ANNOTATIONS ---

  // Create a container for the notes
  const notesContainer = figma.createFrame();
  notesContainer.name = "Annotations";
  notesContainer.layoutMode = "VERTICAL";
  notesContainer.layoutAlign = "STRETCH";
  notesContainer.primaryAxisSizingMode = "AUTO";
  notesContainer.fills = [];
  notesContainer.paddingLeft = 20;
  notesContainer.paddingRight = 20;
  notesContainer.paddingTop = 20;
  notesContainer.paddingBottom = 20;
  notesContainer.itemSpacing = 24;
  
  // Add Step Title to notes
  const stepTitle = figma.createText();
  const titleFont: FontName = { family: "Inter", style: "Bold" };
  await figma.loadFontAsync(titleFont); // Ensure font is loaded before use
  stepTitle.fontName = titleFont;
  stepTitle.characters = `Step ${index + 1} of ${totalSteps}: ${step.stepName}`;
  stepTitle.fontSize = 18;
  notesContainer.appendChild(stepTitle);

  // Add UX Goal
  if (step.uxGoal) {
    const goalText = createAnnotationText('UX Goal', step.uxGoal);
    notesContainer.appendChild(await goalText);
  }
  
  // Add User Action
  if (step.userAction) {
    const actionText = createAnnotationText('User Action', step.userAction);
    notesContainer.appendChild(await actionText);
  }
  
  // Add Rationale
  if (step.rationale) {
    const rationaleText = createAnnotationText('Rationale', step.rationale);
    notesContainer.appendChild(await rationaleText);
  }
  
  containerFrame.appendChild(notesContainer);
  
  return containerFrame;
}

// --- BASIC SCAFFOLDING FOR MAIN COMPONENTS ---

async function createFullScreenLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Full Screen Layout';
  frame.resize(800, 600);
  frame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 1 } }];
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.characters = 'Full Screen Layout';
  text.fontSize = 32;
  text.x = 40;
  text.y = 40;
  frame.appendChild(text);
  return frame;
}

async function createModalLayoutForm(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Modal Layout Form';
  frame.resize(400, 500);
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 0.98, b: 0.95 } }];
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.characters = 'Modal Layout Form';
  text.fontSize = 24;
  text.x = 30;
  text.y = 30;
  frame.appendChild(text);
  return frame;
}

async function createModalLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Modal Layout';
  frame.resize(400, 400);
  frame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 1, b: 0.95 } }];
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.characters = 'Modal Layout';
  text.fontSize = 24;
  text.x = 30;
  text.y = 30;
  frame.appendChild(text);
  return frame;
}

async function createTooltipLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Tooltip Layout';
  frame.resize(300, 120);
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0.9 } }];
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.characters = 'Tooltip Layout';
  text.fontSize = 18;
  text.x = 20;
  text.y = 20;
  frame.appendChild(text);
  return frame;
}

async function createSplitScreenLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Split Screen Layout';
  frame.resize(900, 600);
  frame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.95, b: 1 } }];
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.characters = 'Split Screen Layout';
  text.fontSize = 32;
  text.x = 40;
  text.y = 40;
  frame.appendChild(text);
  return frame;
}

// --- UPDATE FINDANDPOPULATECOMPONENT TO USE SCAFFOLDS ---

async function findAndPopulateComponent(layoutType: string, step: any): Promise<SceneNode> {
  // Map layoutType to scaffolded function
  if (Array.isArray(step.inputFields) && step.inputFields.length > 0) {
    return await createModalLayoutForm(step);
  }
  switch (layoutType) {
    case 'full_screen':
      return await createFullScreenLayout(step);
    case 'modal_form':
      return await createModalLayoutForm(step);
    case 'modal':
      return await createModalLayout(step);
    case 'tooltip_overlay':
      return await createTooltipLayout(step);
    case 'split_screen':
      return await createSplitScreenLayout(step);
    default:
      // fallback: create a generic frame
      const frame = figma.createFrame();
      frame.name = step.stepName || 'Generic Layout';
      frame.resize(600, 400);
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      const text = figma.createText();
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
      text.characters = 'Generic Layout';
      text.fontSize = 20;
      text.x = 20;
      text.y = 20;
      frame.appendChild(text);
      return frame;
  }
}

// New helper function to set the variant on an instance
async function setVariantProperty(instance: InstanceNode, variantValue: string) {
    const mainComponent = await instance.getMainComponentAsync();
    if (!mainComponent) return;

    const definitionSource = mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET' ? mainComponent.parent : mainComponent;
    const propertyDefs = definitionSource.componentPropertyDefinitions;

    if (!propertyDefs) return;

    // Find a variant property whose options include the desired value.
    // This is more robust than hardcoding a property name like 'type'.
    for (const componentPropName in propertyDefs) {
        const propDef = propertyDefs[componentPropName];
        if (propDef.type === 'VARIANT' && propDef.variantOptions && propDef.variantOptions.includes(variantValue)) {
            try {
                instance.setProperties({ [componentPropName]: variantValue });
                console.log(`[Onboarder UX] Set variant to "${variantValue}" on component "${definitionSource.name}".`);
                // We assume the first matching variant property is the correct one.
                return; 
            } catch (e) {
                console.error(`[Onboarder UX] Failed to set variant property.`, e);
            }
        }
    }
    console.warn(`[Onboarder UX] Could not find a variant property on "${definitionSource.name}" that accepts the value "${variantValue}".`);
}

// Helper for creating annotation text blocks
async function createAnnotationText(label: string, value: string): Promise<TextNode> {
  const textNode = figma.createText();
  const boldFont: FontName = { family: "Inter", style: "Bold" };
  const regularFont: FontName = { family: "Inter", style: "Regular" };

  await figma.loadFontAsync(boldFont);
  await figma.loadFontAsync(regularFont);
  
  const labelText = `${label}:\n`;
  const fullText = labelText + value;
  
  textNode.characters = fullText;
  
  // Set the font for the label part to Bold
  textNode.setRangeFontName(0, labelText.length, boldFont);
  
  // Set the font for the value part to Regular
  textNode.setRangeFontName(labelText.length, fullText.length, regularFont);
  
  textNode.fontSize = 14;
  textNode.layoutAlign = "STRETCH";
  return textNode;
}

// Recursively load all fonts from a node and its children
async function loadFontsFromNode(node: SceneNode) {
  const fontsToLoad: FontName[] = [];
  const findFonts = (node: SceneNode) => {
    if (node.type === 'TEXT' && node.fontName !== figma.mixed) {
      const font = node.fontName as FontName;
      if (!fontsToLoad.some(f => f.family === font.family && f.style === font.style)) {
        fontsToLoad.push(font);
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        findFonts(child as SceneNode);
      }
    }
  };
  findFonts(node);
  if (fontsToLoad.length > 0) {
    await Promise.all(fontsToLoad.map(figma.loadFontAsync));
  }
}

// New recursive function to find and populate all nested instances
async function findAndPopulateAllInstances(node: SceneNode, step: any) {
  // If the current node is an instance, try to update its properties.
  if (node.type === "INSTANCE") {
    await updateInstanceProperties(node, step);
  }

  // If the node has children, recurse into them.
  if ("children" in node) {
    for (const child of node.children) {
      await findAndPopulateAllInstances(child, step);
    }
  }
}

// Function to update component properties on an instance
async function updateInstanceProperties(instance: InstanceNode, step: any) {
  const mainComponent = await instance.getMainComponentAsync();
  if (!mainComponent) {
    return;
  }

  // If the main component is a variant, get definitions from the parent set.
  const definitionSource = mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET' ? mainComponent.parent : mainComponent;
  const propertyDefs = definitionSource.componentPropertyDefinitions;

  if (!propertyDefs || Object.keys(propertyDefs).length === 0) {
    return;
  }
  
  // 1. Define the exact mapping from JSON keys to Figma Property names (case-insensitive)
  const jsonToFigmaPropMap: { [key: string]: string } = {
    'headline': 'headline',
    'subtitle': 'subtitle',
    'marketingCopy': 'marketingcopy',
    'cta': 'cta'
  };

  const propertiesToSet: { [key: string]: string } = {};

  // 2. Loop through the JSON keys we want to map
  for (const jsonKey in jsonToFigmaPropMap) {
    const valueToSet = step[jsonKey];
    console.log(`[DEBUG] Checking for JSON key: "${jsonKey}"...`);
    if (valueToSet) {
      const figmaPropName = jsonToFigmaPropMap[jsonKey];
      console.log(`[DEBUG] ... found value. Mapping to Figma prop: "${figmaPropName}"`);
      let found = false;
      // 3. Find the full Figma property name (including the unique ID)
      for (const componentPropName in propertyDefs) {
        if (componentPropName.toLowerCase().startsWith(figmaPropName + '#') || componentPropName.toLowerCase() === figmaPropName) {
           propertiesToSet[componentPropName] = String(valueToSet);
           found = true;
           break; // Found the matching Figma prop, move to the next JSON key
        }
      }
      if (!found && jsonKey === 'subtitle') {
        console.warn(`[DEBUG] Subtitle value found in JSON, but no matching Figma property for 'subtitle'. PropertyDefs:`, propertyDefs);
      }
    }
  }

  // 3. Map inputFields to inputLabel-N, inputPlaceholder-N, selectLabel-N, selectPlaceholder-N
  if (Array.isArray(step.inputFields)) {
    step.inputFields.forEach((field: any, idx: number) => {
      // For text/textarea/email/number fields
      if (["text", "textarea", "email", "number"].includes(field.type)) {
        const labelProp = `inputLabel-${idx + 1}`;
        const placeholderProp = `inputPlaceholder-${idx + 1}`;
        for (const componentPropName in propertyDefs) {
          if (componentPropName.toLowerCase().startsWith(labelProp.toLowerCase() + '#') || componentPropName.toLowerCase() === labelProp.toLowerCase()) {
            propertiesToSet[componentPropName] = field.label;
          }
          if (field.placeholder && (componentPropName.toLowerCase().startsWith(placeholderProp.toLowerCase() + '#') || componentPropName.toLowerCase() === placeholderProp.toLowerCase())) {
            propertiesToSet[componentPropName] = field.placeholder;
          }
        }
      }
      // For select/multiselect fields
      if (["select", "multiselect"].includes(field.type)) {
        const labelProp = `selectLabel-${idx + 1}`;
        const placeholderProp = `selectPlaceholder-${idx + 1}`;
        for (const componentPropName in propertyDefs) {
          if (componentPropName.toLowerCase().startsWith(labelProp.toLowerCase() + '#') || componentPropName.toLowerCase() === labelProp.toLowerCase()) {
            propertiesToSet[componentPropName] = field.label;
          }
          if (field.placeholder && (componentPropName.toLowerCase().startsWith(placeholderProp.toLowerCase() + '#') || componentPropName.toLowerCase() === placeholderProp.toLowerCase())) {
            propertiesToSet[componentPropName] = field.placeholder;
          }
        }
      }
    });
  }

  if (Object.keys(propertiesToSet).length > 0) {
    try {
      console.log(`[Onboarder UX] Setting properties for component "${definitionSource.name}":`, propertiesToSet);
      instance.setProperties(propertiesToSet);
      console.log(`[Onboarder UX] Successfully set ${Object.keys(propertiesToSet).length} properties on component "${definitionSource.name}".`);
    } catch (e) {
      console.error(`[Onboarder UX] Failed to set component properties. This can happen if the component's fonts are not available. Error:`, e);
    }
  } else {
      console.log(`[Onboarder UX] No matching properties found to set for component "${definitionSource.name}".`);
  }
}

// Helper to hide dropdown-group if no select/multiselect fields are present
async function hideUnusedSelectDropdowns(instance: InstanceNode, step: any) {
  const hasSelect = Array.isArray(step.inputFields) && step.inputFields.some(
    (field: any) => field.type === 'select' || field.type === 'multiselect'
  );
  if (!hasSelect) {
    const dropdownNode = instance.findOne(node => node.name === 'dropdown-group');
    if (dropdownNode) {
      dropdownNode.visible = false;
    }
  }
}

// Helper to dynamically populate and duplicate form fields
async function populateDynamicForm(instance: InstanceNode, step: any) {
  if (!Array.isArray(step.inputFields)) return;

  // Find the form-fields-container inside the instance
  const formFieldsContainer = instance.findOne(
    (node: SceneNode) => node.name === 'form-fields-container'
  ) as FrameNode | null;
  if (!formFieldsContainer) return;

  // Find all pre-created input, textarea, and dropdown groups
  const inputGroups = formFieldsContainer.findAll(node => !!node.name && node.name.startsWith('input-group')) as FrameNode[];
  const textAreaGroups = formFieldsContainer.findAll(node => !!node.name && node.name.startsWith('textArea-group')) as FrameNode[];
  const dropdownGroups = formFieldsContainer.findAll(node => !!node.name && node.name.startsWith('dropdown-group')) as FrameNode[];

  // Track how many of each type we've used
  let inputIdx = 0, textAreaIdx = 0, dropdownIdx = 0;

  for (const field of step.inputFields) {
    if (["text", "email", "number"].includes(field.type) && inputIdx < inputGroups.length) {
      const group = inputGroups[inputIdx++];
      group.visible = true;
      const labelNode = group.findOne((n: SceneNode) => n.name === 'inputLabel');
      if (labelNode && 'characters' in labelNode) labelNode.characters = field.label;
      const placeholderNode = group.findOne((n: SceneNode) => n.name === 'inputPlaceholder');
      if (placeholderNode && 'characters' in placeholderNode) placeholderNode.characters = field.placeholder || '';
    }
    if (field.type === 'textarea' && textAreaIdx < textAreaGroups.length) {
      const group = textAreaGroups[textAreaIdx++];
      group.visible = true;
      const labelNode = group.findOne((n: SceneNode) => n.name === 'textAreaLabel');
      if (labelNode && 'characters' in labelNode) labelNode.characters = field.label;
      const placeholderNode = group.findOne((n: SceneNode) => n.name === 'textAreaPlaceholder');
      if (placeholderNode && 'characters' in placeholderNode) placeholderNode.characters = field.placeholder || '';
    }
    if (["select", "multiselect"].includes(field.type) && dropdownIdx < dropdownGroups.length) {
      const group = dropdownGroups[dropdownIdx++];
      group.visible = true;
      const labelNode = group.findOne((n: SceneNode) => n.name === 'selectLabel');
      if (labelNode && 'characters' in labelNode) labelNode.characters = field.label;
      const placeholderNode = group.findOne((n: SceneNode) => n.name === 'selectPlaceholder');
      if (placeholderNode && 'characters' in placeholderNode) placeholderNode.characters = field.placeholder || '';
    }
  }

  // Hide unused groups
  for (; inputIdx < inputGroups.length; inputIdx++) inputGroups[inputIdx].visible = false;
  for (; textAreaIdx < textAreaGroups.length; textAreaIdx++) textAreaGroups[textAreaIdx].visible = false;
  for (; dropdownIdx < dropdownGroups.length; dropdownIdx++) dropdownGroups[dropdownIdx].visible = false;
}
