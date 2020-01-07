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
     * for certain job submit requests
     * Optional
     */
    task?: ITaskWithStatus;

}
