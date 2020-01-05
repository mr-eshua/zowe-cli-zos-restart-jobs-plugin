import { ICommandDefinition } from "@zowe/imperative";

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
    examples: [
        {
            description: "Restart job with job ID JOB03456 starting from EXECSTEP3 step",
            options: "JOB03456 EXECSTEP3",
        },
    ],
};
