/**
 * Class defining the interface every plugin should adhere to.
 */
export abstract class AbstractPlugin 
{
  /**
   * Semantic identifier of this plugin. 
   */
  public Name: string;
  /**
   * Version of this plugin.
   */
  public Version: string;
  /**
   * Internal plugin state.
   */
  protected Data: any;
  /**
   * Boolean indicating the status of this plugin.
   * Disabled plugins will not receive messages
   * from its Plugin Host.
   */
  public Enabled: boolean;

  /**
   * Create a new Plugin instance.
   * @param _name Semantic name of this plugin.
   * @param _version Version of this plugin.
   * @param _data Any optional data that might require to be stored
   *              for this plugin.
   */
  constructor(_name: string, _version: string, _data: any) 
  {
    this.Name    = _name;
    this.Version = _version;
    this.Data    = _data;
   };

  /**
   * Pre-Message Process Hook.
   * Define any behaviour that occurs before DankTimesBot handles an incoming message.
   * @param _input Pre-Message Process input.
   */
  abstract PreMessageProcess(_input: string): string;
  /**
   * Post-Message Process Hook.
   * Define any behaviour that occurs after DankTimesBot has handled an incoming message
   * and is ready to return some response.
   * @param _input Post-Message Process input.
   */
  abstract PostMessageProcess(_input: string): string;
}