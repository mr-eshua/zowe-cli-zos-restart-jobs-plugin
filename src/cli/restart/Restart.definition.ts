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

import { ICommandDefinition } from "@zowe/imperative";
import { JesDefinition } from "./jes/Jes.definition";
import { ZosmfSession } from "@zowe/cli";

const restartDefinition: ICommandDefinition = {
    name: "restart",
    summary: "Restart z/OS job",
    description: "Restart z/OS job.",
    type: "group",
    children: [
        JesDefinition
    ],
    passOn: [
        {
            property: "options",
            value: ZosmfSession.ZOSMF_CONNECTION_OPTIONS,
            merge: true,
            ignoreNodes: [
                {type: "group"}
            ]
        }
    ]
};

export = restartDefinition;
