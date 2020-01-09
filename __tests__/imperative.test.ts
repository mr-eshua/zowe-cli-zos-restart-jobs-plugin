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

describe("imperative config", () => {

    // Will fail if imperative config object is changed. This is a sanity/protection check to ensure that any
    // changes to the configuration document are intended.
    it("should not have changed", () => {
        const config: IImperativeConfig = require("../src/imperative");
        expect(config.pluginHealthCheck).toContain("healthCheck.Handler");
        delete config.pluginHealthCheck;
        expect(config).toMatchSnapshot();
    });

});
