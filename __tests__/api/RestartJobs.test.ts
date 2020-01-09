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

import { RestartJobs } from "../../src/api/RestartJobs";
import { GetJobs, IJob } from "@zowe/cli";
import { Session } from "@zowe/imperative";

describe("RestartJobs tests", () => {

    describe("getRestartJclForJob tests", () => {

        const jobid: string = "JOB04541";
        const stepname: string = "STEP02";
        const job = {
            jobid
        };

        const dummySession = new Session({ hostname: "dummy" });

        const getJclForJobSpy = jest.spyOn(GetJobs, "getJclForJob");

        beforeEach(() => {
            getJclForJobSpy.mockClear();
        });

        it("should success with single line JOB statement", async () => {
            const jobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A                                JOB04541\n" +
                                   "//STEP01   EXEC PGM=IEFBR14\n" +
                                   "//STEP02   EXEC PGM=IEFBR14";

            const modifiedJobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A,\n" +
                                           "//             RESTART=(STEP02)\n" +
                                           "//STEP01   EXEC PGM=IEFBR14\n" +
                                           "//STEP02   EXEC PGM=IEFBR14";;

            getJclForJobSpy.mockImplementation(() => jobJcl);

            const resultJobJcl: string = await RestartJobs.getRestartJclForJob(dummySession, stepname, job as IJob);
            expect(getJclForJobSpy).toHaveBeenCalledWith(dummySession, job);
            expect(resultJobJcl).toEqual(modifiedJobJcl);
        });

        it("should success with multi line JOB statement", async () => {
            const jobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',                                       JOB04541\n" +
                                   "//             CLASS=A\n" +
                                   "//STEP01   EXEC PGM=IEFBR14\n" +
                                   "//STEP02   EXEC PGM=IEFBR14";

            const modifiedJobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',\n" +
                                           "//             RESTART=(STEP02),\n" +
                                           "//             CLASS=A\n" +
                                           "//STEP01   EXEC PGM=IEFBR14\n" +
                                           "//STEP02   EXEC PGM=IEFBR14";;

            getJclForJobSpy.mockImplementation(() => jobJcl);

            const resultJobJcl: string = await RestartJobs.getRestartJclForJob(dummySession, stepname, job as IJob);
            expect(getJclForJobSpy).toHaveBeenCalledWith(dummySession, job);
            expect(resultJobJcl).toEqual(modifiedJobJcl);
        });

        it("should error when no step name found in jcl", async () => {
            const jobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A                                JOB04541\n" +
                                   "//STEP01   EXEC PGM=IEFBR14\n" +
                                   "//STEP02   EXEC PGM=IEFBR14";

            getJclForJobSpy.mockImplementation(() => jobJcl);

            try {
                await RestartJobs.getRestartJclForJob(dummySession, "STEP03", job as IJob);
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
            expect(getJclForJobSpy).toHaveBeenCalledWith(dummySession, job);

        });

    });

});
