// Form component factory

import { DESIGN_TOKENS } from '../config/design-tokens';
import { TextFactory } from './text-factory';
import { InputField, InputFieldType } from '../types';

export class FormFactory {
  static async createInputField(field: InputField): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = `Input - ${field.label}`;
    container.layoutMode = 'VERTICAL';
    container.primaryAxisSizingMode = 'AUTO';
    container.counterAxisSizingMode = 'FIXED';
    container.resize(300, 0); // Fixed width, auto height
    container.itemSpacing = DESIGN_TOKENS.spacing.xs;
    container.fills = [];

    // Create label
    const label = await TextFactory.createText({
      content: field.label + (field.required ? ' *' : ''),
      fontSize: DESIGN_TOKENS.fontSizes.caption,
      fontName: DESIGN_TOKENS.fonts.medium,
      color: DESIGN_TOKENS.colors.primary
    });

    container.appendChild(label);

    // Create input based on type
    const input = await this.createInputByType(field);
    container.appendChild(input);

    // Add validation message if present
    if (field.validation) {
      const validationText = await TextFactory.createText({
        content: field.validation,
        fontSize: DESIGN_TOKENS.fontSizes.small,
        color: DESIGN_TOKENS.colors.error
      });
      container.appendChild(validationText);
    }

    return container;
  }

  private static async createInputByType(field: InputField): Promise<FrameNode> {
    switch (field.type) {
      case 'select':
      case 'multiselect':
        return this.createSelectInput(field);
      case 'checkbox':
        return this.createCheckboxInput(field);
      case 'radio':
        return this.createRadioInput(field);
      case 'textarea':
        return this.createTextareaInput(field);
      default:
        return this.createTextInput(field);
    }
  }

  private static async createTextInput(field: InputField): Promise<FrameNode> {
    const input = figma.createFrame();
    input.name = 'Text Input';
    input.layoutMode = 'HORIZONTAL';
    input.primaryAxisAlignItems = 'CENTER';
    input.counterAxisSizingMode = 'FIXED';
    input.resize(300, DESIGN_TOKENS.dimensions.input.height);
    input.paddingLeft = DESIGN_TOKENS.spacing.md;
    input.paddingRight = DESIGN_TOKENS.spacing.md;
    input.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    input.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    input.strokes = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
    input.strokeWeight = 1;

    const placeholder = await TextFactory.createText({
      content: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      fontSize: DESIGN_TOKENS.fontSizes.body,
      color: DESIGN_TOKENS.colors.secondary
    });

    input.appendChild(placeholder);
    return input;
  }

  private static async createSelectInput(field: InputField): Promise<FrameNode> {
    const select = figma.createFrame();
    select.name = 'Select Input';
    select.layoutMode = 'HORIZONTAL';
    select.primaryAxisAlignItems = 'CENTER';
    select.counterAxisSizingMode = 'FIXED';
    select.resize(300, DESIGN_TOKENS.dimensions.input.height);
    select.paddingLeft = DESIGN_TOKENS.spacing.md;
    select.paddingRight = DESIGN_TOKENS.spacing.md;
    select.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    select.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    select.strokes = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
    select.strokeWeight = 1;

    const placeholder = await TextFactory.createText({
      content: field.placeholder || `Select ${field.label.toLowerCase()}`,
      fontSize: DESIGN_TOKENS.fontSizes.body,
      color: DESIGN_TOKENS.colors.secondary
    });

    // Add dropdown arrow
    const arrow = figma.createVector();
    arrow.name = 'Dropdown Arrow';
    arrow.resize(12, 8);
    arrow.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.secondary }];

    select.appendChild(placeholder);
    select.appendChild(arrow);

    return select;
  }

  private static async createCheckboxInput(field: InputField): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = 'Checkbox';
    container.layoutMode = 'HORIZONTAL';
    container.primaryAxisAlignItems = 'CENTER';
    container.primaryAxisSizingMode = 'AUTO';
    container.counterAxisSizingMode = 'AUTO';
    container.itemSpacing = DESIGN_TOKENS.spacing.sm;
    container.fills = [];

    // Checkbox
    const checkbox = figma.createFrame();
    checkbox.resize(20, 20);
    checkbox.cornerRadius = DESIGN_TOKENS.borderRadius.sm;
    checkbox.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    checkbox.strokes = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
    checkbox.strokeWeight = 1;

    const label = await TextFactory.createText({
      content: field.label,
      fontSize: DESIGN_TOKENS.fontSizes.body,
      color: DESIGN_TOKENS.colors.primary
    });

    container.appendChild(checkbox);
    container.appendChild(label);

    return container;
  }

  private static async createRadioInput(field: InputField): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = 'Radio Group';
    container.layoutMode = 'VERTICAL';
    container.primaryAxisSizingMode = 'AUTO';
    container.counterAxisSizingMode = 'AUTO';
    container.itemSpacing = DESIGN_TOKENS.spacing.sm;
    container.fills = [];

    if (field.options) {
      for (const option of field.options) {
        const radioItem = figma.createFrame();
        radioItem.layoutMode = 'HORIZONTAL';
        radioItem.primaryAxisAlignItems = 'CENTER';
        radioItem.primaryAxisSizingMode = 'AUTO';
        radioItem.counterAxisSizingMode = 'AUTO';
        radioItem.itemSpacing = DESIGN_TOKENS.spacing.sm;
        radioItem.fills = [];

        // Radio button
        const radio = figma.createEllipse();
        radio.resize(16, 16);
        radio.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
        radio.strokes = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
        radio.strokeWeight = 1;

        const optionLabel = await TextFactory.createText({
          content: option,
          fontSize: DESIGN_TOKENS.fontSizes.body,
          color: DESIGN_TOKENS.colors.primary
        });

        radioItem.appendChild(radio);
        radioItem.appendChild(optionLabel);
        container.appendChild(radioItem);
      }
    }

    return container;
  }

  private static async createTextareaInput(field: InputField): Promise<FrameNode> {
    const textarea = figma.createFrame();
    textarea.name = 'Textarea';
    textarea.layoutMode = 'VERTICAL';
    textarea.primaryAxisAlignItems = 'MIN';
    textarea.counterAxisSizingMode = 'FIXED';
    textarea.resize(300, 120);
    textarea.paddingLeft = DESIGN_TOKENS.spacing.md;
    textarea.paddingRight = DESIGN_TOKENS.spacing.md;
    textarea.paddingTop = DESIGN_TOKENS.spacing.md;
    textarea.paddingBottom = DESIGN_TOKENS.spacing.md;
    textarea.cornerRadius = DESIGN_TOKENS.borderRadius.md;
    textarea.fills = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.white }];
    textarea.strokes = [{ type: 'SOLID', color: DESIGN_TOKENS.colors.border }];
    textarea.strokeWeight = 1;

    const placeholder = await TextFactory.createText({
      content: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      fontSize: DESIGN_TOKENS.fontSizes.body,
      color: DESIGN_TOKENS.colors.secondary
    });

    textarea.appendChild(placeholder);
    return textarea;
  }

  static async createForm(fields: InputField[], title?: string): Promise<FrameNode> {
    const form = figma.createFrame();
    form.name = title || 'Form';
    form.layoutMode = 'VERTICAL';
    form.primaryAxisSizingMode = 'AUTO';
    form.counterAxisSizingMode = 'AUTO';
    form.itemSpacing = DESIGN_TOKENS.spacing.lg;
    form.fills = [];

    if (title) {
      const formTitle = await TextFactory.createTitle(title);
      form.appendChild(formTitle);
    }

    for (const field of fields) {
      const inputField = await this.createInputField(field);
      form.appendChild(inputField);
    }

    return form;
  }
}