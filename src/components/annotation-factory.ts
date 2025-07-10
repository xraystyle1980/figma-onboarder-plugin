// Annotation factory for creating step documentation

import { OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from './text-factory';

export class AnnotationFactory {
  static async createStepAnnotations(step: OnboardingStep, index: number, totalSteps: number): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = 'Annotations';
    container.layoutMode = 'VERTICAL';
    container.layoutAlign = 'STRETCH';
    container.primaryAxisSizingMode = 'AUTO';
    container.counterAxisSizingMode = 'FIXED';
    container.resize(400, 0); // Fixed width, auto height
    container.fills = [];
    container.paddingLeft = DESIGN_TOKENS.spacing.lg;
    container.paddingRight = DESIGN_TOKENS.spacing.lg;
    container.paddingTop = DESIGN_TOKENS.spacing.lg;
    container.paddingBottom = DESIGN_TOKENS.spacing.lg;
    container.itemSpacing = DESIGN_TOKENS.spacing.lg;

    // Step title
    const stepTitle = await this.createStepTitle(step.stepName, index, totalSteps);
    container.appendChild(stepTitle);

    // Add annotations for each field
    const annotations = [
      { label: 'UX Goal', content: step.uxGoal },
      { label: 'User Action', content: step.userAction },
      { label: 'Rationale', content: step.rationale },
      { label: 'Layout Type', content: step.layoutType },
      { label: 'Modal Type', content: step.modalType },
      { label: 'CTA Type', content: step.ctaType }
    ];

    for (const annotation of annotations) {
      if (annotation.content) {
        const annotationElement = await TextFactory.createAnnotationText(
          annotation.label,
          annotation.content
        );
        container.appendChild(annotationElement);
      }
    }

    // Add input fields summary if present
    if (step.inputFields && step.inputFields.length > 0) {
      const inputFieldsSummary = await this.createInputFieldsSummary(step.inputFields);
      container.appendChild(inputFieldsSummary);
    }

    return container;
  }

  private static async createStepTitle(stepName: string, index: number, totalSteps: number): Promise<TextNode> {
    const title = await TextFactory.createText({
      content: `Step ${index + 1} of ${totalSteps}: ${stepName}`,
      fontSize: DESIGN_TOKENS.fontSizes.title,
      fontName: DESIGN_TOKENS.fonts.bold,
      color: DESIGN_TOKENS.colors.primary
    });

    return title;
  }

  private static async createInputFieldsSummary(inputFields: any[]): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = 'Input Fields Summary';
    container.layoutMode = 'VERTICAL';
    container.primaryAxisSizingMode = 'AUTO';
    container.counterAxisSizingMode = 'AUTO';
    container.itemSpacing = DESIGN_TOKENS.spacing.xs;
    container.fills = [];

    const label = await TextFactory.createText({
      content: 'INPUT FIELDS',
      fontSize: DESIGN_TOKENS.fontSizes.small,
      fontName: DESIGN_TOKENS.fonts.bold,
      color: DESIGN_TOKENS.colors.secondary,
      textCase: 'UPPER'
    });

    container.appendChild(label);

    // Create summary of input fields
    const fieldsList = inputFields.map(field => 
      `• ${field.label} (${field.type})${field.required ? ' *' : ''}`
    ).join('\n');

    const fieldsText = await TextFactory.createBody(fieldsList);
    container.appendChild(fieldsText);

    return container;
  }

  static async createContainerWithAnnotations(
    layoutFrame: FrameNode, 
    step: OnboardingStep, 
    index: number, 
    totalSteps: number
  ): Promise<FrameNode> {
    // Create main container
    const containerFrame = figma.createFrame();
    containerFrame.name = `Step ${index + 1}: ${step.stepName}`;
    containerFrame.layoutMode = 'VERTICAL';
    containerFrame.primaryAxisSizingMode = 'AUTO';
    containerFrame.counterAxisSizingMode = 'AUTO';
    containerFrame.itemSpacing = DESIGN_TOKENS.spacing.xl;
    containerFrame.fills = []; // Transparent

    // Add the layout frame
    containerFrame.appendChild(layoutFrame);

    // Create and add annotations
    const annotations = await this.createStepAnnotations(step, index, totalSteps);
    containerFrame.appendChild(annotations);

    return containerFrame;
  }
}