/**
 * @module svelte-hook-form
 *
 * A lightweight form management library for Svelte that provides form state management,
 * validation, and form handling with a React Hook Form-like API.
 */

export { default as FormContext } from "./FormContext.svelte";
export { FORM_CONTEXT_KEY, useForm, useFormContext } from "./svelte-hook-form";
export { zodResolver } from "./zod-resolver";

// Type exports
export type {
  FieldErrors,
  FormState,
  FormValues,
  Resolver,
  UseFormOptions,
  UseFormReturn,
} from "./types";
