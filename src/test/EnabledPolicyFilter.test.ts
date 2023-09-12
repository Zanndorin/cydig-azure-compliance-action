import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { enabledPolicyFilter } from '../allowedlocation/lib/EnabledPolicyFilter';
import { InfoPolicyType } from '../allowedlocation/lib/types/InfoPolicyType';
import * as testData from './TestData';

chai.use(sinonChai);

describe('Allowed Location Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should only returned enabled policies', () => {
    const enabledPolicies: InfoPolicyType[] = enabledPolicyFilter(testData.PoliciyTypes);
    expect(enabledPolicies.every((x) => x.enforcementMode == 'Enabled')).equal(true);
  });

  it('Should not returned disabled policies', () =>
    expect(function () {
      const enabledPolicies: InfoPolicyType[] = enabledPolicyFilter(testData.PoliciyTypes);
      expect(enabledPolicies.some((x) => x.enforcementMode == 'DoNotEnforce')).equal(false);
    }));
});
