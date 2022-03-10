/**
 * Returned by a bot command when the command requires confirmation.
 */
export class BotCommandConfirmationQuestion {

    /**
     * The confirmation question sent to the chat.
     */
    public confirmationQuestionText = "🤔 Are you sure? Type 'yes' to confirm.";

    /**
     * The action to perform upon receiving confirmation.
     */
    public actionOnConfirm: () => string = () => "";
}
