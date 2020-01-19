# IBM z/OS Jobs Restart Plug-in for Zowe CLI

The IBM z/OS Jobs Restart Plug-in for Zowe CLI lets you extend Zowe CLI to allow restart operation for z/OS jobs.

- [How the plug-in works](#how-the-plug-in-works)
- [Known issues](#known-issues)
- [Software requirements](#software-requirements)
- [Installing](#installing)
- [Building from source](#building-from-source)
- [z/OSMF parameters](#zosmf-parameters)
- [Running tests](#running-tests)
- [Uninstalling](#uninstalling)

## How the plug-in works

IBM z/OS Jobs Restart Plug-in for Zowe CLI being installed allows failed z/OS jobs identified by Job ID to be restarted from a specific job step.

### Implementation details

Since z/OSMF REST API has no special requests to execute a job restart, other REST API functionality is re-used in order to offer a sort of emulation of job restart capabilities.

The steps are:

- Check if the status of a job with `jobid` is failed (return code is any, but `CC 0000`)
- Retrieve a JCL for specified `jobid` from job spool data set `JESJCL`
- Modify a `JOB` statement of received JCL with `RESTART=(stepname)` parameter, which allows to start a job execution from a certain point (step) specified by `stepname`
- Re-submit modified JCL as a new job (new `jobid` is returned)

Because the restart command is implemented by using job submit API as a final step, it also supports specific options that already existing `zowe zos-jobs submit` command provides, such as: awaiting for a job completion, save spool files to the disk and related. See details in [Command format](#command-format)

### Command format

In general, the usage of a command is as follows:

```
zowe zos-restart-jobs restart jes <jobid> <stepname> [options]
```

Where:

- `<jobid>` - ID of a job (e.g. `JOB01234`)
- `<stepname>` - ID of a step within a job (e.g. `STEP001`)
- `[options]` -  optional parameters like:
  - z/OSMF Connection options
  - Profile options
  - Response format options
  - Command-specific options:
    ```
    --view-all-spool-content  | --vasc (boolean)

       Print all spool output. If you use this option you will wait the job to
       complete.

    --wait-for-output  | --wfo (boolean)

       Wait for the job to enter OUTPUT status before completing the command.

    --wait-for-active  | --wfa (boolean)

       Wait for the job to enter ACTIVE status before completing the command.

    --directory  | -d (string)

       The local directory you would like to download the output of the job. Creates a
       subdirectory using the jobID as the name and files are titled based on DD names.
       If you use this option you will wait the job to complete.

    --extension  | -e (string)

       A file extension to save the job output with. Default is '.txt'.
    ```

### Examples

To restart a job with job ID `JOB03456` from step `STEP002`, the following command is used:

```
zowe zos-restart-jobs restart jes JOB03456 STEP002
```

## Software requirements

Before you install and use the plug-in make sure you have installed Zowe CLI on your computer.

**Note:** For more information, see [Installing Zowe CLI](https://zowe.github.io/docs-site/latest/user-guide/cli-installcli.html).

## Installing

Build the plug-in from source and install it into your Zowe CLI implementation.

## Building from source

**Follow these steps:**

1.  The first time that you clone the IBM z/OS Jobs Restart Plug-in for Zowe CLI GitHub repository, issue the following command against the local directory:

    ```
    npm install
    ```
    The command installs the required dependencies for the plug-in and several development tools. You can run the task at any time to update the tools as needed.

2.  To build your code changes, issue the following command:
    ```
    npm run build
    ```

    **Note:** When you update `package.json` to include new dependencies, or when you pull changes that affect `package.json`, issue the `npm update` command to download the dependencies.

3.  Issue one of the following commands to install the plug-in:

    ```
    zowe plugins install @zowe/zos-restart-jobs-plugin
    ```
    Or:
    ```
    zowe plugins install .
    ```

Or just use the following command to execute previous commands all at once:

```
npm run installPlugin
```

**Tip:** After the installation process completes, it validates that the plug-in was installed correct and the names of its commands, options, and arguments do not conflict with that of the other plug-ins that you installed into your Zowe CLI implementation.

When the validation process is successful, the following message displays:

```
_____ Validation results for plugin '@zowe/zos-restart-jobs-plugin' _____
This plugin was successfully validated. Enjoy the plugin.
```

When an unsuccessful message displays, you can troubleshoot the installation by addressing the issues that the message describes. You can also review the information that is contained in the log file in the Zowe CLI home directory.

## z/OSMF parameters

This plug-in requires z/OSMF end-point and credentials to issue the commands. Those parameters can be specified using restart command options.

**Note:** For more information, issue the following command:
```
zowe zos-restart-jobs restart jes --help
```

Alternatively, you can create z/OSMF profile with all necessary settings to reuse it in the further. Issue the following commands to create a zosmf profile and set it as default:

```
zowe profiles create zosmf <profile name> -H <host> -P <port> -u <user> -p <password>
zowe profiles set zosmf <profile name>
```

**Note:** For more information, issue the following commands:
```
zowe profiles create zosmf --help
zowe profiles set zosmf --help
```

## Running tests

You can perform the following types of tests on the IBM Jobs Restart Plug-in:

- Unit
- Integration
- System

**Note:** For detailed information about conventions and best practices for running tests against Zowe CLI plug-ins, see [Zowe CLI Plug-in Testing Guidelines](https://github.com/zowe/zowe-cli/blob/master/docs/PluginTESTINGGuidelines.md).

Issue the following commands to run the tests:

1. `npm run test:unit`
2. `npm run test:integration`
3. `npm run test:system`

Or run them all at once with:

`npm run test`

## Uninstalling

**Follow these steps:**

1.  To uninstall the plug-in from a base application, issue the following command:
    ```
    zowe plugins uninstall @zowe/zos-restart-jobs-plugin
    ```

After the uninstallation process completes successfully, Zowe CLI no longer contains the plug-in.
