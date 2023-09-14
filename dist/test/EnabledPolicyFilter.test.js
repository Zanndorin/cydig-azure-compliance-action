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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importStar(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const EnabledPolicyFilter_1 = require("../allowedlocation/lib/EnabledPolicyFilter");
const testData = __importStar(require("./TestData"));
chai_1.default.use(sinon_chai_1.default);
describe('Allowed Location Test', () => {
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should only returned enabled policies', () => {
        const enabledPolicies = (0, EnabledPolicyFilter_1.enabledPolicyFilter)(testData.PoliciyTypes);
        (0, chai_1.expect)(enabledPolicies.every((x) => x.enforcementMode == 'Enabled')).equal(true);
    });
    it('Should not returned disabled policies', () => (0, chai_1.expect)(function () {
        const enabledPolicies = (0, EnabledPolicyFilter_1.enabledPolicyFilter)(testData.PoliciyTypes);
        (0, chai_1.expect)(enabledPolicies.some((x) => x.enforcementMode == 'DoNotEnforce')).equal(false);
    }));
});
//# sourceMappingURL=EnabledPolicyFilter.test.js.map