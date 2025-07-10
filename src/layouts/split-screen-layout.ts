// Split screen layout creator

import { LayoutCreator, OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from '../components/text-factory';
import { ButtonFactory } from '../components/button-factory';

export class SplitScreenLayoutCreator implements LayoutCreator {
  name = 'Split Screen Layout';

  async create(step: OnboardingStep): Promise<FrameNode> {
    // Main frame
    const frame = figma.createFrame();
    frame.name = step.stepName || 'Split Screen Layout';
    frame.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    frame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Left side - Image/Visual
    const leftSide = await this.createImageSection();
    frame.appendChild(leftSide);

    // Right side - Content
    const rightSide = await this.createContentSection(step);
    frame.appendChild(rightSide);

    return frame;
  }

  private async createImageSection(): Promise<FrameNode> {
    const imageSection = figma.createFrame();
    imageSection.name = 'Image Section';
    imageSection.resize(DESIGN_TOKENS.dimensions.desktop.width / 2, DESIGN_TOKENS.dimensions.desktop.height);
    imageSection.layoutMode = 'VERTICAL';
    imageSection.primaryAxisAlignItems = 'CENTER';
    imageSection.counterAxisAlignItems = 'CENTER';
    imageSection.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.background }];

    // Image placeholder
    const imagePlaceholder = figma.createFrame();
    imagePlaceholder.name = 'Image Placeholder';
    imagePlaceholder.resize(400, 300);
    imagePlaceholder.cornerRadius = DESIGN_TOKENS.borderRadius.lg;
    imagePlaceholder.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
    imagePlaceholder.layoutMode = 'VERTICAL';
    imagePlaceholder.primaryAxisAlignItems = 'CENTER';
    imagePlaceholder.counterAxisAlignItems = 'CENTER';

    // Placeholder icon
    const placeholderIcon = figma.createRectangle();
    placeholderIcon.resize(80, 60);
    placeholderIcon.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    placeholderIcon.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.secondary }];

    imagePlaceholder.appendChild(placeholderIcon);
    imageSection.appendChild(imagePlaceholder);

    return imageSection;
  }

  private async createContentSection(step: OnboardingStep): Promise<FrameNode> {
    const contentSection = figma.createFrame();
    contentSection.name = 'Content Section';
    contentSection.resize(DESIGN_TOKENS.dimensions.desktop.width / 2, DESIGN_TOKENS.dimensions.desktop.height);
    contentSection.layoutMode = 'VERTICAL';
    contentSection.primaryAxisAlignItems = 'MIN';
    contentSection.counterAxisAlignItems = 'CENTER';
    contentSection.itemSpacing = DESIGN_TOKENS.spacing.lg;
    contentSection.paddingTop = DESIGN_TOKENS.spacing.xxxxl;
    contentSection.paddingBottom = DESIGN_TOKENS.spacing.xxxxl;
    contentSection.paddingLeft = DESIGN_TOKENS.spacing.xxxxl;
    contentSection.paddingRight = DESIGN_TOKENS.spacing.xl;
    contentSection.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Progress indicator (optional)
    const progressIndicator = await this.createProgressIndicator();
    contentSection.appendChild(progressIndicator);

    // Headline
    if (step.headline) {
      const headline = await TextFactory.createTitle(step.headline, {
        textAlign: 'LEFT',
        maxWidth: 500
      });
      contentSection.appendChild(headline);
    }

    // Subtitle
    if (step.subtitle) {
      const subtitle = await TextFactory.createBody(step.subtitle, {
        textAlign: 'LEFT',
        color: DESIGN_TOKENS.colors.secondary,
        maxWidth: 500
      });
      contentSection.appendChild(subtitle);
    }

    // Marketing copy
    if (step.marketingCopy) {
      const marketingCopy = await TextFactory.createBody(step.marketingCopy, {
        textAlign: 'LEFT',
        maxWidth: 500
      });
      contentSection.appendChild(marketingCopy);
    }

    // CTA Button
    if (step.cta) {
      const ctaButton = await ButtonFactory.createPrimaryButton(step.cta, {
        size: 'large'
      });
      contentSection.appendChild(ctaButton);
    }

    return contentSection;
  }

  private async createProgressIndicator(): Promise<FrameNode> {
    const progressContainer = figma.createFrame();
    progressContainer.name = 'Progress Indicator';
    progressContainer.layoutMode = 'HORIZONTAL';
    progressContainer.primaryAxisSizingMode = 'AUTO';
    progressContainer.counterAxisSizingMode = 'AUTO';
    progressContainer.itemSpacing = DESIGN_TOKENS.spacing.sm;
    progressContainer.fills = [];

    // Create 4 dots as example
    for (let i = 0; i < 4; i++) {
      const dot = figma.createEllipse();
      dot.name = `Progress Dot ${i + 1}`;
      dot.resize(8, 8);
      dot.fills = [{ 
        type: 'SOLID', 
        color: i === 0 ? DESIGN_TOKENS.colors.accent : DESIGN_TOKENS.colors.border 
      }];
      progressContainer.appendChild(dot);
    }

    return progressContainer;
  }
}