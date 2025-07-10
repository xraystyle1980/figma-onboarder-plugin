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
  stepTitle.layoutAlign = 'STRETCH'; // Fill container
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
  // Main frame
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Full Screen Layout';
  frame.resize(1200, 900);
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.itemSpacing = 24;
  frame.paddingTop = 80;
  frame.paddingBottom = 80;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  // Icon (background circle + ellipse placeholder)
  const iconFrame = figma.createFrame();
  iconFrame.resize(80, 80);
  iconFrame.cornerRadius = 20;
  iconFrame.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  iconFrame.layoutMode = 'VERTICAL';
  iconFrame.primaryAxisAlignItems = 'CENTER';
  iconFrame.counterAxisAlignItems = 'CENTER';
  iconFrame.paddingTop = 12;
  iconFrame.paddingBottom = 12;
  iconFrame.paddingLeft = 12;
  iconFrame.paddingRight = 12;
  // Ellipse placeholder
  const iconEllipse = figma.createEllipse();
  iconEllipse.resize(40, 40);
  iconEllipse.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  iconFrame.appendChild(iconEllipse);

  // Headline
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const headline = figma.createText();
  headline.fontName = { family: 'Inter', style: 'Bold' };
  headline.characters = step.headline || step.title || 'headline';
  headline.fontSize = 48;
  headline.textAlignHorizontal = 'CENTER';
  headline.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];

  // Subtitle
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const subtitle = figma.createText();
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.characters = step.subtitle || 'subtitle';
  subtitle.fontSize = 24;
  subtitle.textAlignHorizontal = 'CENTER';
  subtitle.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];

  // Marketing copy
  const marketingCopy = figma.createText();
  marketingCopy.fontName = { family: 'Inter', style: 'Regular' };
  marketingCopy.characters = step.marketingCopy || 'marketingCopy';
  marketingCopy.fontSize = 18;
  marketingCopy.textAlignHorizontal = 'CENTER';
  marketingCopy.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];

  // Button frame
  const buttonFrame = figma.createFrame();
  buttonFrame.layoutMode = 'HORIZONTAL';
  buttonFrame.primaryAxisAlignItems = 'CENTER';
  buttonFrame.counterAxisAlignItems = 'CENTER';
  buttonFrame.paddingLeft = 32;
  buttonFrame.paddingRight = 32;
  buttonFrame.paddingTop = 16;
  buttonFrame.paddingBottom = 16;
  buttonFrame.cornerRadius = 12;
  buttonFrame.itemSpacing = 12;
  buttonFrame.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.44, b: 1 } }];
  // Button text
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' }).catch(() => figma.loadFontAsync({ family: 'Inter', style: 'Bold' }));
  const buttonText = figma.createText();
  buttonText.fontName = { family: 'Inter', style: 'Medium' };
  buttonText.characters = step.buttonText || step.cta || step.ctaText || 'Continue';
  buttonText.fontSize = 20;
  buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  buttonText.layoutAlign = 'STRETCH'; // Fill container
  buttonText.textAlignVertical = 'CENTER';
  // Button arrow (rectangle placeholder)
  const buttonArrow = figma.createRectangle();
  buttonArrow.resize(12, 12);
  buttonArrow.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  buttonFrame.appendChild(buttonText);
  buttonFrame.appendChild(buttonArrow);

  // Checklist row
  const checklistRow = figma.createFrame();
  checklistRow.layoutMode = 'HORIZONTAL';
  checklistRow.primaryAxisAlignItems = 'CENTER';
  checklistRow.counterAxisAlignItems = 'CENTER';
  checklistRow.itemSpacing = 48;
  checklistRow.fills = [];
  checklistRow.paddingTop = 0;
  checklistRow.paddingBottom = 0;
  checklistRow.paddingLeft = 0;
  checklistRow.paddingRight = 0;

  // Checklist items
  const checklistItems = step.checklistItems || [
    'Free 14-day trial',
    'No credit card required',
    'Cancel anytime'
  ];
  for (const label of checklistItems) {
    const itemFrame = figma.createFrame();
    itemFrame.layoutMode = 'HORIZONTAL';
    itemFrame.primaryAxisAlignItems = 'CENTER';
    itemFrame.counterAxisAlignItems = 'CENTER';
    itemFrame.itemSpacing = 8;
    itemFrame.fills = [];
    // Checklist icon (ellipse placeholder)
    const checkIcon = figma.createEllipse();
    checkIcon.resize(14, 14);
    checkIcon.fills = [{ type: 'SOLID', color: { r: 0.19, g: 0.25, b: 0.35 } }];
    // Checklist label
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const itemText = figma.createText();
    itemText.fontName = { family: 'Inter', style: 'Regular' };
    itemText.characters = label;
    itemText.fontSize = 16;
    itemText.fills = [{ type: 'SOLID', color: { r: 0.19, g: 0.25, b: 0.35 } }];
    itemText.layoutAlign = 'STRETCH'; // Fill container
    itemFrame.appendChild(checkIcon);
    itemFrame.appendChild(itemText);
    checklistRow.appendChild(itemFrame);
  }

  // Add all to main frame
  frame.appendChild(iconFrame);
  frame.appendChild(headline);
  frame.appendChild(subtitle);
  frame.appendChild(marketingCopy);
  frame.appendChild(buttonFrame);
  frame.appendChild(checklistRow);

  return frame;
}

// MODAL LAYOUT FORM
async function createModalLayoutForm(step: any): Promise<FrameNode> {
  // Outer frame
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Modal Layout Form';
  frame.resize(1400, 900); // Always 900px tall
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.itemSpacing = 0;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';

  // Modal card
  const card = figma.createFrame();
  card.name = 'ModalCard';
  card.resize(420, 0); // Only set width, let height be auto (hug contents)
  card.cornerRadius = 24;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.layoutMode = 'VERTICAL';
  card.primaryAxisAlignItems = 'CENTER';
  card.counterAxisAlignItems = 'CENTER';
  card.itemSpacing = 24;
  card.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 4 }, radius: 32, spread: 0, visible: true, blendMode: 'NORMAL' }];
  card.paddingTop = 40;
  card.paddingBottom = 40;
  card.paddingLeft = 40;
  card.paddingRight = 40;
  card.primaryAxisSizingMode = 'AUTO'; // Hug contents
  card.counterAxisSizingMode = 'AUTO';

  // Icon
  const iconEllipse = figma.createEllipse();
  iconEllipse.name = 'Icon';
  iconEllipse.resize(56, 56);
  iconEllipse.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];

  // Headline
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const headline = figma.createText();
  headline.name = 'Headline';
  headline.fontName = { family: 'Inter', style: 'Bold' };
  headline.characters = step.headline || step.title || 'headline';
  headline.fontSize = 28;
  headline.textAlignHorizontal = 'CENTER';
  headline.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];
  headline.layoutAlign = 'STRETCH'; // Fill container

  // Subtitle
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const subtitle = figma.createText();
  subtitle.name = 'Subtitle';
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.characters = step.subtitle || 'subtitle';
  subtitle.fontSize = 18;
  subtitle.textAlignHorizontal = 'CENTER';
  subtitle.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  subtitle.layoutAlign = 'STRETCH'; // Fill container

  // Form fields - only create if inputFields are present
  let formFrame: FrameNode | null = null;
  if (Array.isArray(step.inputFields) && step.inputFields.length > 0) {
    formFrame = figma.createFrame();
    formFrame.name = 'FormFields';
    formFrame.layoutMode = 'VERTICAL';
    formFrame.primaryAxisAlignItems = 'MIN';
    formFrame.counterAxisAlignItems = 'MIN';
    formFrame.itemSpacing = 16;
    formFrame.fills = [];
    formFrame.resize(340, 1); // Set width, but not height
    formFrame.primaryAxisSizingMode = 'AUTO'; // Hug contents vertically
    formFrame.counterAxisSizingMode = 'FIXED'; // Fixed width

    for (const field of step.inputFields) {
      // Label
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      const label = figma.createText();
      label.name = 'FormFieldLabel';
      label.fontName = { family: 'Inter', style: 'Regular' };
      label.characters = field.label || '';
      label.fontSize = 14;
      label.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
      label.layoutAlign = 'STRETCH';
      formFrame.appendChild(label);
      // Input
      if (field.type === 'select') {
        const selectFrame = figma.createFrame();
        selectFrame.name = 'FormFieldSelect';
        selectFrame.layoutMode = 'HORIZONTAL';
        selectFrame.primaryAxisAlignItems = 'CENTER';
        selectFrame.counterAxisAlignItems = 'CENTER';
        selectFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        selectFrame.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.85, b: 0.92 } }];
        selectFrame.strokeWeight = 2;
        selectFrame.cornerRadius = 8;
        selectFrame.paddingLeft = 16;
        selectFrame.paddingRight = 16;
        selectFrame.paddingTop = 12;
        selectFrame.paddingBottom = 12;
        selectFrame.resize(340, 44);
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        const selectText = figma.createText();
        selectText.name = 'FormFieldSelectPlaceholder';
        selectText.fontName = { family: 'Inter', style: 'Regular' };
        selectText.characters = field.placeholder || '';
        selectText.fontSize = 16;
        selectText.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];
        selectText.layoutAlign = 'STRETCH';
        selectFrame.appendChild(selectText);
        // Down chevron (rectangle placeholder)
        const chevron = figma.createRectangle();
        chevron.name = 'SelectChevron';
        chevron.resize(12, 12);
        chevron.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];
        selectFrame.appendChild(chevron);
        formFrame.appendChild(selectFrame);
      } else if (field.type === 'textarea') {
        const textareaFrame = figma.createFrame();
        textareaFrame.name = 'FormFieldTextarea';
        textareaFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        textareaFrame.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.85, b: 0.92 } }];
        textareaFrame.strokeWeight = 2;
        textareaFrame.cornerRadius = 8;
        textareaFrame.paddingLeft = 16;
        textareaFrame.paddingRight = 16;
        textareaFrame.paddingTop = 12;
        textareaFrame.paddingBottom = 12;
        textareaFrame.resize(340, 80);
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        const textareaText = figma.createText();
        textareaText.name = 'FormFieldTextareaPlaceholder';
        textareaText.fontName = { family: 'Inter', style: 'Regular' };
        textareaText.characters = field.placeholder || '';
        textareaText.fontSize = 16;
        textareaText.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
        textareaText.layoutAlign = 'STRETCH';
        textareaFrame.appendChild(textareaText);
        formFrame.appendChild(textareaFrame);
      } else {
        const inputFrame = figma.createFrame();
        inputFrame.name = 'FormFieldInput';
        inputFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        inputFrame.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.85, b: 0.92 } }];
        inputFrame.strokeWeight = 2;
        inputFrame.cornerRadius = 8;
        inputFrame.layoutMode = 'HORIZONTAL'; // Enable auto-layout
        inputFrame.paddingLeft = 12;
        inputFrame.paddingRight = 12;
        inputFrame.paddingTop = 12;
        inputFrame.paddingBottom = 12;
        inputFrame.resize(340, 44);
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        const inputText = figma.createText();
        inputText.name = 'FormFieldInputPlaceholder';
        inputText.fontName = { family: 'Inter', style: 'Regular' };
        inputText.characters = field.placeholder || '';
        inputText.fontSize = 16;
        inputText.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
        inputText.layoutAlign = 'STRETCH';
        inputFrame.appendChild(inputText);
        formFrame.appendChild(inputFrame);
      }
    }
  }

  // CTA button
  const buttonFrame = figma.createFrame();
  buttonFrame.name = 'Button';
  buttonFrame.layoutMode = 'HORIZONTAL';
  buttonFrame.primaryAxisAlignItems = 'CENTER';
  buttonFrame.counterAxisAlignItems = 'CENTER';
  buttonFrame.paddingLeft = 0;
  buttonFrame.paddingRight = 0;
  buttonFrame.paddingTop = 0;
  buttonFrame.paddingBottom = 0;
  buttonFrame.cornerRadius = 8;
  buttonFrame.itemSpacing = 0;
  buttonFrame.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.44, b: 1 } }];
  buttonFrame.resize(340, 48);
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' }).catch(() => figma.loadFontAsync({ family: 'Inter', style: 'Bold' }));
  const buttonText = figma.createText();
  buttonText.name = 'ButtonText';
  buttonText.fontName = { family: 'Inter', style: 'Medium' };
  buttonText.characters = step.buttonText || step.cta || step.ctaText || 'Continue';
  buttonText.fontSize = 20;
  buttonText.textAlignHorizontal = 'CENTER';
  buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  buttonText.layoutAlign = 'STRETCH'; // Fill container
  buttonText.textAlignVertical = 'CENTER';
  buttonFrame.appendChild(buttonText);

  // Assemble card
  card.appendChild(iconEllipse);
  card.appendChild(headline);
  card.appendChild(subtitle);
  if (formFrame) {
    card.appendChild(formFrame);
  }
  card.appendChild(buttonFrame);
  frame.appendChild(card);
  return frame;
}

// MODAL LAYOUT
async function createModalLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Modal Layout';
  frame.resize(1400, 900); // Always 900px tall
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.itemSpacing = 0;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';

  // Modal card
  const card = figma.createFrame();
  card.name = 'ModalCard';
  card.resize(420, 0); // Only set width, let height be auto (hug contents)
  card.cornerRadius = 24;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.layoutMode = 'VERTICAL';
  card.primaryAxisAlignItems = 'CENTER';
  card.counterAxisAlignItems = 'CENTER';
  card.itemSpacing = 16;
  card.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 4 }, radius: 32, spread: 0, visible: true, blendMode: 'NORMAL' }];
  card.paddingTop = 32;
  card.paddingBottom = 32;
  card.paddingLeft = 32;
  card.paddingRight = 32;
  card.primaryAxisSizingMode = 'AUTO'; // Hug contents
  card.counterAxisSizingMode = 'AUTO';

  // Icon
  const iconEllipse = figma.createEllipse();
  iconEllipse.name = 'Icon';
  iconEllipse.resize(56, 56);
  iconEllipse.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];

  // Headline
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const headline = figma.createText();
  headline.name = 'Headline';
  headline.fontName = { family: 'Inter', style: 'Bold' };
  headline.characters = step.headline || step.title || 'headline';
  headline.fontSize = 28;
  headline.textAlignHorizontal = 'CENTER';
  headline.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];
  headline.layoutAlign = 'STRETCH'; // Fill container

  // Subtitle
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const subtitle = figma.createText();
  subtitle.name = 'Subtitle';
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.characters = step.subtitle || 'subtitle';
  subtitle.fontSize = 18;
  subtitle.textAlignHorizontal = 'CENTER';
  subtitle.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  subtitle.layoutAlign = 'STRETCH'; // Fill container

  // CTA button
  const buttonFrame = figma.createFrame();
  buttonFrame.name = 'Button';
  buttonFrame.layoutMode = 'HORIZONTAL';
  buttonFrame.primaryAxisAlignItems = 'CENTER';
  buttonFrame.counterAxisAlignItems = 'CENTER';
  buttonFrame.paddingLeft = 0;
  buttonFrame.paddingRight = 0;
  buttonFrame.paddingTop = 0;
  buttonFrame.paddingBottom = 0;
  buttonFrame.cornerRadius = 8;
  buttonFrame.itemSpacing = 0;
  buttonFrame.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.44, b: 1 } }];
  buttonFrame.resize(340, 48);
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' }).catch(() => figma.loadFontAsync({ family: 'Inter', style: 'Bold' }));
  const buttonText = figma.createText();
  buttonText.name = 'ButtonText';
  buttonText.fontName = { family: 'Inter', style: 'Medium' };
  buttonText.characters = step.buttonText || step.cta || step.ctaText || 'Continue';
  buttonText.fontSize = 20;
  buttonText.textAlignHorizontal = 'CENTER';
  buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  buttonText.layoutAlign = 'STRETCH'; // Fill container
  buttonText.textAlignVertical = 'CENTER';
  buttonFrame.appendChild(buttonText);

  // Assemble card
  card.appendChild(iconEllipse);
  card.appendChild(headline);
  card.appendChild(subtitle);
  card.appendChild(buttonFrame);
  frame.appendChild(card);
  return frame;
}

// SPLIT SCREEN LAYOUT
async function createSplitScreenLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Split Screen Layout';
  frame.resize(1400, 900); // Always 900px tall
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.itemSpacing = 0;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';

  // Left: image placeholder
  const left = figma.createFrame();
  left.name = 'ImagePlaceholderContainer';
  left.resize(600, 800);
  left.fills = [{ type: 'SOLID', color: { r: 0.87, g: 0.91, b: 0.97 } }];
  left.layoutMode = 'VERTICAL';
  left.primaryAxisAlignItems = 'CENTER';
  left.counterAxisAlignItems = 'CENTER';
  left.itemSpacing = 0;
  left.paddingTop = 0;
  left.paddingBottom = 0;
  left.paddingLeft = 0;
  left.paddingRight = 0;
  // Placeholder image icon
  const imageIcon = figma.createEllipse();
  imageIcon.name = 'ImagePlaceholder';
  imageIcon.resize(64, 64);
  imageIcon.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.68, b: 0.8 } }];
  left.appendChild(imageIcon);

  // Right: content
  const right = figma.createFrame();
  right.name = 'ContentContainer';
  right.resize(800, 800);
  right.fills = [];
  right.layoutMode = 'VERTICAL';
  right.primaryAxisAlignItems = 'MIN';
  right.counterAxisAlignItems = 'CENTER';
  right.itemSpacing = 24;
  right.paddingTop = 120;
  right.paddingLeft = 40;
  right.paddingRight = 40;
  right.paddingBottom = 40;

  // Headline
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const headline = figma.createText();
  headline.name = 'Headline';
  headline.fontName = { family: 'Inter', style: 'Bold' };
  headline.characters = step.headline || step.title || 'headline';
  headline.fontSize = 48;
  headline.textAlignHorizontal = 'LEFT';
  headline.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];

  // Subtitle
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const subtitle = figma.createText();
  subtitle.name = 'Subtitle';
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.characters = step.subtitle || 'subtitle';
  subtitle.fontSize = 24;
  subtitle.textAlignHorizontal = 'LEFT';
  subtitle.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];

  // Marketing copy
  const marketingCopy = figma.createText();
  marketingCopy.name = 'MarketingCopy';
  marketingCopy.fontName = { family: 'Inter', style: 'Regular' };
  marketingCopy.characters = step.marketingCopy || 'marketingCopy';
  marketingCopy.fontSize = 18;
  marketingCopy.textAlignHorizontal = 'LEFT';
  marketingCopy.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  marketingCopy.resize(768, marketingCopy.height); // set max width
  marketingCopy.textAutoResize = 'HEIGHT';

  // Button row
  const buttonRow = figma.createFrame();
  buttonRow.name = 'ButtonRow';
  buttonRow.layoutMode = 'HORIZONTAL';
  buttonRow.primaryAxisAlignItems = 'CENTER';
  buttonRow.counterAxisAlignItems = 'CENTER';
  buttonRow.itemSpacing = 16;
  buttonRow.fills = [];
  buttonRow.resize(400, 56);

  // Back button
  const backButton = figma.createFrame();
  backButton.name = 'BackButton';
  backButton.layoutMode = 'HORIZONTAL';
  backButton.primaryAxisAlignItems = 'CENTER';
  backButton.counterAxisAlignItems = 'CENTER';
  backButton.cornerRadius = 8;
  backButton.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
  backButton.resize(120, 48);
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const backText = figma.createText();
  backText.name = 'BackButtonText';
  backText.fontName = { family: 'Inter', style: 'Regular' };
  backText.characters = step.backButtonText || 'Back';
  backText.fontSize = 20;
  backText.textAlignHorizontal = 'CENTER';
  backText.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  backButton.appendChild(backText);

  // CTA button
  const ctaButton = figma.createFrame();
  ctaButton.name = 'Button';
  ctaButton.layoutMode = 'HORIZONTAL';
  ctaButton.primaryAxisAlignItems = 'CENTER';
  ctaButton.counterAxisAlignItems = 'CENTER';
  ctaButton.cornerRadius = 8;
  ctaButton.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.44, b: 1 } }];
  ctaButton.resize(120, 48);
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' }).catch(() => figma.loadFontAsync({ family: 'Inter', style: 'Bold' }));
  const ctaText = figma.createText();
  ctaText.name = 'ButtonText';
  ctaText.fontName = { family: 'Inter', style: 'Medium' };
  ctaText.characters = step.buttonText || step.cta || step.ctaText || 'Continue';
  ctaText.fontSize = 20;
  ctaText.textAlignHorizontal = 'CENTER';
  ctaText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  ctaText.textAlignVertical = 'CENTER';
  ctaButton.appendChild(ctaText);

  buttonRow.appendChild(backButton);
  buttonRow.appendChild(ctaButton);

  // Assemble right
  right.appendChild(headline);
  right.appendChild(subtitle);
  right.appendChild(marketingCopy);
  right.appendChild(buttonRow);

  // Assemble main frame
  frame.appendChild(left);
  frame.appendChild(right);
  return frame;
}

// TOOLTIP LAYOUT
async function createTooltipLayout(step: any): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = step.stepName || 'Tooltip Layout';
  frame.resize(1400, 900); // Always 900px tall
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.itemSpacing = 0;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';

  // Tooltip card
  const card = figma.createFrame();
  card.name = 'TooltipCard';
  card.resize(340, 160);
  card.cornerRadius = 12;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.layoutMode = 'VERTICAL';
  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'CENTER';
  card.itemSpacing = 12;
  card.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.18 }, offset: { x: 0, y: 8 }, radius: 32, spread: 0, visible: true, blendMode: 'NORMAL' }];
  card.paddingTop = 24;
  card.paddingBottom = 24;
  card.paddingLeft = 24;
  card.paddingRight = 24;

  // Headline
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  const headline = figma.createText();
  headline.name = 'Headline';
  headline.fontName = { family: 'Inter', style: 'Bold' };
  headline.characters = step.headline || step.title || 'headline';
  headline.fontSize = 20;
  headline.textAlignHorizontal = 'LEFT';
  headline.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];

  // Marketing copy
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const marketingCopy = figma.createText();
  marketingCopy.name = 'MarketingCopy';
  marketingCopy.fontName = { family: 'Inter', style: 'Regular' };
  marketingCopy.characters = step.marketingCopy || 'marketingCopy';
  marketingCopy.fontSize = 16;
  marketingCopy.textAlignHorizontal = 'LEFT';
  marketingCopy.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  marketingCopy.resize(768, marketingCopy.height); // set max width
  marketingCopy.textAutoResize = 'HEIGHT';

  // Progress dots
  const dotsFrame = figma.createFrame();
  dotsFrame.name = 'ProgressDots';
  dotsFrame.layoutMode = 'HORIZONTAL';
  dotsFrame.primaryAxisAlignItems = 'CENTER';
  dotsFrame.counterAxisAlignItems = 'CENTER';
  dotsFrame.itemSpacing = 8;
  dotsFrame.fills = [];
  for (let i = 0; i < 4; i++) {
    const dot = figma.createEllipse();
    dot.name = `ProgressDot${i+1}`;
    dot.resize(8, 8);
    dot.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.19 } }];
    if (i !== 0) dot.opacity = 0.15;
    dotsFrame.appendChild(dot);
  }

  // Button row
  const buttonRow = figma.createFrame();
  buttonRow.name = 'ButtonRow';
  buttonRow.layoutMode = 'HORIZONTAL';
  buttonRow.primaryAxisAlignItems = 'CENTER';
  buttonRow.counterAxisAlignItems = 'CENTER';
  buttonRow.itemSpacing = 8;
  buttonRow.fills = [];
  buttonRow.resize(200, 40);

  // Skip button
  const skipButton = figma.createFrame();
  skipButton.name = 'SkipButton';
  skipButton.layoutMode = 'HORIZONTAL';
  skipButton.primaryAxisAlignItems = 'CENTER';
  skipButton.counterAxisAlignItems = 'CENTER';
  skipButton.cornerRadius = 8;
  skipButton.fills = [];
  skipButton.resize(60, 40);
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const skipText = figma.createText();
  skipText.name = 'SkipButtonText';
  skipText.fontName = { family: 'Inter', style: 'Regular' };
  skipText.characters = step.skipButtonText || 'Skip';
  skipText.fontSize = 16;
  skipText.textAlignHorizontal = 'CENTER';
  skipText.fills = [{ type: 'SOLID', color: { r: 0.44, g: 0.51, b: 0.6 } }];
  skipButton.appendChild(skipText);

  // CTA button
  const ctaButton = figma.createFrame();
  ctaButton.name = 'Button';
  ctaButton.layoutMode = 'HORIZONTAL';
  ctaButton.primaryAxisAlignItems = 'CENTER';
  ctaButton.counterAxisAlignItems = 'CENTER';
  ctaButton.cornerRadius = 8;
  ctaButton.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.44, b: 1 } }];
  ctaButton.resize(60, 40);
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' }).catch(() => figma.loadFontAsync({ family: 'Inter', style: 'Bold' }));
  const ctaText = figma.createText();
  ctaText.name = 'ButtonText';
  ctaText.fontName = { family: 'Inter', style: 'Medium' };
  ctaText.characters = step.buttonText || step.cta || step.ctaText || 'Continue';
  ctaText.fontSize = 16;
  ctaText.textAlignHorizontal = 'CENTER';
  ctaText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  ctaText.textAlignVertical = 'CENTER';
  ctaButton.appendChild(ctaText);

  buttonRow.appendChild(skipButton);
  buttonRow.appendChild(ctaButton);

  // Assemble card
  card.appendChild(headline);
  card.appendChild(marketingCopy);
  card.appendChild(dotsFrame);
  card.appendChild(buttonRow);
  frame.appendChild(card);
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
