"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLocationAllowed = void 0;
const allowedLocations = [
    'europe',
    'northeurope',
    'westeurope',
    'swedencentral',
    'france',
    'francecentral',
    'francesouth',
    'germany',
    'germanynorth',
    'germanywest',
    'germanywestcentral',
    'norway',
    'norwayeast',
    'norwaywest',
];
function isLocationAllowed(location) {
    if (location === undefined || location === null || location.length === 0) {
        throw Error('Locations must contain values');
    }
    return location.every((location) => allowedLocations.includes(location));
}
exports.isLocationAllowed = isLocationAllowed;
//# sourceMappingURL=AllowedLocations.js.map