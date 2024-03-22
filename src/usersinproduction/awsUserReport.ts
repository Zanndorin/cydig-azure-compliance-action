import {
  IAMClient,
  GenerateCredentialReportCommand,
  GetCredentialReportCommand,
  ReportStateType, GenerateCredentialReportCommandOutput
} from '@aws-sdk/client-iam';  //TODO: Fix credential input fromEnv eller vad?
import { fromIni } from '@aws-sdk/credential-providers';

export class AwsUsersInProduction {

  static async getUserReport() {
    const justWriteCompleteMan = ReportStateType.COMPLETE //OM jag int egör så så är typen undefined av någon anledning
    const started = ReportStateType.STARTED
    const inprog = ReportStateType.INPROGRESS

    try {
      let resp
      const client: IAMClient = new IAMClient({credentials: fromIni({profile: 'cydig'}), region: "eu-north-1"}); //TODO: Credential
      const genCommand = new GenerateCredentialReportCommand()
      let genRespone: GenerateCredentialReportCommandOutput = await client.send(genCommand)
      // if (genRespone.State == started || inprog){
      if (false) {
        // wait -> build function with promise
        // Alternativ2: Kör en sleep 60sec och kör igen ;)
        // await client.send(genCommand)
      }
      else if (genRespone.State === ReportStateType.COMPLETE) {
        const getCommand = new GetCredentialReportCommand();
        resp = await client.send(getCommand)
        const decoder = new TextDecoder('utf-8')
        let t = decoder.decode(resp.Content)
        let p = parseIAMCredentialReport(t)
        console.log(p[2]) // Så vad vill vi ha här? Längd-1? Antalet personer med passwords?
      } else {
        console.log("It broke")
      }
    } catch (err) {
      console.log("ERROR")
      console.error(err)
    }
  }
}
// Se vilka (read)write/admin policies


// Borde detta ligga inne i klassen?
function parseIAMCredentialReport(content: string): any[] {
  const rows = content.trim().split('\n').map(row => row.split(','));
  const headers = rows[0];
  const parsedData = [];

  for (let i = 1; i < rows.length; i++) {
    const obj: any = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    parsedData.push(obj);
  }

  return parsedData;
}