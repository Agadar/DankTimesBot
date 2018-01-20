export async function getMe() {
  return {
    username: "botusername",
  };
}

export async function getChatAdministrators(chatId: number) {
  return [
    {
      user: {
        id: 0,
      },
    },
  ];
}

export async function sendMessage(chatId: number | string, text: string, options?: any): Promise<any> {
  if (chatId === -1) {
    throw {
      response: {
        statusCode: 403,
      },
    };
  }
}

export function onText(regexp: RegExp, callback: ((msg: any, match: RegExpExecArray | null) => void)): void {
  /**/
}

export function on(event: string, callback: ((msg: any, match: RegExpExecArray | null) => void)): void {
  /**/
}
