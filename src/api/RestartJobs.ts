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

import { IJob, GetJobs, SubmitJobs, JOB_STATUS } from "@zowe/cli";
import { AbstractSession, ImperativeError, ImperativeExpect } from "@zowe/imperative";
import { IRestartParms } from "./doc/input/IRestartParms";

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

        // Get the restart job JCL
        const restartJobJcl: string = await this.getFailedJobRestartJcl(session, jobid, stepname);

        // Re-submit restart job JCL
        return SubmitJobs.submitJcl(session, restartJobJcl);
    }

    public static async restartFailedJobWithParms(session: AbstractSession, jobid: string, stepname: string,
                                                  parms: IRestartParms) {

        // Get the restart job JCL
        const restartJobJcl: string = await this.getFailedJobRestartJcl(session, jobid, stepname);

        // Transform into ISubmitParms structure
        const submitParms = {
            jclSource: undefined as any,
            viewAllSpoolContent: parms.viewAllSpoolContent,
            directory: parms.directory,
            extension: parms.extension,
            waitForActive: parms.waitForActive,
            waitForOutput: parms.waitForOutput,
            task: parms.task
        };

        // Re-submit restart job JCL
        return SubmitJobs.submitJclString(session, restartJobJcl, submitParms);
    }


    public static async getFailedJobRestartJcl(session: AbstractSession, jobid: string, stepname: string) {
        const errorMessagePrefix: string =
            `Restarting job with id ${jobid} on ${session.ISession.hostname}:${session.ISession.port} failed: `;

        // Get the job details
        const job: IJob = await GetJobs.getJob(session, jobid);

        ImperativeExpect.toBeEqual(job.status, JOB_STATUS.OUTPUT,
                                      errorMessagePrefix + "Job status is ACTIVE, OUTPUT is required");
        ImperativeExpect.toNotBeEqual(job.retcode, "CC 0000",
                                      errorMessagePrefix + "Job status is successful, failed is required");

        // Get the restart job JCL
        return this.getRestartJclForJob(session, stepname, job);
    }

}
