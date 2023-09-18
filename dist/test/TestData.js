"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciyTypes = exports.policyNotEnabled = exports.policyEnabled = void 0;
const name = 'testPolicy';
const subscriptionId = 'testSubscriptionId';
const managementGroup = 'testmanagementGroup';
const allowedLocations = ['sweden', 'europe'];
const enforcementModeOn = 'Enabled';
const enforcementModeOff = 'DoNotEnforce';
exports.policyEnabled = {
    name: name,
    subscriptionId: subscriptionId,
    managementGroup: managementGroup,
    allowedLocations: allowedLocations,
    enforcementMode: enforcementModeOn,
};
exports.policyNotEnabled = {
    name: name,
    subscriptionId: subscriptionId,
    managementGroup: managementGroup,
    allowedLocations: allowedLocations,
    enforcementMode: enforcementModeOff,
};
exports.PoliciyTypes = [exports.policyEnabled, exports.policyNotEnabled];
//# sourceMappingURL=TestData.js.map