import { ICommandHandler, IHandlerParameters } from "@zowe/imperative";
import { GetJobs, IJob, ZosmfSession } from "@zowe/cli";

export default class JesHandler implements ICommandHandler {
    public async process(commandParameters: IHandlerParameters): Promise<void> {
        // Force yargs `jobid` parameter to be a string
        const jobid: string = commandParameters.arguments.jobid + "";
        const stepname: string = commandParameters.arguments.stepname + "";

        // Create session from arguments
        const session = ZosmfSession.createBasicZosmfSessionFromArguments(commandParameters.arguments);

        // Get the job details
        const job: IJob = await GetJobs.getJob(session, jobid);

        // Restart the job
        // TODO: add Restart Job API call
        // await CancelJobs.cancelJobForJob(session, job);

        const message: string = `Successfully restarted job ${job.jobname} (${jobid}) from step ${stepname}`;

        // Print message to console
        commandParameters.response.console.log(message);

        // Return as an object when using --response-format-json
        commandParameters.response.data.setMessage(message);
        commandParameters.response.data.setObj(job);
    }
}
