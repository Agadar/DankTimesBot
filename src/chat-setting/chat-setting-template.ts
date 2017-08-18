export interface Validation {
  succes: boolean;
  message: string;
}

export class ChatSettingTemplate<T> {

  constructor(public readonly name: string,
              public readonly description: string,
              public readonly defaultValue: T,
              public readonly validator: ((newValue: T, currentValue?: T) => Validation)) {
    const validation = this.validator(defaultValue);
    if (!validation.succes) {
      throw new Error(`Default value does not pass validator! Message: '${validation.message}'`);
    }
  }
}
