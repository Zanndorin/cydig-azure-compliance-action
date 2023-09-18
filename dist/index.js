"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const identity_1 = require("@azure/identity");
const SecureScore_1 = require("./securescore/SecureScore");
const DeployedVirtualMachines_1 = require("./deployedvirtualmachines/DeployedVirtualMachines");
const allowedlocation_1 = require("./allowedlocation");
const usersinproduction_1 = require("./usersinproduction");
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        const credentials = new identity_1.DefaultAzureCredential();
        const subscriptionId = core.getInput('subscription');
        await SecureScore_1.SecureScore.getSecureScore(credentials, subscriptionId);
        await DeployedVirtualMachines_1.DeployedVirtualMachines.getDeployedVirtualMachines(credentials, subscriptionId);
        await allowedlocation_1.AllowedLocation.getAllowedLocation(credentials, subscriptionId);
        await usersinproduction_1.UsersInProduction.getUsersInProduction(credentials, subscriptionId);
    }
    catch (error) {
        if (error instanceof Error)
            core.setFailed(error.message);
    }
}
exports.run = run;
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
//# sourceMappingURL=index.js.map