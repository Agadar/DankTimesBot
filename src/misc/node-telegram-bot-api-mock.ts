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

export async function sendMessage(chatId: number, htmlMessage: string, options: any) {
  /**/
}

export function onText(regexp: RegExp, callback: ((msg: any, match: RegExpExecArray | null) => void)): void {
  /**/
}

export function on(event: string, callback: ((msg: any, match: RegExpExecArray | null) => void)): void {
  /**/
}
