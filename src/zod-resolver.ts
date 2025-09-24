import type { ZodSchema } from "zod";
import type { FormValues, Resolver } from "./types";

/**
 * Creates a resolver function that validates form values against a Zod schema.
 */
export function zodResolver<T extends FormValues>(
  schema: ZodSchema<T>
): Resolver<T> {
  return (values: T) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data };
    }

    const fieldErrors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      errors: fieldErrors,
    };
  };
}
