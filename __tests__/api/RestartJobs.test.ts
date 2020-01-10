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
import { IRestartParms } from "../../src/api/doc/input/IRestartParms";
import { GetJobs, SubmitJobs, IJob } from "@zowe/cli";
import { Session, TaskProgress, TaskStage } from "@zowe/imperative";

describe("RestartJobs tests", () => {

    const jobid: string = "JOB04541";
    const stepname: string = "STEP02";

    const job: IJob = {
        owner: "Z12345",
        phase: 20,
        subsystem: "JES2",
        "phase-name": "Job is on the hard copy queue",
        "job-correlator": "J0004541SVSCJES2D74CB05A.......:",
        type: "JOB",
        url: "https://127.0.0.1:443/zosmf/restjobs/jobs/J0004541SVSCJES2D74CB05A.......%3A",
        jobid,
        class: "A",
        "files-url": "https://127.0.0.1:443/zosmf/restjobs/jobs/J0004541SVSCJES2D74CB05A.......%3A/files",
        jobname: "TESTJOB",
        status: "OUTPUT",
        retcode: "ABEND S806"
    };

    const restartJobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A,\n" +
                                  "//             RESTART=(STEP02),\n" +
                                  "//STEP01   EXEC PGM=XYZ\n" +
                                  "//STEP02   EXEC PGM=IEFBR14";


    const restartJob: IJob = {
        owner: "",
        phase: 128,
        subsystem: "JES2",
        "phase-name": "Job is active in input processing",
        "job-correlator": "J0004565SVSCJES2D74D1C38.......:",
        type: "JOB",
        url: "https://127.0.0.1:443/zosmf/restjobs/jobs/J0004565SVSCJES2D74D1C38.......%3A",
        jobid,
        class: "A",
        "files-url": "https://127.0.0.1:443/zosmf/restjobs/jobs/J0004565SVSCJES2D74D1C38.......%3A/files",
        jobname: "TESTJOB",
        status: "INPUT",
        retcode: null
    };

    const dummySession = new Session({ hostname: "dummy" });

    describe("getRestartJclForJob tests", () => {

        const getJclForJobSpy = jest.spyOn(GetJobs, "getJclForJob");

        beforeEach(() => {

            getJclForJobSpy.mockClear();

        });

        it("should success with single line JOB statement", async () => {

            const jobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A                                JOB04541\n" +
                                   "//STEP01   EXEC PGM=XYZ\n" +
                                   "//STEP02   EXEC PGM=IEFBR14";

            const modifiedJobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A,\n" +
                                           "//             RESTART=(STEP02)\n" +
                                           "//STEP01   EXEC PGM=XYZ\n" +
                                           "//STEP02   EXEC PGM=IEFBR14";

            getJclForJobSpy.mockImplementation(() => jobJcl);

            const resultJobJcl: string = await RestartJobs.getRestartJclForJob(dummySession, stepname, job);

            expect(getJclForJobSpy).toHaveBeenCalledWith(dummySession, job);
            expect(resultJobJcl).toEqual(modifiedJobJcl);
        });

        it("should success with multi line JOB statement", async () => {

            const jobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',                                       JOB04541\n" +
                                   "//             CLASS=A\n" +
                                   "//STEP01   EXEC PGM=XYZ\n" +
                                   "//STEP02   EXEC PGM=IEFBR14";

            const modifiedJobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',\n" +
                                           "//             RESTART=(STEP02),\n" +
                                           "//             CLASS=A\n" +
                                           "//STEP01   EXEC PGM=XYZ\n" +
                                           "//STEP02   EXEC PGM=IEFBR14";

            getJclForJobSpy.mockImplementation(() => jobJcl);

            const resultJobJcl: string = await RestartJobs.getRestartJclForJob(dummySession, stepname, job as IJob);

            expect(getJclForJobSpy).toHaveBeenCalledWith(dummySession, job);
            expect(resultJobJcl).toEqual(modifiedJobJcl);
        });

        it("should error when no step name found in jcl", async () => {

            const jobJcl: string = "//TESTJOB JOB (ACCTINFO),'user',CLASS=A                                JOB04541\n" +
                                   "//STEP01   EXEC PGM=XYZ\n" +
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

    describe("getFailedJobRestartJcl tests", () => {

        const getJobSpy = jest.spyOn(GetJobs, "getJob");
        const getRestartJclForJobSpy = jest.spyOn(RestartJobs, "getRestartJclForJob");

        beforeEach(() => {

            getJobSpy.mockClear();
            getRestartJclForJobSpy.mockClear();

        });

        it("should success", async () => {

            getJobSpy.mockImplementation(() => job);
            getRestartJclForJobSpy.mockImplementation(() => restartJobJcl);

            const resultJobJcl: string = await RestartJobs.getFailedJobRestartJcl(dummySession, jobid, stepname);

            expect(getJobSpy).toHaveBeenCalledWith(dummySession, jobid);
            expect(getRestartJclForJobSpy).toHaveBeenCalledWith(dummySession, stepname, job);
            expect(resultJobJcl).toEqual(restartJobJcl);

        });

    });

    describe("restartFailedJob tests", () => {

        const getFailedJobRestartJclSpy = jest.spyOn(RestartJobs, "getFailedJobRestartJcl");
        const submitJclSpy = jest.spyOn(SubmitJobs, "submitJcl");

        beforeEach(() => {

            getFailedJobRestartJclSpy.mockClear();
            submitJclSpy.mockClear();

        });

        it("should success", async () => {

            getFailedJobRestartJclSpy.mockImplementation(() => restartJobJcl);
            submitJclSpy.mockImplementation(() => restartJob);

            const resultJob = await RestartJobs.restartFailedJob(dummySession, jobid, stepname);

            expect(getFailedJobRestartJclSpy).toHaveBeenCalledWith(dummySession, jobid, stepname);
            expect(submitJclSpy).toHaveBeenCalledWith(dummySession, restartJobJcl);
            expect(resultJob).toEqual(restartJob);

        });

    });

    describe("restartFailedJobWithParms tests", () => {

        const getFailedJobRestartJclSpy = jest.spyOn(RestartJobs, "getFailedJobRestartJcl");
        const submitJclStringSpy = jest.spyOn(SubmitJobs, "submitJclString");

        beforeEach(() => {

            getFailedJobRestartJclSpy.mockClear();
            submitJclStringSpy.mockClear();

        });

        it("should success with no wait for output", async () => {

            const restartParms: IRestartParms = {
                viewAllSpoolContent: false,
                directory: "",
                extension: ".txt",
                waitForActive: false,
                waitForOutput: false,
                task: {
                    statusMessage: "Restarting job",
                    percentComplete: TaskProgress.TEN_PERCENT,
                    stageName: TaskStage.IN_PROGRESS
                }
            };

            const submitParms = {
                jclSource: undefined as any,
                viewAllSpoolContent: restartParms.viewAllSpoolContent,
                directory: restartParms.directory,
                extension: restartParms.extension,
                waitForActive: restartParms.waitForActive,
                waitForOutput: restartParms.waitForOutput,
                task: restartParms.task
            }

            getFailedJobRestartJclSpy.mockImplementation(() => restartJobJcl);
            submitJclStringSpy.mockImplementation(() => restartJob);

            const resultJob = await RestartJobs.restartFailedJobWithParms(dummySession, jobid, stepname, restartParms);

            expect(getFailedJobRestartJclSpy).toHaveBeenCalledWith(dummySession, jobid, stepname);
            expect(submitJclStringSpy).toHaveBeenCalledWith(dummySession, restartJobJcl, submitParms);
            expect(resultJob).toEqual(restartJob);

        });

    });

});
