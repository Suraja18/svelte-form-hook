import type { ZodSchema } from "zod";
import type { FormValues } from "../types";

/**
 * Creates a resolver function that validates form values against a Zod schema.
 * This function is designed to work with form libraries that expect a resolver function
 * with the signature `(values: T) => { values?: T; errors?: Record<string, string> }`.
 *
 * @module zodResolver
 * @template T - The type of the form values (must be an object with string keys)
 * @param {ZodSchema<T>} schema - The Zod schema to validate the form values against
 * @returns {(values: T) => { values?: T; errors?: Record<string, string> }} A resolver function that:
 *   - Returns `{ values: T }` if validation succeeds
 *   - Returns `{ errors: Record<string, string> }` if validation fails
 *
 * @example
 * // Basic usage with a form library
 * import { z } from 'zod';
 * import { useForm } from './svelte-hook-form';
 *
 * // Define your schema
 * const loginSchema = z.object({
 *   email: z.string().email('Invalid email address'),
 *   password: z.string().min(8, 'Password must be at least 8 characters')
 * });
 *
 * // In your component
 * const form = useForm({
 *   defaultValues: { email: '', password: '' },
 *   resolver: zodResolver(loginSchema)
 * });
 *
 * @example
 * // Manual validation
 * const validate = zodResolver(loginSchema);
 * const result = validate({ email: 'test@example.com', password: 'short' });
 * // Result: { errors: { password: 'Password must be at least 8 characters' } }
 *
 * @see https://zod.dev/ - Zod documentation for schema creation
 */
export function zodResolver<T extends FormValues>(
  schema: ZodSchema<T>
): (values: T) => { values?: T; errors?: Record<string, string> } {
  return (values: T) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data };
    }

    const fieldErrors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      errors: fieldErrors,
    };
  };
}
