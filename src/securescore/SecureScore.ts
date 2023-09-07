import { SecurityCenter } from '@azure/arm-security';
import { DefaultAzureCredential } from '@azure/identity';
import * as core from '@actions/core';
export class SecureScore {
  static async getSecureScore(credentials: DefaultAzureCredential, subscriptionId: string): Promise<void> {
    const client: SecurityCenter = new SecurityCenter(credentials, subscriptionId);
    console.log('Getting Azure Secure Score');
    const secureScoreObject = await client.secureScores.get('ascScore');
    if (secureScoreObject?.['percentage']) {
      const secureScorePercent: number = Math.round(secureScoreObject?.['percentage'] * 100);
      console.log(`AZURE SECURE SCORE: ${secureScorePercent}%`);
      core.exportVariable('secureScore', secureScorePercent.toString());
    } else {
      console.log('Something went wrong or no secure score found');
    }
  }
}
