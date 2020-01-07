import {ICommandHandler, IHandlerParameters, Logger} from "@zowe/imperative";

export default class HealthCheckHandler implements ICommandHandler {
  public async process(params: IHandlerParameters): Promise<void> {
    Logger.getImperativeLogger().debug("Invoked health check handler");
    params.response.console.log("You would report problems identified by healthCheck.\n" +
      "This handler is not currently called by Imperative, but\n" +
      "its existence prevents a warning during plugin validation."
    );
  }
}
