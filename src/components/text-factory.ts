// Text component factory

import { DESIGN_TOKENS } from '../config/design-tokens';
import { FontLoader } from '../utils/font-loader';

export interface TextOptions {
  content: string;
  fontSize?: number;
  fontName?: FontName;
  color?: RGB;
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT';
  lineHeight?: number;
  letterSpacing?: number;
  textCase?: TextCase;
  maxWidth?: number;
}

export class TextFactory {
  static async createText(options: TextOptions): Promise<TextNode> {
    const {
      content,
      fontSize = DESIGN_TOKENS.fontSizes.body,
      fontName = DESIGN_TOKENS.fonts.primary,
      color = DESIGN_TOKENS.colors.primary,
      textAlign = 'LEFT',
      lineHeight,
      letterSpacing,
      textCase,
      maxWidth
    } = options;

    // Ensure font is loaded
    await FontLoader.loadFont(fontName);

    const textNode = figma.createText();
    textNode.fontName = fontName;
    textNode.characters = content;
    textNode.fontSize = fontSize;
    textNode.fills = [{ type: 'SOLID', color }];
    textNode.textAlignHorizontal = textAlign;

    if (lineHeight) {
      textNode.lineHeight = { value: lineHeight, unit: 'PIXELS' };
    }

    if (letterSpacing) {
      textNode.letterSpacing = { value: letterSpacing, unit: 'PIXELS' };
    }

    if (textCase) {
      textNode.textCase = textCase;
    }

    if (maxWidth) {
      textNode.resize(maxWidth, textNode.height);
      textNode.textAutoResize = 'HEIGHT';
    }

    return textNode;
  }

  static async createHeadline(content: string, options: Partial<TextOptions> = {}): Promise<TextNode> {
    const defaultOptions = {
      content,
      fontSize: DESIGN_TOKENS.fontSizes.headline,
      fontName: DESIGN_TOKENS.fonts.bold,
      textAlign: 'CENTER' as const
    };
    return this.createText(Object.assign(defaultOptions, options));
  }

  static async createTitle(content: string, options: Partial<TextOptions> = {}): Promise<TextNode> {
    const defaultOptions = {
      content,
      fontSize: DESIGN_TOKENS.fontSizes.title,
      fontName: DESIGN_TOKENS.fonts.bold
    };
    return this.createText(Object.assign(defaultOptions, options));
  }

  static async createSubtitle(content: string, options: Partial<TextOptions> = {}): Promise<TextNode> {
    const defaultOptions = {
      content,
      fontSize: DESIGN_TOKENS.fontSizes.subtitle,
      fontName: DESIGN_TOKENS.fonts.primary,
      textAlign: 'CENTER' as const
    };
    return this.createText(Object.assign(defaultOptions, options));
  }

  static async createBody(content: string, options: Partial<TextOptions> = {}): Promise<TextNode> {
    const defaultOptions = {
      content,
      fontSize: DESIGN_TOKENS.fontSizes.body,
      fontName: DESIGN_TOKENS.fonts.primary
    };
    return this.createText(Object.assign(defaultOptions, options));
  }

  static async createCaption(content: string, options: Partial<TextOptions> = {}): Promise<TextNode> {
    const defaultOptions = {
      content,
      fontSize: DESIGN_TOKENS.fontSizes.caption,
      fontName: DESIGN_TOKENS.fonts.primary,
      color: DESIGN_TOKENS.colors.secondary
    };
    return this.createText(Object.assign(defaultOptions, options));
  }

  static async createAnnotationText(label: string, content: string): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = label;
    container.layoutMode = 'VERTICAL';
    container.primaryAxisSizingMode = 'AUTO';
    container.counterAxisSizingMode = 'AUTO';
    container.itemSpacing = DESIGN_TOKENS.spacing.xs;
    container.fills = [];

    const labelText = await this.createText({
      content: label,
      fontSize: DESIGN_TOKENS.fontSizes.small,
      fontName: DESIGN_TOKENS.fonts.bold,
      color: DESIGN_TOKENS.colors.secondary,
      textCase: 'UPPER'
    });

    const contentText = await this.createBody(content);

    container.appendChild(labelText);
    container.appendChild(contentText);

    return container;
  }
}