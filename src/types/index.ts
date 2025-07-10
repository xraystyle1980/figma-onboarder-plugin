// Type definitions for the Figma onboarding plugin

export interface OnboardingStep {
  stepName: string;
  uxGoal?: string;
  userAction?: string;
  rationale?: string;
  layoutType: LayoutType;
  headline?: string;
  subtitle?: string;
  marketingCopy?: string;
  cta?: string;
  ctaType?: string;
  modalType?: ModalType;
  inputFields?: InputField[];
  flowEnd?: boolean;
}

export type LayoutType = 
  | 'full_screen'
  | 'modal_form' 
  | 'modal_layout'
  | 'split_screen'
  | 'tooltip_overlay';

export type ModalType = 
  | 'welcome'
  | 'form'
  | 'confirmation'
  | 'summary';

export interface InputField {
  label: string;
  type: InputFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
}

export type InputFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'date';

export interface OnboardingFlow {
  steps: OnboardingStep[];
  [key: string]: any; // Allow additional properties
}

export interface LibraryKeys {
  [key: string]: string;
}

export interface PluginMessage {
  type: string;
  json?: string;
  [key: string]: any;
}

export interface LayoutCreator {
  create(step: OnboardingStep): Promise<FrameNode>;
  name: string;
}