import consolefy from "@mengkodingan/consolefy";
import { walk } from "../Common/Functions";


export class CommandHandler {
    _bot: any;
    _path: string;
    consolefy?: consolefy.Consolefy;

    /**
     * Create a new command handler instance
     * 
     * ```ts
     * import { CommandHandler } from "@mengkodingan/ckptw";
     * import path from "path";
     * 
     * const cmd = new CommandHandler(bot, path.resolve() + '/path/to/dir');
     * cmd.load();
     * 
     * ```
     * 
     * @param bot The bot instance
     * @param path A string that represent a path to commands directory. Recomended using `path` library.
     * 
     * ```ts
     * import path from "path";
     * const cmd = new CommandHandler(bot, path.resolve() + '/path/to/dir');
     * ```
     */
    constructor(bot: any, path: string) {
        this._bot = bot;
        this._path = path;

        this.consolefy = new consolefy.Consolefy({ tag: 'command-handler' });
    }

    async load(isShowLog: boolean = true) {
      if (isShowLog) this.consolefy?.group("Command Handler Load");

      const files: string[] = [];

      walk(this._path, (filepath: string, stats?: unknown) => {
        files.push(filepath);
        return {};
      });

      for (const filepath of files) {
        try {
          const module = await import(filepath);
          const cmdObj = module.default || module;

          if (!cmdObj.type || cmdObj.type === 'command') {
            this._bot.cmd.set(cmdObj.name, cmdObj);
            if (isShowLog) this.consolefy?.success(`Loaded Command - ${cmdObj.name}`);
          } else if (cmdObj.type === 'hears') {
            this._bot.hearsMap.set(cmdObj.name, cmdObj);
            if (isShowLog) this.consolefy?.success(`Loaded Hears - ${cmdObj.name}`);
          }
        } catch (error) {
          if (isShowLog) this.consolefy?.error(`Failed to load ${filepath}: ${error}`);
        }
      }

      if (isShowLog) this.consolefy?.groupEnd();
    }
}