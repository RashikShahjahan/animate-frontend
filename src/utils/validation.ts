import { ZodError } from 'zod';

/**
 * Formats a ZodError into a user-friendly error message.
 * 
 * @param error The ZodError to format
 * @returns A string with formatted error message
 */
export const formatZodError = (error: ZodError): string => {
  return error.errors
    .map((err) => {
      const path = err.path.join('.');
      return `${path ? `${path}: ` : ''}${err.message}`;
    })
    .join(', ');
};

/**
 * Checks if an error is a ZodError
 * 
 * @param error Any error object
 * @returns True if the error is a ZodError
 */
export const isZodError = (error: unknown): error is ZodError => {
  return error instanceof ZodError;
}; 