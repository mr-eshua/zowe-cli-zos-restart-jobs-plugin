/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

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
