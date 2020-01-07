describe("imperative config", () => {

    // Will fail if imperative config object is changed. This is a sanity/protection check to ensure that any
    // changes to the configuration document are intended.
    it("config should match expected values", () => {
        const config = require("../src/imperative");
        expect(config.name).toBe("zos-restart-jobs");
        expect(config.pluginHealthCheck).toContain("healthCheck.Handler");
        expect(config.pluginSummary).toBe("Zowe CLI restart z/OS jobs plug-in");
        expect(config.productDisplayName).toBe("Zowe CLI z/OS Jobs Restart Plug-in");
        expect(config.rootCommandDescription).toBe("Plugin, which allows to restart z/OS jobs");
    });

});
