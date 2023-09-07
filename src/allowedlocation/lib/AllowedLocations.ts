const allowedLocations: string[] = [
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

export function isLocationAllowed(location: string[]): boolean {
  if (location === undefined || location === null || location.length === 0) {
    throw Error('Locations must contain values');
  }
  return location.every((location: string) => allowedLocations.includes(location));
}
