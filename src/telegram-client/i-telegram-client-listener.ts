/**
 * Listens to a telegram client. Can possibly be expanded in the future.
 */
export interface ITelegramClientListener {

  /**
   * Called when the client was returned an error by the API.
   */
  onErrorFromApi(chatId: number, error: any): void;
}
