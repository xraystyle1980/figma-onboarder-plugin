// Main plugin entry point - refactored and modular

import __html__ from "../ui.html";
import { OnboardingFlow, PluginMessage } from './types';
import { JsonValidator } from './utils/json-validator';
import { FontLoader } from './utils/font-loader';
import { LayoutFactory } from './layouts/layout-factory';
import { AnnotationFactory } from './components/annotation-factory';
import { PLUGIN_CONFIG } from './config/design-tokens';

// Plugin initialization
figma.showUI(__html__, { width: 400, height: 400 });

// Message handler
figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === 'generate-screens') {
    await handleGenerateScreens(msg.json);
  }
};

async function handleGenerateScreens(jsonData?: string): Promise<void> {
  if (!jsonData) {
    figma.notify('No JSON data provided', { error: true });
    return;
  }

  try {
    // Step 1: Validate JSON
    const validationResult = JsonValidator.validateOnboardingFlow(JSON.parse(jsonData));
    
    if (!validationResult.isValid) {
      const errorMessage = `Validation errors:\n${validationResult.errors.join('\n')}`;
      figma.notify(errorMessage, { error: true });
      console.error('Validation errors:', validationResult.errors);
      return;
    }

    const flow = validationResult.flow!;
    console.log('Successfully validated flow with', flow.steps.length, 'steps');
    
    // DEBUG: Log each step
    flow.steps.forEach((step, index) => {
      console.log(`Step ${index + 1}: ${step.stepName} (${step.layoutType}) flowEnd: ${step.flowEnd || false}`);
    });

    // Step 2: Pre-load fonts and pages
    await Promise.all([
      FontLoader.loadAllFonts(),
      figma.loadAllPagesAsync()
    ]);

    // Step 3: Generate frames
    const createdFrames = await generateFrames(flow);

    // Step 4: Position and finalize
    positionFrames(createdFrames);
    finalizeGeneration(createdFrames);

  } catch (error: any) {
    const errorMessage = `Error processing JSON: ${error.message}`;
    figma.notify(errorMessage, { error: true });
    console.error('Generation error:', error);
  }
}

async function generateFrames(flow: OnboardingFlow): Promise<SceneNode[]> {
  const createdFrames: SceneNode[] = [];
  const totalSteps = flow.steps.length;

  console.log(`DEBUG: Starting generateFrames with ${totalSteps} steps`);

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    
    try {
      console.log(`DEBUG: Processing step ${i + 1}/${totalSteps}: ${step.stepName} (${step.layoutType}) flowEnd: ${step.flowEnd || false}`);
      
      // Create layout
      const layoutFrame = await LayoutFactory.createLayout(step);
      console.log(`DEBUG: Created layout frame for step ${i + 1}`);
      
      // Create container with annotations
      const containerFrame = await AnnotationFactory.createContainerWithAnnotations(
        layoutFrame, 
        step, 
        i, 
        totalSteps
      );
      console.log(`DEBUG: Created container frame for step ${i + 1}`);

      // Add to page
      figma.currentPage.appendChild(containerFrame);
      createdFrames.push(containerFrame);
      console.log(`DEBUG: Added frame ${i + 1} to page and array`);

    } catch (error: any) {
      console.error(`ERROR: Failed to generate step ${i + 1}:`, error);
      
      // Create error frame as fallback
      const errorFrame = await createErrorFrame(step, i, error);
      figma.currentPage.appendChild(errorFrame);
      createdFrames.push(errorFrame);
      console.log(`DEBUG: Added error frame for step ${i + 1}`);
    }
  }

  console.log(`DEBUG: generateFrames completed with ${createdFrames.length} frames`);
  return createdFrames;
}

function positionFrames(frames: SceneNode[]): void {
  frames.forEach((frame, index) => {
    if ('x' in frame && 'y' in frame) {
      frame.x = index * (PLUGIN_CONFIG.maxFrameWidth + PLUGIN_CONFIG.frameSpacing);
      frame.y = 40;
    }
  });
}

function finalizeGeneration(frames: SceneNode[]): void {
  if (frames.length === 0) {
    figma.notify('No frames were generated', { error: true });
    return;
  }

  // Center frames in viewport
  figma.viewport.scrollAndZoomIntoView(frames);
  
  // Select all created frames
  figma.currentPage.selection = frames;
  
  // Success notification
  const successMessage = `Successfully generated ${frames.length} screen${frames.length !== 1 ? 's' : ''}`;
  figma.notify(successMessage);
  
  // Notify UI about completion
  figma.ui.postMessage({
    type: 'generation-complete',
    data: { stepCount: frames.length }
  });
  
  // Close plugin after successful generation
  figma.closePlugin();
}


async function createErrorFrame(step: any, index: number, error: any): Promise<FrameNode> {
  const errorFrame = figma.createFrame();
  errorFrame.name = `Error - Step ${index + 1}`;
  errorFrame.resize(400, 200);
  errorFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 0.95, b: 0.95 } }];
  
  // Load font for error message
  await FontLoader.loadFont({ family: 'Inter', style: 'Regular' });
  
  const errorText = figma.createText();
  errorText.fontName = { family: 'Inter', style: 'Regular' };
  errorText.characters = `Error generating step: ${step && step.stepName || 'Unknown'}\n${error && error.message || 'Unknown error'}`;
  errorText.fontSize = 14;
  errorText.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.2, b: 0.2 } }];
  
  errorFrame.appendChild(errorText);
  return errorFrame;
}