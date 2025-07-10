// Modal layout creator

import { LayoutCreator, OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from '../components/text-factory';
import { ButtonFactory } from '../components/button-factory';
import { FormFactory } from '../components/form-factory';

export class ModalLayoutCreator implements LayoutCreator {
  name = 'Modal Layout';

  async create(step: OnboardingStep): Promise<FrameNode> {
    // Desktop background
    const background = figma.createFrame();
    background.name = `${step.stepName} - Modal Background`;
    background.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    background.fills = [{ 
      type: 'SOLID', 
      color: { r: 0, g: 0, b: 0, a: 0.5 } // Semi-transparent overlay
    }];
    background.layoutMode = 'VERTICAL';
    background.primaryAxisAlignItems = 'CENTER';
    background.counterAxisAlignItems = 'CENTER';

    // Modal container
    const modal = figma.createFrame();
    modal.name = 'Modal';
    modal.resize(
      step.modalType === 'form' ? 500 : DESIGN_TOKENS.dimensions.modal.width,
      0 // Auto height
    );
    modal.layoutMode = 'VERTICAL';
    modal.primaryAxisSizingMode = 'AUTO';
    modal.counterAxisSizingMode = 'FIXED';
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

    background.appendChild(modal);
    return background;
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

    // Form fields
    if (step.inputFields && step.inputFields.length > 0) {
      const form = await FormFactory.createForm(step.inputFields);
      modal.appendChild(form);
    }

    // Buttons container
    const buttonContainer = figma.createFrame();
    buttonContainer.name = 'Button Container';
    buttonContainer.layoutMode = 'HORIZONTAL';
    buttonContainer.primaryAxisSizingMode = 'AUTO';
    buttonContainer.counterAxisSizingMode = 'AUTO';
    buttonContainer.itemSpacing = DESIGN_TOKENS.spacing.md;
    buttonContainer.fills = [];

    // Secondary button (Cancel/Back)
    const secondaryButton = await ButtonFactory.createSecondaryButton('Cancel');
    buttonContainer.appendChild(secondaryButton);

    // Primary button (Submit/Continue)
    if (step.cta) {
      const primaryButton = await ButtonFactory.createPrimaryButton(step.cta);
      buttonContainer.appendChild(primaryButton);
    }

    modal.appendChild(buttonContainer);
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
    iconFrame.layoutMode = 'VERTICAL';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';

    const iconEllipse = figma.createEllipse();
    iconEllipse.resize(24, 24);
    iconEllipse.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    iconFrame.appendChild(iconEllipse);
    return iconFrame;
  }

  private async createSuccessIcon(): Promise<FrameNode> {
    const iconFrame = figma.createFrame();
    iconFrame.name = 'Success Icon';
    iconFrame.resize(64, 64);
    iconFrame.cornerRadius = DESIGN_TOKENS.borderRadius.round;
    iconFrame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.success }];
    iconFrame.layoutMode = 'VERTICAL';
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