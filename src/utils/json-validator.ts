// JSON validation utilities

import { OnboardingFlow, OnboardingStep, LayoutType, ModalType } from '../types';

export class JsonValidator {
  // Temporary flag to make validation less strict during development
  private static DEVELOPMENT_MODE = true;

  static validateOnboardingFlow(data: any): { isValid: boolean; errors: string[]; flow?: OnboardingFlow } {
    const errors: string[] = [];

    console.log('DEBUG: validateOnboardingFlow received data with keys:', Object.keys(data));

    // Handle different JSON structures
    let steps: any[];
    let flowMetadata: any = {};
    
    try {
      if (Array.isArray(data) && data.length > 0 && data[0].steps) {
        steps = data[0].steps;
        flowMetadata = { ...data[0] };
        delete flowMetadata.steps;
        console.log('DEBUG: Using steps from data[0].steps, length:', steps.length);
      } else if (data.steps) {
        steps = data.steps;
        flowMetadata = { ...data };
        delete flowMetadata.steps;
        console.log('DEBUG: Using steps from data.steps, length:', steps.length);
      } else if (Array.isArray(data)) {
        steps = data;
        console.log('DEBUG: Using data as steps array, length:', steps.length);
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
      
      console.log('DEBUG: About to validate', steps.length, 'steps');
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`DEBUG: Validating step ${i + 1}: ${step.stepName} (${step.layoutType})`);
        const stepErrors = this.validateStep(step, i);
        
        if (stepErrors.length > 0) {
          console.log(`DEBUG: Step ${i + 1} has errors:`, stepErrors);
          errors.push(...stepErrors);
        }
        
        // Always normalize valid steps, even if there are errors in other steps
        if (step.stepName && step.layoutType) {
          console.log(`DEBUG: Step ${i + 1} is normalizable, adding to valid steps`);
          validatedSteps.push(this.normalizeStep(step));
        }
      }
      
      console.log('DEBUG: Validation complete. Valid steps:', validatedSteps.length, 'Total errors:', errors.length);

      // Enhanced validation result
      const isValid = errors.length === 0;
      const hasValidSteps = validatedSteps.length > 0;
      
      if (this.DEVELOPMENT_MODE && !isValid && hasValidSteps) {
        console.warn('Validation errors in development mode (proceeding anyway):', errors);
        const flow: OnboardingFlow = { 
          steps: validatedSteps,
          ...flowMetadata
        };
        return { isValid: true, errors, flow }; // Override isValid to true
      }
      
      const flow: OnboardingFlow = { 
        steps: validatedSteps,
        ...flowMetadata
      };
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

    // Validate content requirements for each layout type
    const contentErrors = this.validateContentRequirements(step, stepPrefix);
    errors.push(...contentErrors);

    // Validate input fields if present
    if (step.inputFields && Array.isArray(step.inputFields)) {
      step.inputFields.forEach((field: any, fieldIndex: number) => {
        // Skip validation for empty or null fields
        if (!field || (typeof field === 'object' && Object.keys(field).length === 0)) {
          console.warn(`${stepPrefix} Input Field ${fieldIndex + 1}: Empty field, skipping validation`);
          return;
        }
        
        const fieldErrors = this.validateInputField(field, `${stepPrefix} Input Field ${fieldIndex + 1}`);
        errors.push(...fieldErrors);
      });
    }

    return errors;
  }

  private static validateInputField(field: any, prefix: string): string[] {
    const errors: string[] = [];

    // Handle string-based input fields (convert to object format)
    if (typeof field === 'string') {
      console.log(`${prefix}: Converting string field "${field}" to object format`);
      return []; // String fields are valid, will be normalized later
    }

    // Check for label field (might be missing or empty)
    if (!field.label || typeof field.label !== 'string') {
      console.warn(`${prefix}: Invalid field structure:`, field);
      errors.push(`${prefix}: label is required and must be a string`);
    }

    // Check for type field (might be missing or empty)
    if (!field.type || typeof field.type !== 'string') {
      console.warn(`${prefix}: Invalid field structure:`, field);
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

  private static validateContentRequirements(step: any, stepPrefix: string): string[] {
    const errors: string[] = [];
    
    // Layout-specific content requirements
    switch (step.layoutType) {
      case 'full_screen':
        if (!step.headline && !step.subtitle) {
          errors.push(`${stepPrefix}: Full screen layout requires at least a headline or subtitle`);
        }
        break;
      case 'modal_form':
      case 'modal_layout':
        if (!step.headline && !step.subtitle) {
          errors.push(`${stepPrefix}: Modal layout requires at least a headline or subtitle`);
        }
        break;
      case 'split_screen':
        if (!step.headline && !step.subtitle && !step.marketingCopy) {
          errors.push(`${stepPrefix}: Split screen layout requires at least headline, subtitle, or marketing copy`);
        }
        break;
      case 'tooltip_overlay':
        if (!step.headline && !step.subtitle) {
          errors.push(`${stepPrefix}: Tooltip layout requires at least a headline or subtitle`);
        }
        break;
    }

    return errors;
  }

  private static normalizeStep(step: any): OnboardingStep {
    // Clean up input fields - handle both string and object formats
    let cleanInputFields = step.inputFields;
    if (Array.isArray(step.inputFields)) {
      cleanInputFields = step.inputFields.map((field: any) => {
        // Convert string fields to object format
        if (typeof field === 'string') {
          return {
            label: field,
            type: 'text', // Default type
            required: false
          };
        }
        // Keep existing object fields if they're valid
        if (field && typeof field === 'object' && field.label && field.type) {
          return field;
        }
        return null; // Invalid field
      }).filter(field => field !== null); // Remove null entries
      
      // If no valid input fields remain, set to undefined
      if (cleanInputFields.length === 0) {
        cleanInputFields = undefined;
      }
    }

    return {
      stepName: step.stepName || `Step ${Date.now()}`,
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
      inputFields: cleanInputFields,
      flowEnd: step.flowEnd || false
    };
  }
}