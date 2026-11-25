/** What a form action hands back to its form. */
export interface ActionState {
  ok?: boolean;
  message?: string;
  /** field name -> what is wrong with it */
  errors?: Record<string, string>;
}

export const fail = (message: string, errors?: Record<string, string>): ActionState => ({ ok: false, message, errors });
export const done = (message = "Saved."): ActionState => ({ ok: true, message });

/** a readable message for a database error */
export function dbMessage(error: { code?: string; message?: string } | null | undefined, what = "That"): string {
  switch (error?.code) {
    case "23505":
      return `${what} is already used. Choose a different value.`;
    case "23503":
      return `${what} is still in use by something else, so it cannot be removed or linked like that.`;
    case "23514":
      return "One of the values is not allowed. Please check the form.";
    case "42501":
      return "You are not allowed to do that. Sign in again.";
    default:
      return "The database could not save that. Please try again.";
  }
}
