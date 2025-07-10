// Full screen layout creator

import { LayoutCreator, OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from '../components/text-factory';
import { ButtonFactory } from '../components/button-factory';

export class FullScreenLayoutCreator implements LayoutCreator {
  name = 'Full Screen Layout';

  async create(step: OnboardingStep): Promise<FrameNode> {
    // Main frame
    const frame = figma.createFrame();
    frame.name = step.stepName || 'Full Screen Layout';
    frame.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    frame.layoutMode = 'VERTICAL';
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    frame.itemSpacing = DESIGN_TOKENS.spacing.lg;
    frame.paddingTop = DESIGN_TOKENS.spacing.xxxxl;
    frame.paddingBottom = DESIGN_TOKENS.spacing.xxxxl;
    frame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    // Icon placeholder
    const iconFrame = await this.createIconPlaceholder();
    frame.appendChild(iconFrame);

    // Headline
    if (step.headline) {
      const headline = await TextFactory.createHeadline(step.headline);
      frame.appendChild(headline);
    }

    // Subtitle
    if (step.subtitle) {
      const subtitle = await TextFactory.createSubtitle(step.subtitle);
      frame.appendChild(subtitle);
    }

    // Marketing copy
    if (step.marketingCopy) {
      const marketingCopy = await TextFactory.createBody(step.marketingCopy, {
        textAlign: 'CENTER',
        maxWidth: 600
      });
      frame.appendChild(marketingCopy);
    }

    // CTA Button
    if (step.cta) {
      const ctaButton = await ButtonFactory.createPrimaryButton(step.cta, {
        size: 'large',
        width: 200
      });
      frame.appendChild(ctaButton);
    }

    return frame;
  }

  private async createIconPlaceholder(): Promise<FrameNode> {
    const iconFrame = figma.createFrame();
    iconFrame.name = 'Icon Placeholder';
    iconFrame.resize(DESIGN_TOKENS.dimensions.icon.width, DESIGN_TOKENS.dimensions.icon.height);
    iconFrame.cornerRadius = DESIGN_TOKENS.borderRadius.xl;
    iconFrame.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.secondary }];
    iconFrame.layoutMode = 'VERTICAL';
    iconFrame.primaryAxisAlignItems = 'CENTER';
    iconFrame.counterAxisAlignItems = 'CENTER';
    iconFrame.paddingTop = DESIGN_TOKENS.spacing.md;
    iconFrame.paddingBottom = DESIGN_TOKENS.spacing.md;
    iconFrame.paddingLeft = DESIGN_TOKENS.spacing.md;
    iconFrame.paddingRight = DESIGN_TOKENS.spacing.md;

    // Icon placeholder ellipse
    const iconEllipse = figma.createEllipse();
    iconEllipse.name = 'Icon';
    iconEllipse.resize(40, 40);
    iconEllipse.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    iconFrame.appendChild(iconEllipse);
    return iconFrame;
  }
}