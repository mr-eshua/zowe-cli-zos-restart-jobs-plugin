import {IImperativeConfig} from "@zowe/imperative";

const config: IImperativeConfig = {
    commandModuleGlobs: ["**/cli/*/*.definition!(.d).*s"],
    pluginSummary: "Zowe CLI restart z/OS jobs plug-in",
    pluginAliases: ["restart-jobs"],
    rootCommandDescription: "Plugin, which allows to restart z/OS jobs",
    productDisplayName: "Zowe CLI z/OS Jobs Restart Plug-in",
    name: "zos-restart-jobs"
};

export = config;
