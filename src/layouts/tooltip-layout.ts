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
    background.layoutMode = 'VERTICAL';
    background.primaryAxisAlignItems = 'CENTER';
    background.counterAxisAlignItems = 'CENTER';

    // App mockup (simplified)
    const appMockup = await this.createAppMockup();
    background.appendChild(appMockup);

    // Tooltip overlay
    const tooltip = await this.createTooltip(step);
    
    // Position tooltip relative to mockup
    tooltip.x = 200; // Offset from left
    tooltip.y = 150; // Offset from top

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

    // Highlight area (where tooltip points to)
    const highlight = figma.createFrame();
    highlight.name = 'Highlighted Feature';
    highlight.resize(120, 40);
    highlight.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    highlight.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.accent }];
    highlight.x = 50;
    highlight.y = 20;
    content.appendChild(highlight);

    return mockup;
  }

  private async createTooltip(step: OnboardingStep): Promise<FrameNode> {
    const tooltip = figma.createFrame();
    tooltip.name = 'Tooltip';
    tooltip.resize(DESIGN_TOKENS.dimensions.tooltip.width, 0); // Auto height
    tooltip.layoutMode = 'VERTICAL';
    tooltip.primaryAxisSizingMode = 'AUTO';
    tooltip.counterAxisSizingMode = 'FIXED';
    tooltip.itemSpacing = DESIGN_TOKENS.spacing.md;
    tooltip.paddingTop = DESIGN_TOKENS.spacing.lg;
    tooltip.paddingBottom = DESIGN_TOKENS.spacing.lg;
    tooltip.paddingLeft = DESIGN_TOKENS.spacing.lg;
    tooltip.paddingRight = DESIGN_TOKENS.spacing.lg;
    tooltip.cornerRadius = DESIGN_TOKENS.borderRadius.lg;
    tooltip.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    tooltip.effects = [DESIGN_TOKENS.shadows.lg];

    // Close button
    const closeButton = await this.createCloseButton();
    closeButton.layoutAlign = 'STRETCH';
    closeButton.x = DESIGN_TOKENS.dimensions.tooltip.width - 32;
    closeButton.y = 8;
    tooltip.appendChild(closeButton);

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

    // Tooltip pointer/arrow
    const arrow = await this.createTooltipArrow();
    arrow.x = 40; // Position relative to tooltip
    arrow.y = -8; // Above tooltip
    tooltip.appendChild(arrow);

    return tooltip;
  }

  private async createCloseButton(): Promise<FrameNode> {
    const closeButton = figma.createFrame();
    closeButton.name = 'Close Button';
    closeButton.resize(24, 24);
    closeButton.cornerRadius = DESIGN_TOKENS.borderRadius.round;
    closeButton.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
    closeButton.layoutMode = 'VERTICAL';
    closeButton.primaryAxisAlignItems = 'CENTER';
    closeButton.counterAxisAlignItems = 'CENTER';

    // X icon placeholder
    const xIcon = figma.createEllipse();
    xIcon.resize(8, 8);
    xIcon.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.secondary }];

    closeButton.appendChild(xIcon);
    return closeButton;
  }

  private async createTooltipFooter(step: OnboardingStep): Promise<FrameNode> {
    const footer = figma.createFrame();
    footer.name = 'Tooltip Footer';
    footer.layoutMode = 'HORIZONTAL';
    footer.primaryAxisSizingMode = 'FIXED';
    footer.counterAxisSizingMode = 'AUTO';
    footer.resize(DESIGN_TOKENS.dimensions.tooltip.width - (DESIGN_TOKENS.spacing.lg * 2), 0);
    footer.primaryAxisAlignItems = 'CENTER';
    footer.counterAxisAlignItems = 'SPACE_BETWEEN';
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

  private async createTooltipArrow(): Promise<FrameNode> {
    const arrow = figma.createFrame();
    arrow.name = 'Tooltip Arrow';
    arrow.resize(16, 8);
    arrow.fills = [];

    // Create triangle using vector
    const triangle = figma.createVector();
    triangle.resize(16, 8);
    triangle.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];

    arrow.appendChild(triangle);
    return arrow;
  }
}