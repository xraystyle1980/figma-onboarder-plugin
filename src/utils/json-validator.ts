// JSON validation utilities

import { OnboardingFlow, OnboardingStep, LayoutType, ModalType } from '../types';

export class JsonValidator {
  static validateOnboardingFlow(data: any): { isValid: boolean; errors: string[]; flow?: OnboardingFlow } {
    const errors: string[] = [];

    // Handle different JSON structures
    let steps: any[];
    
    try {
      if (Array.isArray(data) && data.length > 0 && data[0].steps) {
        steps = data[0].steps;
      } else if (data.steps) {
        steps = data.steps;
      } else if (Array.isArray(data)) {
        steps = data;
      } else {
        errors.push('JSON must contain a "steps" array or be an array of step objects');
        return { isValid: false, errors };
      }

      if (!Array.isArray(steps)) {
        errors.push('Steps must be an array');
        return { isValid: false, errors };
      }

      if (steps.length === 0) {
        errors.push('Steps array cannot be empty');
        return { isValid: false, errors };
      }

      // Validate each step
      const validatedSteps: OnboardingStep[] = [];
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepErrors = this.validateStep(step, i);
        
        if (stepErrors.length > 0) {
          errors.push(...stepErrors);
        } else {
          validatedSteps.push(this.normalizeStep(step));
        }
      }

      const isValid = errors.length === 0;
      const flow: OnboardingFlow = { steps: validatedSteps };

      return { isValid, errors, flow: isValid ? flow : undefined };

    } catch (error) {
      errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }

  private static validateStep(step: any, index: number): string[] {
    const errors: string[] = [];
    const stepPrefix = `Step ${index + 1}`;

    // Required fields
    if (!step.stepName || typeof step.stepName !== 'string') {
      errors.push(`${stepPrefix}: stepName is required and must be a string`);
    }

    if (!step.layoutType || typeof step.layoutType !== 'string') {
      errors.push(`${stepPrefix}: layoutType is required and must be a string`);
    } else if (!this.isValidLayoutType(step.layoutType)) {
      errors.push(`${stepPrefix}: layoutType "${step.layoutType}" is not valid. Must be one of: full_screen, modal_form, modal_layout, split_screen, tooltip_overlay`);
    }

    // Validate modal-specific fields
    if (step.layoutType === 'modal_form' || step.layoutType === 'modal_layout') {
      if (step.modalType && !this.isValidModalType(step.modalType)) {
        errors.push(`${stepPrefix}: modalType "${step.modalType}" is not valid. Must be one of: welcome, form, confirmation, summary`);
      }
    }

    // Validate input fields if present
    if (step.inputFields && Array.isArray(step.inputFields)) {
      step.inputFields.forEach((field: any, fieldIndex: number) => {
        const fieldErrors = this.validateInputField(field, `${stepPrefix} Input Field ${fieldIndex + 1}`);
        errors.push(...fieldErrors);
      });
    }

    return errors;
  }

  private static validateInputField(field: any, prefix: string): string[] {
    const errors: string[] = [];

    if (!field.label || typeof field.label !== 'string') {
      errors.push(`${prefix}: label is required and must be a string`);
    }

    if (!field.type || typeof field.type !== 'string') {
      errors.push(`${prefix}: type is required and must be a string`);
    } else if (!this.isValidInputFieldType(field.type)) {
      errors.push(`${prefix}: type "${field.type}" is not valid`);
    }

    return errors;
  }

  private static isValidLayoutType(layoutType: string): layoutType is LayoutType {
    return ['full_screen', 'modal_form', 'modal_layout', 'split_screen', 'tooltip_overlay'].includes(layoutType);
  }

  private static isValidModalType(modalType: string): modalType is ModalType {
    return ['welcome', 'form', 'confirmation', 'summary'].includes(modalType);
  }

  private static isValidInputFieldType(type: string): boolean {
    return ['text', 'email', 'number', 'select', 'multiselect', 'checkbox', 'radio', 'textarea', 'date'].includes(type);
  }

  private static normalizeStep(step: any): OnboardingStep {
    return {
      stepName: step.stepName,
      uxGoal: step.uxGoal,
      userAction: step.userAction,
      rationale: step.rationale,
      layoutType: step.layoutType,
      headline: step.headline,
      subtitle: step.subtitle,
      marketingCopy: step.marketingCopy,
      cta: step.cta,
      ctaType: step.ctaType,
      modalType: step.modalType,
      inputFields: step.inputFields,
      flowEnd: step.flowEnd
    };
  }
}