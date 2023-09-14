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
const AllowedLocations_1 = require("../allowedlocation/lib/AllowedLocations");
chai_1.default.use(sinon_chai_1.default);
describe('Allowed Location Test', () => {
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should return true if location is within allowed locations', () => {
        const isEnabled = (0, AllowedLocations_1.isLocationAllowed)(['europe']);
        (0, chai_1.expect)(isEnabled).equal(true);
    });
    it('Should throw error if location is empty', () => (0, chai_1.expect)(function () {
        (0, AllowedLocations_1.isLocationAllowed)([]);
    }).to.throw('Locations must contain values'));
    it('Should throw error if location is undefined', () => (0, chai_1.expect)(function () {
        (0, AllowedLocations_1.isLocationAllowed)(undefined);
    }).to.throw('Locations must contain values'));
    it('Should throw error if location is null', () => (0, chai_1.expect)(function () {
        (0, AllowedLocations_1.isLocationAllowed)(null);
    }).to.throw('Locations must contain values'));
});
//# sourceMappingURL=AllowedLocation.test.js.map