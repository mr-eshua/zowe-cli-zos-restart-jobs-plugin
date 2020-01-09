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

import { ITaskWithStatus } from "@zowe/imperative";

/**
 * Interface for restart job API
 * @export
 * @interface IRestartParms
 */
export interface IRestartParms {

    /**
     * Returns spool content if this option used
     */
    viewAllSpoolContent?: boolean;

    /**
     * Wait for the job to reach output status
     */
    waitForActive?: boolean;


    /**
     * Wait for the job to reach output status
     */
    waitForOutput?: boolean;

    /**
     * Local directory path to download output of the job
     */
    directory?: string;

    /**
     * A file extension to save the job output with
     */
    extension?: string;

    /**
     * Task status object used by CLI handlers to create progress bars
     * for certain job restart requests
     * Optional
     */
    task?: ITaskWithStatus;

}
