import { getContext, setContext } from "svelte";
import { get, readable, writable, type Writable } from "svelte/store";
import { getNestedValue, setNestedValue } from "../src/lib/utils";
import type {
  FieldErrors,
  FormValues,
  UseFormOptions,
  UseFormReturn,
} from "./types";

/**
 * Symbol used as the key for the form context
 */
export const FORM_CONTEXT_KEY = Symbol("svelte-hook-form");

/**
 * Creates and manages a form instance with the provided options.
 */
export function useForm<T extends FormValues = FormValues>(
  opts?: UseFormOptions<T>
): UseFormReturn<T> {
  const defaultValues = (opts?.defaultValues ?? {}) as T;
  const resolver = opts?.resolver;

  // Stores
  const values: Writable<T> = writable({ ...defaultValues });
  const errors: Writable<FieldErrors> = writable({});
  const touched: Writable<Partial<Record<keyof T, boolean>>> = writable({});
  const dirty: Writable<Partial<Record<keyof T, boolean>>> = writable({});
  const isSubmitting = writable(false);

  function register<K extends string>(name: K) {
    const fieldValue = getNestedValue(get(values), name);
    return {
      name,
      value: fieldValue,
      onInput: (e: Event) => {
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
      onBlur: () => {
        touched.update((t) => ({ ...t, [name]: true }));
        trigger(name as keyof T & string);
      },
    };
  }

  function control<K extends keyof T & string>(name: K) {
    return {
      value: get(values)[name],
      onChange: (val: T[K]) => {
        values.update((v) => {
          (v as any)[name] = val;
          return v;
        });
        dirty.update((d) => ({ ...d, [name]: true }));
        touched.update((t) => ({ ...t, [name]: true }));
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
      return newValues;
    });
    dirty.update((d) => ({ ...d, [name]: true }));
    touched.update((t) => ({ ...t, [name]: true }));
    trigger(name as keyof T & string);
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
    touched.set({});
    dirty.set({});
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

  const formApi: UseFormReturn<T> = {
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
 */
export function useFormContext<
  T extends FormValues = FormValues
>(): UseFormReturn<T> {
  const context = getContext<UseFormReturn<T>>(FORM_CONTEXT_KEY);
  if (!context) {
    throw new Error(
      "useFormContext must be used within a component using useForm"
    );
  }
  return context;
}

export type { UseFormReturn };
