const allowedLocations: string[] = [
  'europe',
  'northeurope',
  'westeurope',
  'swedencentral',
  "sweden",
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
  let policyValid: boolean = true
  for (let index: number = 0; index < location.length; index++) {
    if(!allowedLocations.includes(location[index])) {
      console.log(`${location[index]} is not in the list of allowed locations. Contact the CyDig team if the location is in Europe`)
      policyValid = false
    }
  }
  return policyValid
}
