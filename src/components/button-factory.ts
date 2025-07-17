// Button component factory

import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from './text-factory';

export interface ButtonOptions {
  text: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  width?: number;
  disabled?: boolean;
}

export class ButtonFactory {
  static async createButton(options: ButtonOptions): Promise<FrameNode> {
    const {
      text,
      variant = 'primary',
      size = 'medium',
      width,
      disabled = false
    } = options;

    const button = figma.createFrame();
    button.name = `Button - ${text}`;
    button.layoutMode = 'HORIZONTAL';
    button.primaryAxisAlignItems = 'CENTER';
    button.counterAxisAlignItems = 'CENTER';
    button.primaryAxisSizingMode = 'AUTO';
    button.counterAxisSizingMode = 'AUTO';

    // Set size-based properties
    const sizeConfig = this.getSizeConfig(size);
    button.paddingLeft = sizeConfig.paddingX;
    button.paddingRight = sizeConfig.paddingX;
    button.paddingTop = sizeConfig.paddingY;
    button.paddingBottom = sizeConfig.paddingY;
    button.cornerRadius = DESIGN_TOKENS.borderRadius.md;

    // Set variant-based styling
    const variantConfig = this.getVariantConfig(variant, disabled);
    button.fills = [{ type: 'SOLID', color: variantConfig.backgroundColor }];
    
    if (variantConfig.borderColor) {
      button.strokes = [{ type: 'SOLID', color: variantConfig.borderColor }];
      button.strokeWeight = 1;
    }

    // Add shadow for primary buttons
    if (variant === 'primary' && !disabled) {
      button.effects = [DESIGN_TOKENS.shadows.sm];
    }

    // Create button text
    const buttonText = await TextFactory.createText({
      content: text,
      fontSize: sizeConfig.fontSize,
      fontName: DESIGN_TOKENS.fonts.medium,
      color: variantConfig.textColor,
      textAlign: 'CENTER'
    });

    button.appendChild(buttonText);

    return button;
  }

  private static getSizeConfig(size: 'small' | 'medium' | 'large') {
    switch (size) {
      case 'small':
        return {
          height: 36,
          minWidth: 80,
          paddingX: DESIGN_TOKENS.spacing.md,
          paddingY: DESIGN_TOKENS.spacing.sm,
          fontSize: DESIGN_TOKENS.fontSizes.caption
        };
      case 'large':
        return {
          height: 56,
          minWidth: 120,
          paddingX: DESIGN_TOKENS.spacing.lg,
          paddingY: DESIGN_TOKENS.spacing.md,
          fontSize: DESIGN_TOKENS.fontSizes.body
        };
      default: // medium
        return {
          height: DESIGN_TOKENS.dimensions.button.height,
          minWidth: 100,
          paddingX: DESIGN_TOKENS.spacing.lg,
          paddingY: DESIGN_TOKENS.spacing.md,
          fontSize: DESIGN_TOKENS.fontSizes.body
        };
    }
  }

  private static getVariantConfig(variant: 'primary' | 'secondary' | 'ghost', disabled: boolean) {
    if (disabled) {
      return {
        backgroundColor: DESIGN_TOKENS.colors.border,
        textColor: DESIGN_TOKENS.colors.secondary,
        borderColor: undefined
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: DESIGN_TOKENS.colors.accent,
          textColor: DESIGN_TOKENS.colors.white,
          borderColor: undefined
        };
      case 'secondary':
        return {
          backgroundColor: DESIGN_TOKENS.colors.white,
          textColor: DESIGN_TOKENS.colors.accent,
          borderColor: DESIGN_TOKENS.colors.accent
        };
      case 'ghost':
        return {
          backgroundColor: { r: 0, g: 0, b: 0, a: 0 }, // Transparent
          textColor: DESIGN_TOKENS.colors.accent,
          borderColor: undefined
        };
      default:
        return {
          backgroundColor: DESIGN_TOKENS.colors.accent,
          textColor: DESIGN_TOKENS.colors.white,
          borderColor: undefined
        };
    }
  }

  static async createPrimaryButton(text: string, options: Partial<ButtonOptions> = {}): Promise<FrameNode> {
    const buttonOptions = Object.assign({ text, variant: 'primary' as const }, options);
    return this.createButton(buttonOptions);
  }

  static async createSecondaryButton(text: string, options: Partial<ButtonOptions> = {}): Promise<FrameNode> {
    const buttonOptions = Object.assign({ text, variant: 'secondary' as const }, options);
    return this.createButton(buttonOptions);
  }

  static async createGhostButton(text: string, options: Partial<ButtonOptions> = {}): Promise<FrameNode> {
    const buttonOptions = Object.assign({ text, variant: 'ghost' as const }, options);
    return this.createButton(buttonOptions);
  }
}