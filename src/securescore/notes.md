
SecurityAdvisor kan inte hämta alla regioner utan endast 1 region åt gången.

aws account list-regions


SecurityHub kan vara avstängd

aws securityhub get-enabled-standards --profile azure  


aws iam generate-credential-report --profile azure

aws iam get-credential-report --profile azure     

| User          | ARN                                      | User Creation Time        | Password Enabled | Password Last Used | Password Last Changed | Password Next Rotation | MFA Active | Access Key 1 Active | Access Key 1 Last Rotated | Access Key 1 Last Used Date | Access Key 1 Last Used Region | Access Key 1 Last Used Service | Access Key 2 Active | Access Key 2 Last Rotated | Access Key 2 Last Used Date | Access Key 2 Last Used Region | Access Key 2 Last Used Service | Cert 1 Active | Cert 1 Last Rotated | Cert 2 Active | Cert 2 Last Rotated |
|---------------|------------------------------------------|---------------------------|------------------|--------------------|-----------------------|------------------------|------------|---------------------|---------------------------|------------------------------|-------------------------------|--------------------------------|---------------------|---------------------------|-----------------------------|--------------------------------|-------------------------------|---------------|----------------------|---------------|----------------------|
| <root_account>  | arn:aws:iam::976259833678:root          | 2019-10-08T06:13:04+00:00 | not_supported    | no_information     | not_supported         | not_supported          | false      | false               | N/A                       | N/A                          | N/A                           | N/A                            | false               | N/A                       | N/A                         | N/A                            | false                         | N/A           | false                | N/A           | false                |
| Maximilian    | arn:aws:iam::976259833678:user/Maximilian | 2019-10-08T06:14:37+00:00 | true             | 2024-03-18T14:36:12+00:00 | 2023-06-22T09:40:36+00:00 | N/A                    | true       | true                | 2019-12-12T13:26:53+00:00  | 2024-03-18T15:17:00+00:00     | us-east-1                     | account                        | true                | 2021-07-05T11:31:54+00:00 | 2021-07-05T11:38:00+00:00   | eu-north-1                     | s3                            | false         | N/A                  | false         | N/A                  |
| stuff         | arn:aws:iam::976259833678:user/stuff     | 2024-03-18T14:40:55+00:00 | false            | N/A                | N/A                   | N/A                    | false      | true                | 2024-03-18T15:02:28+00:00  | 2024-03-18T15:17:00+00:00     | us-east-1                     | account                        | false               | N/A                       | N/A                         | N/A                            | N/A                           | false         | N/A                  | false         | N/A                  |
| ZanndoDev1    | arn:aws:iam::976259833678:user/ZanndoDev1 | 2020-06-28T13:24:38+00:00 | false            | 2020-06-30T06:38:24+00:00 | N/A                   | N/A                    | false      | false               | N/A                       | N/A                          | N/A                           | N/A                            | false               | N/A                       | N/A                         | N/A                            | N/A                           | false         | N/A                  | false         | N/A                  |


aws ec2 describe-instances --profile azure
aws ec2 describe-instances --region eu-north-1 --profile azure

