/**
 * Type representing form field errors
 * @typedef {Object} FieldErrors
 * @property {string} [key] - Field name as key and error message as value
 */
export type FieldErrors = Record<string, string>;
/**
 * Type representing form values
 * @template T - The shape of the form values
 */
export type FormValues = Record<string, any>;
/**
 * Resolver function type for form validation
 * @template T - The type of the form values
 * @param {T} values - The form values to validate
 * @returns {{values?: T, errors?: FieldErrors}} - Validation result
 */
export type Resolver<T> = (values: T) => {
    values?: T;
    errors?: FieldErrors;
};
//# sourceMappingURL=form.d.ts.map