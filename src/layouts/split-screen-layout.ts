// Split screen layout creator

import { LayoutCreator, OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from '../components/text-factory';
import { ButtonFactory } from '../components/button-factory';
import { FormFactory } from '../components/form-factory';

export class SplitScreenLayoutCreator implements LayoutCreator {
  name = 'Split Screen Layout';

  async create(step: OnboardingStep): Promise<FrameNode> {
    // Determine variant based on whether there are input fields
    const hasInputFields = step.inputFields && step.inputFields.length > 0;
    
    if (hasInputFields) {
      return this.createFormVariant(step);
    } else {
      return this.createInformationVariant(step);
    }
  }

  // Information variant - static content only
  private async createInformationVariant(step: OnboardingStep): Promise<FrameNode> {
    const frame = figma.createFrame();
    frame.name = `${step.stepName} - Split Screen Info`;
    frame.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    frame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Left side - Image/Visual
    const leftSide = await this.createImageSection();
    frame.appendChild(leftSide);

    // Right side - Information Content
    const rightSide = await this.createInformationContentSection(step);
    frame.appendChild(rightSide);

    return frame;
  }

  // Form variant - with input fields
  private async createFormVariant(step: OnboardingStep): Promise<FrameNode> {
    const frame = figma.createFrame();
    frame.name = `${step.stepName} - Split Screen Form`;
    frame.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    frame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Left side - Image/Visual (same as info variant)
    const leftSide = await this.createImageSection();
    frame.appendChild(leftSide);

    // Right side - Form Content
    const rightSide = await this.createFormContentSection(step);
    frame.appendChild(rightSide);

    return frame;
  }

  private async createImageSection(): Promise<FrameNode> {
    const imageSection = figma.createFrame();
    imageSection.name = 'Image Section';
    imageSection.resize(DESIGN_TOKENS.dimensions.desktop.width / 2, DESIGN_TOKENS.dimensions.desktop.height);
    imageSection.layoutMode = 'VERTICAL';
    imageSection.primaryAxisSizingMode = 'FIXED';
    imageSection.counterAxisSizingMode = 'FIXED';
    imageSection.primaryAxisAlignItems = 'CENTER';
    imageSection.counterAxisAlignItems = 'CENTER';
    // Match the light blue/gray background from the PNG
    imageSection.fills = [{ type: 'SOLID', color: { r: 0.89, g: 0.93, b: 0.95 } }];


    return imageSection;
  }

  // Information content section - for static content
  private async createInformationContentSection(step: OnboardingStep): Promise<FrameNode> {
    const contentSection = figma.createFrame();
    contentSection.name = 'Information Content Section';
    contentSection.resize(DESIGN_TOKENS.dimensions.desktop.width / 2, DESIGN_TOKENS.dimensions.desktop.height);
    contentSection.layoutMode = 'VERTICAL';
    contentSection.primaryAxisAlignItems = 'CENTER';
    contentSection.counterAxisAlignItems = 'CENTER';
    contentSection.itemSpacing = 24; // Spacing between content container and buttons
    contentSection.paddingTop = 120; // Centered vertically
    contentSection.paddingBottom = 120;
    contentSection.paddingLeft = 80;
    contentSection.paddingRight = 80;
    contentSection.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Content container for headlines, text, etc.
    const contentContainer = figma.createFrame();
    contentContainer.name = 'Content Container';
    contentContainer.layoutMode = 'VERTICAL';
    contentContainer.primaryAxisSizingMode = 'AUTO';
    contentContainer.counterAxisSizingMode = 'AUTO';
    contentContainer.primaryAxisAlignItems = 'MIN'; // Left-aligned content
    contentContainer.counterAxisAlignItems = 'MIN';
    contentContainer.itemSpacing = 24;
    contentContainer.fills = [];

    // Headline - large, bold, dark
    if (step.headline) {
      const headline = await TextFactory.createText({
        content: step.headline,
        fontSize: 48, // Large size to match design
        fontName: DESIGN_TOKENS.fonts.bold,
        color: { r: 0.1, g: 0.1, b: 0.1 }, // Dark text
        textAlign: 'LEFT',
        maxWidth: 400
      });
      contentContainer.appendChild(headline);
    }

    // Subtitle - medium, gray
    if (step.subtitle) {
      const subtitle = await TextFactory.createText({
        content: step.subtitle,
        fontSize: 18,
        fontName: DESIGN_TOKENS.fonts.primary,
        color: { r: 0.5, g: 0.5, b: 0.5 }, // Gray text to match design
        textAlign: 'LEFT',
        maxWidth: 400
      });
      contentContainer.appendChild(subtitle);
    }

    // Marketing copy - regular, darker than subtitle
    if (step.marketingCopy) {
      const marketingCopy = await TextFactory.createText({
        content: step.marketingCopy,
        fontSize: 16,
        fontName: DESIGN_TOKENS.fonts.primary,
        color: { r: 0.4, g: 0.4, b: 0.4 },
        textAlign: 'LEFT',
        maxWidth: 400
      });
      marketingCopy.layoutGrow = 1;
      marketingCopy.layoutAlign = 'STRETCH';
      contentContainer.appendChild(marketingCopy);
    }

    // Add content container to section
    contentSection.appendChild(contentContainer);

    // Button container - horizontal layout like the design
    const buttonContainer = await this.createButtonContainer(step.cta);
    contentSection.appendChild(buttonContainer);

    return contentSection;
  }

  // Form content section - for interactive content with input fields
  private async createFormContentSection(step: OnboardingStep): Promise<FrameNode> {
    const contentSection = figma.createFrame();
    contentSection.name = 'Form Content Section';
    contentSection.resize(DESIGN_TOKENS.dimensions.desktop.width / 2, DESIGN_TOKENS.dimensions.desktop.height);
    contentSection.layoutMode = 'VERTICAL';
    contentSection.primaryAxisAlignItems = 'CENTER';
    contentSection.counterAxisAlignItems = 'CENTER';
    contentSection.itemSpacing = 24; // Spacing between content container and buttons
    contentSection.paddingTop = 80; // Less padding for form content
    contentSection.paddingBottom = 80;
    contentSection.paddingLeft = 80;
    contentSection.paddingRight = 80;
    contentSection.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Content container for headlines, text, and forms
    const contentContainer = figma.createFrame();
    contentContainer.name = 'Content Container';
    contentContainer.layoutMode = 'VERTICAL';
    contentContainer.primaryAxisSizingMode = 'AUTO';
    contentContainer.counterAxisSizingMode = 'AUTO';
    contentContainer.primaryAxisAlignItems = 'MIN'; // Left-aligned content
    contentContainer.counterAxisAlignItems = 'MIN';
    contentContainer.itemSpacing = 24;
    contentContainer.fills = [];

    // Headline - same styling as info variant
    if (step.headline) {
      const headline = await TextFactory.createText({
        content: step.headline,
        fontSize: 48,
        fontName: DESIGN_TOKENS.fonts.bold,
        color: { r: 0.1, g: 0.1, b: 0.1 },
        textAlign: 'LEFT',
        maxWidth: 400
      });
      contentContainer.appendChild(headline);
    }

    // Subtitle - same styling as info variant
    if (step.subtitle) {
      const subtitle = await TextFactory.createText({
        content: step.subtitle,
        fontSize: 18,
        fontName: DESIGN_TOKENS.fonts.primary,
        color: { r: 0.5, g: 0.5, b: 0.5 },
        textAlign: 'LEFT',
        maxWidth: 400
      });
      contentContainer.appendChild(subtitle);
    }

    // Form fields
    if (step.inputFields && step.inputFields.length > 0) {
      const form = await FormFactory.createForm(step.inputFields);
      contentContainer.appendChild(form);
    }

    // Add content container to section
    contentSection.appendChild(contentContainer);

    // Button container - same as info variant
    const buttonContainer = await this.createButtonContainer(step.cta);
    contentSection.appendChild(buttonContainer);

    return contentSection;
  }

  // Button container matching the design - "Back" (ghost) + "cta" (primary)
  private async createButtonContainer(ctaText?: string): Promise<FrameNode> {
    const buttonContainer = figma.createFrame();
    buttonContainer.name = 'Button Container';
    buttonContainer.layoutMode = 'HORIZONTAL';
    buttonContainer.primaryAxisSizingMode = 'FIXED';
    buttonContainer.counterAxisSizingMode = 'AUTO';
    buttonContainer.resize(400, 80); // Fixed width of 400px
    buttonContainer.itemSpacing = 16; // Spacing between buttons
    buttonContainer.paddingTop = DESIGN_TOKENS.spacing.lg; // Add top padding
    buttonContainer.fills = [];

    // Back button - ghost style with fixed width
    const backButton = figma.createFrame();
    backButton.name = 'Back Button';
    backButton.layoutMode = 'HORIZONTAL';
    backButton.primaryAxisAlignItems = 'CENTER';
    backButton.counterAxisAlignItems = 'CENTER';
    backButton.primaryAxisSizingMode = 'FIXED';
    backButton.counterAxisSizingMode = 'FIXED';
    backButton.resize(80, 44);
    backButton.cornerRadius = 8;
    backButton.fills = []; // Transparent background

    const backButtonText = await TextFactory.createText({
      content: 'Back',
      fontSize: 16,
      fontName: DESIGN_TOKENS.fonts.primary,
      color: { r: 0.6, g: 0.6, b: 0.6 }, // Light gray text
      textAlign: 'CENTER'
    });
    
    backButton.appendChild(backButtonText);
    buttonContainer.appendChild(backButton);

    // Primary CTA button - blue background
    if (ctaText) {
      const ctaButton = figma.createFrame();
      ctaButton.name = 'CTA Button';
      ctaButton.layoutMode = 'HORIZONTAL';
      ctaButton.primaryAxisAlignItems = 'CENTER';
      ctaButton.counterAxisAlignItems = 'CENTER';
      ctaButton.primaryAxisSizingMode = 'AUTO';
      ctaButton.counterAxisSizingMode = 'AUTO';
      ctaButton.paddingLeft = 24;
      ctaButton.paddingRight = 24;
      ctaButton.paddingTop = 12;
      ctaButton.paddingBottom = 12;
      ctaButton.cornerRadius = 8;
      ctaButton.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.47, b: 1 } }]; // Blue background

      const ctaTextElement = await TextFactory.createText({
        content: ctaText,
        fontSize: 16,
        fontName: DESIGN_TOKENS.fonts.medium,
        color: { r: 1, g: 1, b: 1 }, // White text
        textAlign: 'CENTER'
      });

      ctaButton.appendChild(ctaTextElement);
      buttonContainer.appendChild(ctaButton);
    }

    return buttonContainer;
  }
}