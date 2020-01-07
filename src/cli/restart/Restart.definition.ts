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
