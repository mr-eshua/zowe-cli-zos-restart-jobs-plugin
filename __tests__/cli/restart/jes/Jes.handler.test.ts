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

import { ZosmfSession, IJob } from "@zowe/cli";
import { CommandProfiles, IHandlerParameters, IProfile, Session, TaskProgress, TaskStage } from "@zowe/imperative";
import { JesDefinition } from "../../../../src/cli/restart/jes/Jes.definition";
import JesHandler from "../../../../src/cli/restart/jes/Jes.handler";
import { RestartJobs } from "../../../../src/api/RestartJobs";
import { IRestartParms } from "../../../../src/api/doc/input/IRestartParms";

const host = "127.0.0.1";
const port = "443";
const user = "user";
const password = "password";
const protocol = "https";
const rejectUnauthorized = false;

const PROFILE_MAP = new Map<string, IProfile[]>();
PROFILE_MAP.set(
    "zosmf", [{
        name: "zosmf",
        type: "zosmf",
        host,
        port,
        user,
        password
    }]
);
const PROFILES: CommandProfiles = new CommandProfiles(PROFILE_MAP);
const DEFAULT_PARAMETERS: IHandlerParameters = {
    arguments: {$0: "", _: []}, // Please provide arguments later on
    response: {
        data: {
            setMessage: jest.fn((setMsgArgs) => {
                expect(setMsgArgs).toMatchSnapshot();
            }) as any,
            setObj: jest.fn((setObjArgs) => {
                expect(setObjArgs).toMatchSnapshot();
            }),
            setExitCode: jest.fn()
        },
        console: {
            log: jest.fn((logs) => {
                expect(logs.toString()).toMatchSnapshot();
            }) as any,
            error: jest.fn((errors) => {
                expect(errors.toString()).toMatchSnapshot();
            }) as any,
            errorHeader: jest.fn(() => undefined)
        },
        progress: {
            startBar: jest.fn((parms) => {
                expect(parms).toMatchSnapshot();
            }),
            endBar: jest.fn(() => undefined)
        },
        format: {
            output: jest.fn((parms) => {
                expect(parms).toMatchSnapshot();
            })
        }
    },
    definition: JesDefinition,
    fullDefinition: JesDefinition,
    profiles: PROFILES
};

describe("JesHandler tests", () => {

    const jobid: string = "JOB04541";
    const stepname: string = "STEP02";

    const defaultReturn: IJob = {
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

    const defaultParms: IRestartParms = {
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

    const testProfile = PROFILE_MAP.get("zosmf")[0];
    const testSession: Session = new Session({
        type: "basic",
        hostname: testProfile.host,
        port: testProfile.port,
        user: testProfile.user,
        password: testProfile.password,
        rejectUnauthorized,
        protocol
    });

    const createBasicZosmfSessionFromArgumentsSpy = jest.spyOn(ZosmfSession, "createBasicZosmfSessionFromArguments");
    const restartFailedJobWithParmsSpy = jest.spyOn(RestartJobs, "restartFailedJobWithParms");

    beforeEach(() => {

        createBasicZosmfSessionFromArgumentsSpy.mockClear();
        createBasicZosmfSessionFromArgumentsSpy.mockImplementation(() => testSession);

        restartFailedJobWithParmsSpy.mockClear();
        restartFailedJobWithParmsSpy.mockImplementation(() => Promise.resolve(defaultReturn));

    });

    it("should call the restartFailedJobWithParms API", async () => {

        const handler = new JesHandler();

        const commandParameters = {...DEFAULT_PARAMETERS};
        commandParameters.arguments = {
            ...commandParameters.arguments,
            jobid,
            stepname,
            host,
            port,
            user,
            password,
            rejectUnauthorized,
            protocol,
            viewAllSpoolContent: defaultParms.viewAllSpoolContent,
            directory: defaultParms.directory,
            extension: defaultParms.extension,
            waitForActive: defaultParms.waitForActive,
            waitForOutput: defaultParms.waitForOutput,
        };

        await handler.process(commandParameters);

        expect(createBasicZosmfSessionFromArgumentsSpy).toHaveBeenCalledTimes(1);
        expect(createBasicZosmfSessionFromArgumentsSpy).toHaveBeenCalledWith(commandParameters.arguments);

        expect(restartFailedJobWithParmsSpy).toHaveBeenCalledTimes(1);
        expect(restartFailedJobWithParmsSpy).toHaveBeenCalledWith(
            testSession,
            jobid,
            stepname,
            {
                viewAllSpoolContent: defaultParms.viewAllSpoolContent,
                directory: defaultParms.directory,
                extension: defaultParms.extension,
                waitForActive: defaultParms.waitForActive,
                waitForOutput: defaultParms.waitForOutput,
                task: defaultParms.task
            } as IRestartParms
        );

    });

});
