import __html__ from "./ui.html";

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

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
  stepTitle.fontName = { family: "Poppins", style: "Bold" };
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

async function findAndPopulateComponent(layoutType: string, step: any): Promise<SceneNode> {
  // Map layout types to component names
  const componentNameMap: { [key: string]: string[] } = {
    'full_screen': ['full-screen-layout', 'fullscreen-layout', 'full_screen_layout'],
    'modal_form': ['modal-layout', 'modal-form-layout', 'onboarding-modal'],
    'tooltip_overlay': ['tooltip-layout', 'tooltip-overlay-layout'],
    'split_screen': ['split-screen-layout', 'split-layout'],
    'swipeable_cards': ['swipeable-cards-layout', 'cards-layout']
  };

  const possibleNames = componentNameMap[layoutType] || [layoutType];
  let layoutComponent: ComponentNode | null = null;

  // Search for the component across the entire document
  for (const name of possibleNames) {
    layoutComponent = figma.root.findOne(
      node => node.type === "COMPONENT" && node.name === name
    ) as ComponentNode | null;
    if (layoutComponent) break;
  }

  if (layoutComponent) {
    // Create an instance of the component
    const instance = layoutComponent.createInstance();
    instance.name = step.stepName || step.id || `${layoutType}-instance`;

    // FIRST, set the variant if applicable. This is crucial.
    if (step.modalType) {
      await setVariantProperty(instance, step.modalType);
    }

    // THEN, load fonts and populate content on the (now correct) variant
    await loadFontsFromNode(instance);

    // Recursively find and update all instances within this new instance
    await findAndPopulateAllInstances(instance, step);

    return instance; // Return the instance itself
  } else {
    // Fallback: Component not found, create a placeholder frame with an error message
    const errorMessage = `Layout component for "${layoutType}" not found. Please make sure you're running this in the official template file.`;
    figma.notify(errorMessage, { error: true });
    
    const errorFrame = figma.createFrame();
    errorFrame.name = `Error: Component Not Found`;
    errorFrame.resize(1440, 900);
    
    const errorText = figma.createText();
    await figma.loadFontAsync({ family: "Poppins", style: "Regular" });
    errorText.fontName = { family: "Poppins", style: "Regular" };
    errorText.characters = errorMessage + `\n\nAlternatively, ensure a component named one of the following exists:\n[${possibleNames.join(', ')}]`;
    errorText.fontSize = 24;
    errorText.textAlignHorizontal = "CENTER";
    errorText.textAlignVertical = "CENTER";
    errorText.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
    errorText.resize(1440, 900);
    errorFrame.appendChild(errorText);

    return errorFrame;
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
  const boldFont: FontName = { family: "Poppins", style: "Bold" };
  const regularFont: FontName = { family: "Poppins", style: "Regular" };

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
    'subtext': 'subtitle',
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
      
      // 3. Find the full Figma property name (including the unique ID)
      for (const componentPropName in propertyDefs) {
        if (componentPropName.toLowerCase().startsWith(figmaPropName + '#') || componentPropName.toLowerCase() === figmaPropName) {
           propertiesToSet[componentPropName] = String(valueToSet);
           break; // Found the matching Figma prop, move to the next JSON key
        }
      }
    }
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
