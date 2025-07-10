// Font loading utilities

import { DESIGN_TOKENS } from '../config/design-tokens';

const loadedFonts = new Set<string>();

export class FontLoader {
  static async loadFont(fontName: FontName): Promise<void> {
    const fontKey = `${fontName.family}-${fontName.style}`;
    
    if (!loadedFonts.has(fontKey)) {
      await figma.loadFontAsync(fontName);
      loadedFonts.add(fontKey);
    }
  }

  static async loadAllFonts(): Promise<void> {
    const fonts = Object.values(DESIGN_TOKENS.fonts);
    const loadPromises = fonts.map(font => this.loadFont(font));
    await Promise.all(loadPromises);
  }

  static async ensureFontLoaded(fontName: FontName): Promise<FontName> {
    await this.loadFont(fontName);
    return fontName;
  }

  // Load fonts from a node recursively
  static async loadFontsFromNode(node: SceneNode): Promise<void> {
    if ('children' in node) {
      for (const child of node.children) {
        await this.loadFontsFromNode(child);
      }
    }
    
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      if (typeof textNode.fontName === 'object' && 'family' in textNode.fontName) {
        await this.loadFont(textNode.fontName as FontName);
      }
    }
  }

  static getDefaultFont(): FontName {
    return DESIGN_TOKENS.fonts.primary;
  }

  static getBoldFont(): FontName {
    return DESIGN_TOKENS.fonts.bold;
  }

  static getMediumFont(): FontName {
    return DESIGN_TOKENS.fonts.medium;
  }
}