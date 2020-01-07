import { ICommandDefinition, ICommandOptionDefinition } from "@zowe/imperative";

export const JesDefinition: ICommandDefinition = {
    name: "jes",
    type: "command",
    summary: "Restart a failed job",
    description: "Restart a failed job by job ID and from step name is specified.",
    handler: __dirname + "/Jes.handler",
    profile: {
        optional: ["zosmf"],
    },
    positionals: [
        {
            name: "jobid",
            description: "The job ID (e.g. JOB00123) of the job. Job ID is a unique identifier for z/OS batch jobs " +
                "-- no two jobs on one system can have the same ID. Note: z/OS allows you to abbreviate " +
                "the job ID if desired. You can use, for example \"J123\".",
            type: "string",
            required: true
        },
        {
            name: "stepname",
            description: "The step name (e.g. STEP1) of the job. Step name is a unique identifier for a step within " +
                "z/OS batch jobs. The step name is used to restart job from that point.",
            type: "string",
            required: true
        },
    ],
    options: ([
        {
            name: "view-all-spool-content", aliases: ["vasc"],
            description: "Print all spool output." +
                " If you use this option you will wait the job to complete.",
            type: "boolean"
        },
        {
            name: "wait-for-output", aliases: ["wfo"],
            description: "Wait for the job to enter OUTPUT status before completing the command.",
            type: "boolean"
        },
        {
            name: "wait-for-active", aliases: ["wfa"],
            description: "Wait for the job to enter ACTIVE status before completing the command.",
            type: "boolean",
            conflictsWith: ["wait-for-output", "view-all-spool-content", "directory"]
        },
        {
            name: "directory", aliases: ["d"],
            description: "The local directory you would like to download the output of the job." +
                " Creates a subdirectory using the jobID as the name and files are titled based on DD names." +
                " If you use this option you will wait the job to complete.",
            type: "string"
        },
        {
            name: "extension", aliases: ["e"],
            description: "A file extension to save the job output with. Default is '.txt'.",
            type: "string"
        },
    ] as ICommandOptionDefinition[]),
    examples: [
        {
            description: "Restart job with job ID JOB03456 starting from EXECSTEP3 step",
            options: "JOB03456 EXECSTEP3",
        },
    ],
    outputFormatOptions: true,
};
