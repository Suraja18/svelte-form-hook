/**
 * @module svelte-hook-form
 *
 * A lightweight form management library for Svelte that provides form state management,
 * validation, and form handling with a React Hook Form-like API.
 */

export {
  FORM_CONTEXT_KEY,
  useForm,
  useFormContext,
} from "./lib/svelte-hook-form";
export { zodResolver } from "./zod-resolver";
