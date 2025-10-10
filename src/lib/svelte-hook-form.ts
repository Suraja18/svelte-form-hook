/**
 * @module svelte-hook-form
 *
 * A lightweight form management library for Svelte that provides form state management,
 * validation, and form handling with a React Hook Form-like API.
 *
 * @example
 * // Basic usage
 * <script>
 *   import { useForm } from './svelte-hook-form';
 *
 *   const form = useForm({
 *     defaultValues: { name: '', email: '' },
 *     // Optional validation resolver (e.g., with Zod, Yup, etc.)
 *     // resolver: zodResolver(schema)
 *   });
 * </script>
 *
 * <form on:submit={form.handleSubmit(handleFormSubmit)}>
 *   <input type="text" {...form.register('name')} />
 *   <input type="email" {...form.register('email')} />
 *   <button type="submit">Submit</button>
 * </form>
 */

import { getContext, setContext } from "svelte";
import { get, readable, writable, type Writable } from "svelte/store";
import type { FieldErrors, FormValues, Resolver } from "../types";

/**
 * Helper function to get nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

/**
 * Helper function to set nested value in an object using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): any {
  const parts = path.split(".");
  const [last, ...rest] = parts.reverse();
  let current = obj;

  for (const part of rest.reverse()) {
    if (current[part] === undefined) {
      current[part] = {};
    }
    current = current[part];
  }

  current[last] = value;
  return obj;
}

/**
 * Symbol used as the key for the form context
 * @private
 */
export const FORM_CONTEXT_KEY = Symbol("svelte-hook-form");

/**
 * Creates and manages a form instance with the provided options.
 * This is the main hook for form management in your Svelte components.
 *
 * @template T - The type of the form values (should extend FormValues)
 * @param {Object} [opts] - Configuration options for the form
 * @param {T} [opts.defaultValues] - Initial values for the form fields
 * @param {Resolver<T>} [opts.resolver] - Validation resolver function
 * @returns {Object} Form instance with methods and state
 * @property {Function} register - Register a form field
 * @property {Function} control - Alternative to register for controlled components
 * @property {Function} handleSubmit - Form submission handler
 * @property {Function} setValue - Programmatically set a field value
 * @property {Function} setError - Manually set a field error
 * @property {Function} clearErrors - Clear field errors
 * @property {Function} trigger - Trigger validation for one or all fields
 * @property {Function} reset - Reset the form to initial values
 * @property {Object} formState - Current form state
 * @property {Object} values - Reactive form values store
 * @property {Object} errors - Reactive form errors store
 * @property {Object} isSubmitting - Reactive submitting state store
 * @property {Object} defaultValues - Initial form values store
 *
 * @example
 * // Basic usage
 * const form = useForm({
 *   defaultValues: { name: "John", age: 30 },
 *   // Optional validation resolver (e.g., with Zod, Yup, etc.)
 *   // resolver: zodResolver(schema),
 * });
 *
 * // Usage with SvelteKit form actions
 * const form = useForm({
 *   defaultValues: { email: '', password: '' },
 *   resolver: async (values) => {
 *     const result = await validateForm(values);
 *     if (result.success) return { values: result.data };
 *     return { errors: result.error.flatten() };
 *   }
 * });
 */
export function useForm<T extends FormValues = {}>(opts?: {
  defaultValues?: T;
  resolver?: Resolver<T>;
}) {
  const defaultValues = opts?.defaultValues ?? ({} as T);
  const resolver = opts?.resolver;

  // Stores
  const values: Writable<T> = writable({ ...defaultValues });
  const errors: Writable<FieldErrors> = writable({});
  const touched: Writable<Record<keyof T, boolean>> = writable({} as any);
  const dirty: Writable<Record<keyof T, boolean>> = writable({} as any);
  const isSubmitting = writable(false);

  function register<K extends string>(name: K) {
    const fieldValue = getNestedValue(get(values), name);
    return {
      name,
      value: fieldValue,
      oninput: (e: Event) => {
        const target = e.target as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement;
        values.update((v) => {
          const newValue =
            target.type === "checkbox" && target instanceof HTMLInputElement
              ? target.checked
              : target.value;

          return setNestedValue({ ...v }, name, newValue);
        });

        dirty.update((d) => ({ ...d, [name]: true }));
      },
      onblur: () => {
        touched.update((t) => ({ ...t, [name]: true }));
        trigger(name);
      },
    };
  }

  function control<K extends keyof T & string>(name: K) {
    return {
      value: get(values)[name],
      oninput: (val: T[K]) => {
        values.update((v) => {
          v[name] = val;
          dirty.update((d) => ({ ...d, [name]: true }));
          touched.update((t) => ({ ...t, [name]: true }));
          return v;
        });
        trigger(name);
      },
    };
  }

  function trigger(name?: keyof T & string): boolean {
    if (!resolver) {
      errors.set({});
      return true;
    }

    const currentValues = get(values);

    if (name) {
      const singleValue = { [name]: currentValues[name] } as unknown as T;
      const result = resolver(singleValue);
      errors.update((e) => {
        const newErrors = { ...e };
        if (result?.errors?.[name]) {
          newErrors[name] = result.errors[name];
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
      return !result?.errors?.[name];
    } else {
      const result = resolver(currentValues);
      errors.set(result?.errors || {});
      return !result?.errors;
    }
  }

  function handleSubmit(callback: (values: T) => void | Promise<void>) {
    return async (e: Event) => {
      e.preventDefault();
      isSubmitting.set(true);

      if (trigger()) {
        await callback(get(values));
      }

      isSubmitting.set(false);
    };
  }

  function setValue<K extends string>(name: K, val: any) {
    values.update((v) => {
      const newValues = setNestedValue({ ...v }, name, val);
      dirty.update((d) => ({ ...d, [name]: true }));
      touched.update((t) => ({ ...t, [name]: true }));
      return newValues;
    });
    trigger(name);
  }

  function setError<K extends string>(name: K, message: string) {
    errors.update((e) => ({ ...e, [name]: message }));
  }

  function clearErrors(name?: string) {
    errors.update((e) => {
      if (!name) return {};
      const { [name]: _, ...rest } = e;
      return rest;
    });
  }

  function reset(newValues?: Partial<T>) {
    values.set({ ...defaultValues, ...(newValues ?? {}) } as T);
    errors.set({});
    touched.set({} as any);
    dirty.set({} as any);
  }

  const formState = {
    touchedFields: { subscribe: touched.subscribe },
    dirtyFields: { subscribe: dirty.subscribe },
    get isDirty() {
      return Object.keys(get(dirty)).length > 0;
    },
    get isValid() {
      return Object.keys(get(errors)).length === 0;
    },
    values: { subscribe: values.subscribe },
  };

  const formApi = {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    trigger,
    reset,
    formState,
    values: { subscribe: values.subscribe },
    errors: { subscribe: errors.subscribe },
    isSubmitting: { subscribe: isSubmitting.subscribe },
    defaultValues: readable(defaultValues),
  };

  // Provide context to child components
  setContext(FORM_CONTEXT_KEY, formApi);

  return formApi;
}

/**
 * Retrieves the form instance from the Svelte context.
 * This hook should be used in child components that need access to the form instance.
 *
 * @template T - The type of the form values (should match the parent form's type)
 * @returns {ReturnType<typeof useForm<T>>} The form instance from context
 * @throws {Error} If used outside of a component that uses useForm
 *
 * @example
 * // ParentComponent.svelte
 * <script>
 *   import { useForm } from './svelte-hook-form';
 *   import ChildComponent from './ChildComponent.svelte';
 *
 *   const form = useForm({ defaultValues: { name: '' } });
 * </script>
 *
 * <ChildComponent />
 *
 * // ChildComponent.svelte
 * <script>
 *   import { useFormContext } from './svelte-hook-form';
 *
 *   const form = useFormContext(); // Gets the form instance from parent
 * </script>
 */
export function useFormContext<T extends FormValues = {}>() {
  const context = getContext<ReturnType<typeof useForm<T>>>(FORM_CONTEXT_KEY);
  if (!context) {
    throw new Error(
      "useFormContext must be used within a component using useForm"
    );
  }
  return context;
}

/**
 * Type representing the return value of the useForm hook.
 * This is useful for type annotations when you need to reference the form instance type.
 *
 * @template T - The type of the form values
 * @typedef {ReturnType<typeof useForm<T>>} UseFormReturn
 *
 * @example
 * // In a separate types file
 * import type { UseFormReturn } from './svelte-hook-form';
 *
 * interface LoginFormValues {
 *   email: string;
 *   password: string;
 *   rememberMe: boolean;
 * }
 *
 * export type LoginForm = UseFormReturn<LoginFormValues>;
 */
export type UseFormReturn<T extends FormValues = {}> = ReturnType<
  typeof useForm<T>
>;
