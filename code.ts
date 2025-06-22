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
      const steps = JSON.parse(msg.json);
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
  // Load all fonts you will use
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

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
  stepTitle.fontName = { family: "Inter", style: "Bold" };
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
    'modal_form': ['modal-layout', 'modal-form-layout'],
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

    // Recursively find and update all instances within this new instance
    await findAndPopulateAllInstances(instance, step);

    return instance; // Return the instance itself
  } else {
    // Fallback: Component not found, create a placeholder frame with an error message
    figma.notify(`Component for layout type "${layoutType}" not found.`, { error: true });
    
    const errorFrame = figma.createFrame();
    errorFrame.name = `Error: Component Not Found`;
    errorFrame.resize(1440, 900);
    
    const errorText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    errorText.fontName = { family: "Inter", style: "Regular" };
    errorText.characters = `Component for "${layoutType}" not found.\n\nPlease create a component named one of:\n[${possibleNames.join(', ')}]`;
    errorText.fontSize = 24;
    errorText.textAlignHorizontal = "CENTER";
    errorText.textAlignVertical = "CENTER";
    errorText.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
    errorText.resize(1440, 900);
    errorFrame.appendChild(errorText);

    return errorFrame;
  }
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
    console.log('[Onboarder UX] Could not get main component for instance.');
    return;
  }

  // Log the step data for debugging
  console.log('[Onboarder UX] Step object received for property update:', JSON.stringify(step));

  // If the main component is a variant, get definitions from the parent set.
  const definitionSource = mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET' ? mainComponent.parent : mainComponent;
  const propertyDefs = definitionSource.componentPropertyDefinitions;

  if (!propertyDefs || Object.keys(propertyDefs).length === 0) {
    console.log(`[Onboarder UX] No component properties found on component "${definitionSource.name}".`);
    return;
  }
  
  console.log(`[Onboarder UX] Found ${Object.keys(propertyDefs).length} component properties on component "${definitionSource.name}". Definitions:`, JSON.stringify(propertyDefs));

  // Map JSON properties to keywords that might appear in Figma component property names
  const propertyMap: { [key: string]: string[] } = {
    'headline': ['headline', 'title'],
    'subtitle': ['subtitle', 'subtext', 'description', 'body'],
    'marketingCopy': ['marketing', 'copy', 'marketingcopy'],
    'cta': ['cta', 'button', 'get started', 'next', 'skip', 'cancel', 'submit'],
    'stepName': ['step']
  };
  
  const propertiesToSet: { [key: string]: string } = {};

  // Iterate over the defined component properties
  for (const componentPropName in propertyDefs) {
    const propDef = propertyDefs[componentPropName];
    
    // We only care about text properties
    if (propDef.type === 'TEXT') {
      const componentPropNameLower = componentPropName.toLowerCase();

      // Find a matching property in our JSON data
      for (const jsonProp in propertyMap) {
        const keywords = propertyMap[jsonProp];
        if (keywords.some(k => componentPropNameLower.includes(k))) {
          const valueToSet = step[jsonProp as keyof typeof step];
          if (valueToSet) {
            console.log(`[Onboarder UX] Match found! Staging component property "${componentPropName}" with value from JSON property "${jsonProp}".`);
            propertiesToSet[componentPropName] = String(valueToSet);
            // Break from the inner loop to prevent one component property from being updated by multiple JSON properties
            break;
          }
        }
      }
    }
  }
  
  if (Object.keys(propertiesToSet).length > 0) {
    try {
      instance.setProperties(propertiesToSet);
      console.log(`[Onboarder UX] Successfully set ${Object.keys(propertiesToSet).length} properties.`);
    } catch (e) {
      console.error(`[Onboarder UX] Failed to set component properties.`, e);
    }
  } else {
      console.log(`[Onboarder UX] No component properties were updated for component "${definitionSource.name}". Check component property names and JSON keys.`);
  }
}
