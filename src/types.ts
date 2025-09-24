/**
 * Core types for svelte-hook-form
 */

/**
 * Type representing form field errors
 */
export type FieldErrors = Record<string, string>;

/**
 * Type representing form values
 */
export type FormValues = Record<string, any>;

/**
 * Resolver function type for form validation
 * @template T - The type of the form values
 */
export type Resolver<T extends FormValues> = (values: T) => {
  values?: T;
  errors?: FieldErrors;
};

/**
 * Form state interface
 */
export interface FormState<T extends FormValues> {
  touchedFields: {
    subscribe: (
      run: (value: Partial<Record<keyof T, boolean>>) => void
    ) => () => void;
  };
  dirtyFields: {
    subscribe: (
      run: (value: Partial<Record<keyof T, boolean>>) => void
    ) => () => void;
  };
  isDirty: boolean;
  isValid: boolean;
  values: { subscribe: (run: (value: T) => void) => () => void };
}

/**
 * UseForm return type
 */
export interface UseFormReturn<T extends FormValues = FormValues> {
  register: <K extends string>(
    name: K
  ) => {
    name: K;
    value: any;
    onInput: (e: Event) => void;
    onBlur: () => void;
  };
  control: <K extends keyof T & string>(
    name: K
  ) => {
    value: T[K];
    onChange: (val: T[K]) => void;
  };
  handleSubmit: (
    callback: (values: T) => void | Promise<void>
  ) => (e: Event) => Promise<void>;
  setValue: <K extends string>(name: K, val: any) => void;
  setError: <K extends string>(name: K, message: string) => void;
  clearErrors: (name?: string) => void;
  trigger: (name?: keyof T & string) => boolean;
  reset: (newValues?: Partial<T>) => void;
  formState: FormState<T>;
  values: { subscribe: (run: (value: T) => void) => () => void };
  errors: { subscribe: (run: (value: FieldErrors) => void) => () => void };
  isSubmitting: { subscribe: (run: (value: boolean) => void) => () => void };
  defaultValues: { subscribe: (run: (value: T) => void) => () => void };
}

/**
 * UseForm options
 */
export interface UseFormOptions<T extends FormValues> {
  defaultValues?: T;
  resolver?: Resolver<T>;
}
