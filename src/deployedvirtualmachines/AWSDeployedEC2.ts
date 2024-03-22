import {
  DescribeInstancesCommand,
  DescribeRegionsCommand,
  EC2Client,
  Instance,
  Reservation,
} from '@aws-sdk/client-ec2';
import { fromIni } from '@aws-sdk/credential-providers'; //TODO: Fix credential input fromEnv eller vad?

type regionInstance = [string, number];
export class AWSDeployedEC2 {
  static async getDeployedEC2s() {
    const client: EC2Client = new EC2Client({credentials: fromIni({profile: 'azure'}), region: "eu-north-1"}); //TODO: Credential
    const rI: regionInstance[] = [];
    const iL: Instance[] = [];
    try {
      const { Regions } = await client.send(new DescribeRegionsCommand({})); //TODO: Probably needs better region handling
      const command: DescribeInstancesCommand = new DescribeInstancesCommand();
      let length: number = 0;
      if (Regions) {
        for (const region of Regions) {
          const regionClient: EC2Client = new EC2Client({credentials: fromIni({profile: 'azure'}), region: region.RegionName });
          const { Reservations } = await regionClient.send(command);
          if(!Reservations) {
            console.log("Bläh TS")
            return
          }
          const instanceList: Instance[] = Reservations.reduce((prev: Instance[], current: Reservation) => {
            return prev.concat(current.Instances || []);}, []);
          rI.push([region.RegionName || "Error", Reservations?.length ?? 0])
          iL.push(...instanceList)
          // console.log("Region ", region.RegionName)
          // console.log("Reservations ", Reservations?.length)
          length += Reservations?.length ?? 0;

        }} else {
        console.log("Error no available regions")
        return //todo: return values
      }
      console.log(rI)
      console.log(iL)
      console.log("Det finns alltså: " + length + " instanser")
  } catch (err) {
      console.error(err)
    }
  }
}

