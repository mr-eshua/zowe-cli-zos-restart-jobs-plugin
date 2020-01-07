import { IJob, GetJobs, SubmitJobs } from "@zowe/cli";
import { AbstractSession, ImperativeError } from "@zowe/imperative";

export class RestartJobs {

    public static async getRestartJclForJob(session: AbstractSession, stepname: string, job: IJob) {
        const jobJcl: string = await GetJobs.getJclForJob(session, job);

        const newJclLines: string[] = [];
        let restartParamLine: string = `//             RESTART=(${stepname.toUpperCase()})`;
        let isStepFound: boolean = false;

        for (const line of jobJcl.split("\n")) {
            const upperCasedLine = line.toUpperCase();

            // TODO: handle the case where RESTART= param already specified

            // Do not try to process comment lines
            if (!upperCasedLine.startsWith("//*")) {

                if (upperCasedLine.indexOf("JOB") >= 0) {

                    // Remove redundant `jobid` at the end of JOB statement and odd white spaces
                    let modifiedJobLine: string = line.replace(job.jobid, "").trim();

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
                msg: `Step name ${stepname} is not found in a job with jobid ${job.jobid}`
            });
        }

        return newJclLines.join("\n");
    }

    public static async restartFailedJob(session: AbstractSession, jobid: string, stepname: string) {

        const errorMessagePrefix: string =
            `Restarting job with id ${jobid} on ${session.ISession.hostname}:${session.ISession.port} failed: `;

        // Get the job details
        const job: IJob = await GetJobs.getJob(session, jobid);

        if (job.retcode === "CC 0000") {
            throw new ImperativeError({
                msg: errorMessagePrefix + "Job status is successful, failed is required"
            });
        }

        // Get the restart job JCL
        const restartJobJcl: string = await this.getRestartJclForJob(session, stepname, job);

        // Re-submit restart job JCL
        // TODO: use additional parms from IRestartParms
        return SubmitJobs.submitJcl(session, restartJobJcl);
    }

}
