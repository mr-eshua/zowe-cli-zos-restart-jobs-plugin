import { ICommandHandler, IHandlerParameters, ImperativeError } from "@zowe/imperative";
import { GetJobs, SubmitJobs, IJob, ZosmfSession } from "@zowe/cli";

export default class JesHandler implements ICommandHandler {

    public async process(commandParameters: IHandlerParameters): Promise<void> {
        // Force yargs `jobid` and `stepname` parameters to be a string
        const jobid: string = commandParameters.arguments.jobid + "";
        const stepname: string = commandParameters.arguments.stepname + "";

        // Create session from arguments
        const session = ZosmfSession.createBasicZosmfSessionFromArguments(commandParameters.arguments);

        // Get the job details
        const job: IJob = await GetJobs.getJob(session, jobid);

        // TODO: check job status for failed

        // Get JCL for acquired job
        const jobJcl: string = await GetJobs.getJclForJob(session, job);

        // for (const line of jobJcl.split("\n")) {
        //     commandParameters.response.console.log(line);
        // }

        // Prepare new JCL, which will be restarted from specified step name
        const newJobJcl: string = this.transformToRestartJobJcl(jobJcl, jobid, stepname);

        // commandParameters.response.console.log("");

        // for (const line of newJobJcl.split("\n")) {
        //     commandParameters.response.console.log(line);
        // }

        // Re-submit the updated job
        // TODO: Add support of formatting and submit params?
        await SubmitJobs.submitJcl(session, newJobJcl);

        const message: string = `Successfully restarted job ${job.jobname} (${jobid}) from step ${stepname}`;

        // Print message to console
        commandParameters.response.console.log(message);

        // Return as an object when using --response-format-json
        commandParameters.response.data.setMessage(message);
        commandParameters.response.data.setObj(job);
    }

    private transformToRestartJobJcl(jobJcl: string, jobid: string, stepname: string): string {
        const newJclLines: string[] = [];
        let restartParamLine: string = `//             RESTART=(${stepname.toUpperCase()})`;
        let isStepFound: boolean = false;
        for (const line of jobJcl.split("\n")) {
            const upperCasedLine = line.toUpperCase();

            // Do not try to process comment lines
            if (!upperCasedLine.startsWith("//*")) {

                if (upperCasedLine.indexOf("JOB") >= 0) {

                    // Remove redundant `jobid` at the end of JOB statement and odd white spaces
                    let modifiedJobLine: string = line.replace(jobid, "").trim();

                    // Check if JOB statement is multi-line
                    if (modifiedJobLine.endsWith(",")) {
                        restartParamLine += ",";
                    }
                    else {
                        modifiedJobLine += ",";
                    }

                    // Push RESTART= param always on the second line after JOB statement
                    // This converts JOB statement to multi-line if it was not OR
                    // just add another line to already multi-lined JOB statement
                    newJclLines.push(modifiedJobLine);
                    newJclLines.push(restartParamLine);
                    continue;
                }

                // Check if specified step name really exists in JCL
                if (upperCasedLine.indexOf("EXEC") >= 0 &&
                        upperCasedLine.startsWith(`//${stepname.toUpperCase()}`)) {
                    isStepFound = true;
                }
            }

            newJclLines.push(line);
        }

        if (!isStepFound) {
            throw new ImperativeError({
                msg: `Step name ${stepname} is not found in a job with jobid ${jobid}`
            });
        }

        return newJclLines.join("\n");
    }

}
