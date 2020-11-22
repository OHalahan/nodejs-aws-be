import * as AWS from 'aws-sdk';
import {AWSError, SNS} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';

export async function sendEmail(message: string, minPrice: number): Promise<PromiseResult<SNS.PublishResponse, AWSError>> {
  const sns = new AWS.SNS({region: 'eu-west-1'});

  return sns.publish({
    Subject: `New Product(s) uploaded to the catalog!`,
    Message: message,
    TopicArn: process.env.SNS_TOPIC_ARN,
    MessageAttributes: {
      minPrice: {
        DataType: 'Number',
        StringValue: String(minPrice)
      }
    }
  }).promise();
}
