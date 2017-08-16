import { AbstractPlugin } from "./plugin/plugin";

/**
 * Class exposing the Plugin Host concept.
 * Plugins are managed by a Plugin Host, which controls
 * messaging to, from and between plugins. It also
 * keeps track of the general state of a plugin.
 */
export class PluginHost
{
  /**
   * Collection of plugins currently running.
   */
  public readonly Plugins: AbstractPlugin[];

  /**
   * Create a new Plugin Host.
   * The Plugin Host will not by itself try and
   * find compatible plugins. Instead, it requests
   * a list of plugins to be provided.
   * @param _plugins List of plugins this PluginHost should manage.
   */
  constructor(_plugins: AbstractPlugin[]) 
  {
    this.Plugins = _plugins;

    console.log("Plugin Host initialized...");
    console.log("Active plugins:");
    this.Plugins.forEach(plugin => {
      console.log(plugin.Name + " - " + plugin.Version);
    });
  }

  /**
   * Handle external text input. Return zero or more messages.
   * @param _input Text input.
   */
  public HandleInput(_input: string): string[]
  {
    let Output: string[] = [];
    for(var i = 0, len = this.Plugins.length; i < len; i++)
      {
          Output.push("I ("+this.Plugins[i].Name+") replied with: " + this.Plugins[i].PreMessageProcess(_input));
      }

    for(var i = 0, len = this.Plugins.length; i < len; i++)
      {
          Output.push("I ("+this.Plugins[i].Name+") replied with: " + this.Plugins[i].PostMessageProcess(_input));
      }
      return Output;
  }
}