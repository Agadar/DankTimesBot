/**
 * Plugin events that plugins may subscribe to.
 */
export enum PLUGIN_EVENT 
{
  PLUGIN_EVENT_PRE_MESSAGE,
  PLUGIN_EVENT_POST_MESSAGE,
  PLUGIN_EVENT_PLAYER_SCORE,
}

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
   * Boolean indicating the status of this plugin.
   * Disabled plugins will not receive messages
   * from its Plugin Host.
   */
  public Enabled: boolean;
  /**
   * Internal plugin state.
   */
  protected Data: any;
  /**
   * Event triggers. Plugins can hook functions to certain Plugin Events.
   * These plugin events are defined in the PLUGIN_EVENT enumeration.
   */
  private pluginEventTriggers: Map<PLUGIN_EVENT, (data: any) => any>;

  /**
   * Create a new Plugin instance.
   * @param _name Semantic name of this plugin.
   * @param _version Version of this plugin.
   * @param _data Any optional data that might require to be stored
   *              for this plugin.
   */
  constructor(_name: string, _version: string, _data: any) 
  {
    this.Name = _name;
    this.Version = _version;
    this.Data = _data;
    this.pluginEventTriggers = new Map<PLUGIN_EVENT, (data: any) => any>();
  };

  /**
   * Subscribe to a certain PLUGIN_EVENT.
   * @param _event Plugin event to describe to.
   * @param _eventFn Function to execute when a certain event is triggered.
   */
  protected subscribeToPluginEvent(_event: PLUGIN_EVENT, _eventFn: (data: any) => any): void
  {
    this.pluginEventTriggers.set(_event, _eventFn);
  }

  /**
   * Trigger a certain PLUGIN_EVENT on this plugin.
   * @param _event PLUGIN_EVENT to trigger.
   */
  public Trigger(_event: PLUGIN_EVENT): string
  {
    let output: string = "";

    if (this.pluginEventTriggers.has(_event))
    {
      output = (<(data: any) => any>this.pluginEventTriggers.get(_event))("")
    }

    return output;
  }
}