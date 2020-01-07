import { IImperativeConfig } from "@zowe/imperative";

const config: IImperativeConfig = {
    commandModuleGlobs: ["**/cli/*/*.definition!(.d).*s"],
    pluginHealthCheck: __dirname + "/healthCheck.Handler",
    pluginSummary: "Zowe CLI restart z/OS jobs plug-in",
    rootCommandDescription: "Plugin, which allows to restart z/OS jobs",
    productDisplayName: "Zowe CLI z/OS Jobs Restart Plug-in",
    name: "zos-restart-jobs"
};

export = config;
