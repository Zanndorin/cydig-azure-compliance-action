/* eslint-disable @typescript-eslint/no-explicit-any */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { isLocationAllowed } from '../src/allowedlocation/lib/AllowedLocations';

chai.use(sinonChai);

describe('Allowed Location Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should return true if location is within allowed locations', () => {
    const isEnabled: boolean = isLocationAllowed(['europe']);
    expect(isEnabled).equal(true);
  });
  it('Should throw error if location is empty', () =>
    expect(function () {
      isLocationAllowed([]);
    }).to.throw('Locations must contain values'));
  it('Should throw error if location is undefined', () =>
    expect(function () {
      isLocationAllowed(undefined as any);
    }).to.throw('Locations must contain values'));

  it('Should throw error if location is null', () =>
    expect(function () {
      isLocationAllowed(null as any);
    }).to.throw('Locations must contain values'));
});
