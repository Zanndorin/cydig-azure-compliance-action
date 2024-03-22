import { fromIni } from "@aws-sdk/credential-providers"
import { GetFindingsCommand, SecurityHubClient, GetFindingsCommandOutput, AwsSecurityFinding, ComplianceStatus
} from '@aws-sdk/client-securityhub';


//  const input = {
//   "Filters": {
//     "AwsAccountId": [
//       {
//         "Comparison": "PREFIX",
//         "Value": "123456789012"
//Enda stället som tar accountID?

export class AWSSecureScore {
  static async getScore() {
    try {
      let findings: AwsSecurityFinding[] = []
      const client: SecurityHubClient = new SecurityHubClient({credentials: fromIni({profile: 'cydig'}), region: "eu-north-1"}); //TODO: Credential
      const genCommand = new GetFindingsCommand()
      let f = await client.send(genCommand)
      while (f.NextToken) {
        if (f.Findings) {
          findings.push(...f.Findings)
        }
        let cmd = new GetFindingsCommand({NextToken: f.NextToken})
        f = await client.send(cmd)
      }
        //Jag är okapabel i Typescript...
        // let b = findings.reduce((acc, current) => {
          // let test = current.Compliance?.SecurityControlId ?? 'test';
          // if (current.Compliance && current.Compliance.SecurityControlId && !acc[current?.Compliance?.SecurityControlId ?? 'test']) {
          //   acc[current.Compliance.SecurityControlId] = current;
          // }
          // return acc;

        // console.log(f.Findings[0].Compliance)
        // console.log("H")
        // f.Findings[0].Compliance.Status
        // f.Findings[0].Compliance.Status
        // f.Findings[0].Severity.Label .Original
        // f.Findings[0].LastObservedAt
        // f.Findings[0].Workflow.Status
      const pass: number = findings.filter(item => item.Compliance && item.Compliance.Status === 'PASSED').length
      const total: number = findings.length
      const score: number = pass/total
      console.log("Score: " + score*100)
      console.log("pass " + pass + " total " + total)
    } catch(err) {
      console.log("ho")
    }
  }

}