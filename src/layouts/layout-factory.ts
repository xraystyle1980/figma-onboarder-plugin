// Layout factory - central registry for all layout creators

import { LayoutCreator, OnboardingStep, LayoutType } from '../types';
import { FullScreenLayoutCreator } from './full-screen-layout';
import { ModalLayoutCreator } from './modal-layout';
import { SplitScreenLayoutCreator } from './split-screen-layout';
import { TooltipLayoutCreator } from './tooltip-layout';

export class LayoutFactory {
  private static creators: Map<LayoutType, LayoutCreator> = new Map([
    ['full_screen', new FullScreenLayoutCreator()],
    ['modal_layout', new ModalLayoutCreator()],
    ['modal_form', new ModalLayoutCreator()], // Same as modal_layout but with form fields
    ['split_screen', new SplitScreenLayoutCreator()],
    ['tooltip_overlay', new TooltipLayoutCreator()],
  ]);

  static async createLayout(step: OnboardingStep): Promise<FrameNode> {
    const creator = this.creators.get(step.layoutType);
    
    if (!creator) {
      console.warn(`No creator found for layout type: ${step.layoutType}. Using fallback.`);
      return this.createFallbackLayout(step);
    }

    try {
      return await creator.create(step);
    } catch (error) {
      console.error(`Error creating layout ${step.layoutType}:`, error);
      return this.createErrorLayout(step, error);
    }
  }

  static registerCreator(layoutType: LayoutType, creator: LayoutCreator): void {
    this.creators.set(layoutType, creator);
  }

  static getAvailableLayouts(): LayoutType[] {
    return Array.from(this.creators.keys());
  }

  private static async createFallbackLayout(step: OnboardingStep): Promise<FrameNode> {
    // Use full screen layout as fallback
    const fallbackCreator = this.creators.get('full_screen');
    if (fallbackCreator) {
      const layout = await fallbackCreator.create(step);
      layout.name = `${step.stepName} (Fallback Layout)`;
      return layout;
    }
    
    // Ultimate fallback - create a simple frame with error message
    return this.createErrorLayout(step, new Error('No fallback layout available'));
  }

  private static async createErrorLayout(step: OnboardingStep, error: any): Promise<FrameNode> {
    const errorFrame = figma.createFrame();
    errorFrame.name = `Error: ${step.stepName}`;
    errorFrame.resize(400, 300);
    errorFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 0.9, b: 0.9 } }]; // Light red background
    errorFrame.layoutMode = 'VERTICAL';
    errorFrame.primaryAxisAlignItems = 'CENTER';
    errorFrame.counterAxisAlignItems = 'CENTER';
    errorFrame.itemSpacing = 16;
    errorFrame.paddingTop = 32;
    errorFrame.paddingBottom = 32;
    errorFrame.paddingLeft = 32;
    errorFrame.paddingRight = 32;

    // Error title
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    const errorTitle = figma.createText();
    errorTitle.fontName = { family: 'Inter', style: 'Bold' };
    errorTitle.characters = 'Layout Error';
    errorTitle.fontSize = 24;
    errorTitle.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.2, b: 0.2 } }];
    errorTitle.textAlignHorizontal = 'CENTER';

    // Error message
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const errorMessage = figma.createText();
    errorMessage.fontName = { family: 'Inter', style: 'Regular' };
    errorMessage.characters = `Failed to create layout: ${step.layoutType}\nStep: ${step.stepName}\nError: ${error?.message || 'Unknown error'}`;
    errorMessage.fontSize = 14;
    errorMessage.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.1, b: 0.1 } }];
    errorMessage.textAlignHorizontal = 'CENTER';
    errorMessage.resize(320, errorMessage.height);

    errorFrame.appendChild(errorTitle);
    errorFrame.appendChild(errorMessage);

    return errorFrame;
  }
}