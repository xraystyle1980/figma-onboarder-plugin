// Modal layout creator

import { LayoutCreator, OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from '../components/text-factory';
import { ButtonFactory } from '../components/button-factory';
import { FormFactory } from '../components/form-factory';

export class ModalLayoutCreator implements LayoutCreator {
  name = 'Modal Layout';

  async create(step: OnboardingStep): Promise<FrameNode> {
    // Main container
    const container = figma.createFrame();
    container.name = `${step.stepName} - Modal Container`;
    container.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    container.layoutMode = 'NONE'; // No auto-layout for absolute positioning
    container.primaryAxisSizingMode = 'FIXED';
    container.counterAxisSizingMode = 'FIXED';
    container.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Background overlay
    const overlay = figma.createFrame();
    overlay.name = 'Modal Overlay';
    overlay.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    overlay.fills = [{ 
      type: 'SOLID', 
      color: { r: 0, g: 0, b: 0 } // Semi-transparent overlay
    }];
    overlay.opacity = 0.5;
    overlay.x = 0;
    overlay.y = 0;
    container.appendChild(overlay);

    // Modal container
    const modal = figma.createFrame();
    modal.name = 'Modal';
    modal.resize(
      step.modalType === 'form' ? 500 : DESIGN_TOKENS.dimensions.modal.width,
      0 // Auto height
    );
    modal.layoutMode = 'VERTICAL';
    modal.primaryAxisSizingMode = 'AUTO'; // Auto height based on content
    modal.counterAxisSizingMode = 'FIXED'; // Fixed width
    modal.primaryAxisAlignItems = 'CENTER'; // Center content vertically
    modal.counterAxisAlignItems = 'CENTER'; // Center content horizontally
    modal.itemSpacing = DESIGN_TOKENS.spacing.lg;
    modal.paddingTop = DESIGN_TOKENS.spacing.xl;
    modal.paddingBottom = DESIGN_TOKENS.spacing.xl;
    modal.paddingLeft = DESIGN_TOKENS.spacing.xl;
    modal.paddingRight = DESIGN_TOKENS.spacing.xl;
    modal.cornerRadius = DESIGN_TOKENS.borderRadius.lg;
    modal.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    modal.effects = [DESIGN_TOKENS.shadows.lg];

    // Modal content based on type
    await this.addModalContent(modal, step);

    // Center the modal on the screen after content is added
    modal.x = (DESIGN_TOKENS.dimensions.desktop.width - modal.width) / 2;
    modal.y = (DESIGN_TOKENS.dimensions.desktop.height - modal.height) / 2;

    container.appendChild(modal);
    return container;
  }

  private async addModalContent(modal: FrameNode, step: OnboardingStep): Promise<void> {
    switch (step.modalType) {
      case 'welcome':
        await this.addWelcomeContent(modal, step);
        break;
      case 'form':
        await this.addFormContent(modal, step);
        break;
      case 'confirmation':
        await this.addConfirmationContent(modal, step);
        break;
      case 'summary':
        await this.addSummaryContent(modal, step);
        break;
      default:
        await this.addDefaultContent(modal, step);
    }
  }

  private async addWelcomeContent(modal: FrameNode, step: OnboardingStep): Promise<void> {
    // Icon
    const icon = await this.createModalIcon();
    modal.appendChild(icon);

    // Headline
    if (step.headline) {
      const headline = await TextFactory.createTitle(step.headline, {
        textAlign: 'CENTER'
      });
      modal.appendChild(headline);
    }

    // Subtitle
    if (step.subtitle) {
      const subtitle = await TextFactory.createBody(step.subtitle, {
        textAlign: 'CENTER',
        color: DESIGN_TOKENS.colors.secondary
      });
      modal.appendChild(subtitle);
    }

    // CTA Button
    if (step.cta) {
      const button = await ButtonFactory.createPrimaryButton(step.cta, {
        width: 200
      });
      modal.appendChild(button);
    }
  }

  private async addFormContent(modal: FrameNode, step: OnboardingStep): Promise<void> {
    // Content wrapper - centered layout like the design
    const contentWrapper = figma.createFrame();
    contentWrapper.name = 'Content Wrapper';
    contentWrapper.layoutMode = 'VERTICAL';
    contentWrapper.primaryAxisSizingMode = 'AUTO';
    contentWrapper.counterAxisSizingMode = 'AUTO';
    contentWrapper.primaryAxisAlignItems = 'CENTER';
    contentWrapper.counterAxisAlignItems = 'CENTER';
    contentWrapper.itemSpacing = 24;
    contentWrapper.fills = [];

    // Icon - circular dark blue with white icon
    const icon = await this.createFormModalIcon();
    contentWrapper.appendChild(icon);

    // Headline - centered, large, dark
    if (step.headline) {
      const headline = await TextFactory.createText({
        content: step.headline,
        fontSize: 24,
        fontName: DESIGN_TOKENS.fonts.bold,
        color: { r: 0.1, g: 0.1, b: 0.1 },
        textAlign: 'CENTER'
      });
      contentWrapper.appendChild(headline);
    }

    // Subtitle - centered, smaller, gray
    if (step.subtitle) {
      const subtitle = await TextFactory.createText({
        content: step.subtitle,
        fontSize: 16,
        fontName: DESIGN_TOKENS.fonts.primary,
        color: { r: 0.5, g: 0.5, b: 0.5 },
        textAlign: 'CENTER'
      });
      contentWrapper.appendChild(subtitle);
    }

    modal.appendChild(contentWrapper);

    // Content container for form fields
    const contentContainer = figma.createFrame();
    contentContainer.name = 'Content Container';
    contentContainer.layoutMode = 'VERTICAL';
    contentContainer.primaryAxisSizingMode = 'AUTO';
    contentContainer.counterAxisSizingMode = 'AUTO';
    contentContainer.primaryAxisAlignItems = 'MIN'; // Left-aligned content
    contentContainer.counterAxisAlignItems = 'CENTER';
    contentContainer.itemSpacing = 24;
    contentContainer.fills = [];

    // Form fields - left-aligned with labels
    if (step.inputFields && step.inputFields.length > 0) {
      const form = await FormFactory.createForm(step.inputFields);
      contentContainer.appendChild(form);
    }

    modal.appendChild(contentContainer);

    // Full-width CTA button - matches design
    if (step.cta) {
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

      const ctaText = await TextFactory.createText({
        content: step.cta,
        fontSize: 16,
        fontName: DESIGN_TOKENS.fonts.medium,
        color: { r: 1, g: 1, b: 1 }, // White text
        textAlign: 'CENTER'
      });

      ctaButton.appendChild(ctaText);
      modal.appendChild(ctaButton);
    }
  }

  private async addConfirmationContent(modal: FrameNode, step: OnboardingStep): Promise<void> {
    // Success icon
    const successIcon = await this.createSuccessIcon();
    modal.appendChild(successIcon);

    // Headline
    if (step.headline) {
      const headline = await TextFactory.createTitle(step.headline, {
        textAlign: 'CENTER',
        color: DESIGN_TOKENS.colors.success
      });
      modal.appendChild(headline);
    }

    // Subtitle
    if (step.subtitle) {
      const subtitle = await TextFactory.createBody(step.subtitle, {
        textAlign: 'CENTER'
      });
      modal.appendChild(subtitle);
    }

    // CTA Button
    if (step.cta) {
      const button = await ButtonFactory.createPrimaryButton(step.cta, {
        width: 150
      });
      modal.appendChild(button);
    }
  }

  private async addSummaryContent(modal: FrameNode, step: OnboardingStep): Promise<void> {
    // Headline
    if (step.headline) {
      const headline = await TextFactory.createTitle(step.headline, {
        textAlign: 'CENTER'
      });
      modal.appendChild(headline);
    }

    // Marketing copy as summary
    if (step.marketingCopy) {
      const summary = await TextFactory.createBody(step.marketingCopy, {
        textAlign: 'CENTER'
      });
      modal.appendChild(summary);
    }

    // CTA Button
    if (step.cta) {
      const button = await ButtonFactory.createPrimaryButton(step.cta, {
        width: 200
      });
      modal.appendChild(button);
    }
  }

  private async addDefaultContent(modal: FrameNode, step: OnboardingStep): Promise<void> {
    // Same as welcome content
    await this.addWelcomeContent(modal, step);
  }

  private async createModalIcon(): Promise<FrameNode> {
    const iconFrame = figma.createFrame();
    iconFrame.name = 'Modal Icon';
    iconFrame.resize(48, 48);
    iconFrame.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    iconFrame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.accent }];
    // iconFrame.layoutMode = 'VERTICAL';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';

    return iconFrame;
  }

  private async createFormModalIcon(): Promise<FrameNode> {
    const iconFrame = figma.createFrame();
    iconFrame.name = 'Form Modal Icon';
    iconFrame.resize(64, 64);
    iconFrame.cornerRadius = DESIGN_TOKENS.borderRadius.round; // Circular
    iconFrame.fills = [{ type: 'SOLID', color: { r: 0.33, g: 0.42, b: 0.53 } }]; // Dark blue-gray
    // iconFrame.layoutMode = 'VERTICAL';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';

    return iconFrame;
  }

  private async createSuccessIcon(): Promise<FrameNode> {
    const iconFrame = figma.createFrame();
    iconFrame.name = 'Success Icon';
    iconFrame.resize(64, 64);
    iconFrame.cornerRadius = DESIGN_TOKENS.borderRadius.round;
    iconFrame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.success }];
    iconFrame.layoutMode = 'VERTICAL';
    iconFrame.primaryAxisSizingMode = 'FIXED';
    iconFrame.counterAxisSizingMode = 'FIXED';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';

    // Checkmark placeholder
    const checkmark = figma.createEllipse();
    checkmark.resize(32, 32);
    checkmark.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    iconFrame.appendChild(checkmark);
    return iconFrame;
  }
}