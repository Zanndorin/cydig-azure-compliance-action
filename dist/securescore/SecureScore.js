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
exports.SecureScore = void 0;
const arm_security_1 = require("@azure/arm-security");
const core = __importStar(require("@actions/core"));
class SecureScore {
    static async getSecureScore(credentials, subscriptionId) {
        const client = new arm_security_1.SecurityCenter(credentials, subscriptionId);
        console.log('Getting Azure Secure Score');
        // eslint-disable-next-line @typescript-eslint/typedef
        const secureScoreObject = await client.secureScores.get('ascScore');
        if (secureScoreObject?.['percentage']) {
            const secureScorePercent = Math.round(secureScoreObject?.['percentage'] * 100);
            console.log(`AZURE SECURE SCORE: ${secureScorePercent}%`);
            core.exportVariable('secureScore', secureScorePercent.toString());
        }
        else {
            console.log('Something went wrong or no secure score found');
        }
    }
}
exports.SecureScore = SecureScore;
//# sourceMappingURL=SecureScore.js.map