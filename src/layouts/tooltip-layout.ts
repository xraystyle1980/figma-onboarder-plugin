// Tooltip layout creator

import { LayoutCreator, OnboardingStep } from '../types';
import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from '../components/text-factory';
import { ButtonFactory } from '../components/button-factory';

export class TooltipLayoutCreator implements LayoutCreator {
  name = 'Tooltip Layout';

  async create(step: OnboardingStep): Promise<FrameNode> {
    // Background frame (desktop context)
    const background = figma.createFrame();
    background.name = `${step.stepName} - Tooltip Context`;
    background.resize(DESIGN_TOKENS.dimensions.desktop.width, DESIGN_TOKENS.dimensions.desktop.height);
    background.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.background }];
    background.layoutMode = 'NONE'; // No auto-layout for absolute positioning
    background.primaryAxisSizingMode = 'FIXED';
    background.counterAxisSizingMode = 'FIXED';

    // App mockup (simplified) - centered
    const appMockup = await this.createAppMockup();
    appMockup.x = (DESIGN_TOKENS.dimensions.desktop.width - 800) / 2; // Center horizontally
    appMockup.y = (DESIGN_TOKENS.dimensions.desktop.height - 600) / 2; // Center vertically
    background.appendChild(appMockup);

    // Tooltip overlay - positioned on top
    const tooltip = await this.createTooltip(step);
    
    // Position tooltip relative to mockup
    tooltip.x = appMockup.x + 200; // Offset from mockup left
    tooltip.y = appMockup.y + 150; // Offset from mockup top

    background.appendChild(tooltip);

    return background;
  }

  private async createAppMockup(): Promise<FrameNode> {
    const mockup = figma.createFrame();
    mockup.name = 'App Mockup';
    mockup.resize(800, 600);
    mockup.cornerRadius = DESIGN_TOKENS.borderRadius.lg;
    mockup.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    mockup.effects = [DESIGN_TOKENS.shadows.md];
    mockup.layoutMode = 'VERTICAL';
    mockup.primaryAxisSizingMode = 'AUTO';
    mockup.counterAxisSizingMode = 'FIXED';
    mockup.itemSpacing = DESIGN_TOKENS.spacing.md;
    mockup.paddingTop = DESIGN_TOKENS.spacing.lg;
    mockup.paddingBottom = DESIGN_TOKENS.spacing.lg;
    mockup.paddingLeft = DESIGN_TOKENS.spacing.lg;
    mockup.paddingRight = DESIGN_TOKENS.spacing.lg;

    // Header
    const header = figma.createFrame();
    header.name = 'Header';
    header.resize(750, 60);
    header.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    header.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.background }];
    mockup.appendChild(header);

    // Content area
    const content = figma.createFrame();
    content.name = 'Content Area';
    content.resize(750, 400);
    content.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    content.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.background }];
    mockup.appendChild(content);


    return mockup;
  }

  private async createTooltip(step: OnboardingStep): Promise<FrameNode> {
    const tooltip = figma.createFrame();
    tooltip.name = 'Tooltip';
    tooltip.resize(DESIGN_TOKENS.dimensions.tooltip.width, 0); // Auto height
    tooltip.layoutMode = 'VERTICAL';
    tooltip.layoutAlign = 'STRETCH'; // Fill available width
    tooltip.primaryAxisAlignItems = 'MIN'; // Align to top
    tooltip.counterAxisAlignItems = 'CENTER'; // Center content horizontally
    tooltip.primaryAxisSizingMode = 'AUTO';
    tooltip.counterAxisSizingMode = 'AUTO';
    // Uncomment these lines if you want fixed dimensions
    // tooltip.primaryAxisSizingMode = 'FIXED';
    // tooltip.counterAxisSizingMode = 'FIXED';
    // tooltip.resize(800, 400); // Fixed width of 800px
    tooltip.itemSpacing = DESIGN_TOKENS.spacing.md;
    tooltip.paddingTop = DESIGN_TOKENS.spacing.lg;
    tooltip.paddingBottom = DESIGN_TOKENS.spacing.lg;
    tooltip.paddingLeft = DESIGN_TOKENS.spacing.lg;
    tooltip.paddingRight = DESIGN_TOKENS.spacing.lg;
    tooltip.cornerRadius = DESIGN_TOKENS.borderRadius.lg;
    tooltip.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    tooltip.effects = [DESIGN_TOKENS.shadows.lg];


    // Content
    if (step.headline) {
      const headline = await TextFactory.createText({
        content: step.headline,
        fontSize: DESIGN_TOKENS.fontSizes.body,
        fontName: DESIGN_TOKENS.fonts.bold,
        textAlign: 'LEFT'
      });
      tooltip.appendChild(headline);
    }

    if (step.subtitle) {
      const subtitle = await TextFactory.createCaption(step.subtitle, {
        textAlign: 'LEFT'
      });
      tooltip.appendChild(subtitle);
    }

    // Progress and navigation
    const footer = await this.createTooltipFooter(step);
    tooltip.appendChild(footer);

    return tooltip;
  }


  private async createTooltipFooter(step: OnboardingStep): Promise<FrameNode> {
    const footer = figma.createFrame();
    footer.name = 'Tooltip Footer';
    footer.layoutMode = 'HORIZONTAL';
    footer.primaryAxisSizingMode = 'FIXED';
    footer.counterAxisSizingMode = 'AUTO';
    footer.resize(400, 50); // Fixed width of 400px
    footer.primaryAxisAlignItems = 'CENTER';
    footer.counterAxisAlignItems = 'CENTER';
    footer.paddingTop = DESIGN_TOKENS.spacing.lg; // Add top padding
    footer.paddingBottom = DESIGN_TOKENS.spacing.md; // Add bottom padding
    footer.itemSpacing = 40; // 40px gap between progress and button
    footer.fills = [];

    // Progress indicator
    const progressText = await TextFactory.createCaption('1 of 4', {
      color: DESIGN_TOKENS.colors.secondary
    });
    footer.appendChild(progressText);

    // Next button
    if (step.cta) {
      const nextButton = await ButtonFactory.createPrimaryButton(step.cta, {
        size: 'small'
      });
      footer.appendChild(nextButton);
    }

    return footer;
  }

}