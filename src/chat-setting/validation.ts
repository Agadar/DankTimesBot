/** A simple message resulting from a validation check on a value fed to a setting. */
export interface Validation {
  /** Whether the value was succesfully validated, and thus the setting value was set. */
  readonly success: boolean;
  /** The corresponding message, containing feedback that elaborates on the above value. */
  readonly message: string;
}
