/**
 * Utility functions for svelte-hook-form
 */
/**
 * Helper function to get nested value from an object using dot notation
 */
export function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, part) => {
        if (acc === null || acc === undefined)
            return undefined;
        return acc[part];
    }, obj);
}
/**
 * Helper function to set nested value in an object using dot notation
 */
export function setNestedValue(obj, path, value) {
    const parts = path.split(".");
    const [last, ...rest] = parts.reverse();
    let current = { ...obj };
    for (const part of rest.reverse()) {
        if (current[part] === undefined) {
            current[part] = {};
        }
        current = current[part];
    }
    current[last] = value;
    return obj;
}
