import {S3Event, S3Handler} from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import {SQS} from 'aws-sdk';
import csv from 'csv-parser';
import util from 'util';
import stream from 'stream';

import {AWS_REGION, BUCKET_NAME, SOURCE_DIR, TARGET_DIR} from '../constants';

const region = {region: AWS_REGION};

export const importFileParser = async (event: S3Event) => {
  const sqs = new AWS.SQS(region);
  const s3 = new AWS.S3(region);
  const pipeline = util.promisify(stream.pipeline);

  console.log('RECEIVED RECORDS: ', event.Records);

  for (const record of event.Records) {
    try {
      const s3Stream = s3.getObject({
        Bucket: BUCKET_NAME,
        Key: record.s3.object.key
      }).createReadStream();

      await pipeline(
        s3Stream,
        csv({
          // cast numeric values to Number
          mapValues: ({value}) => isNaN(value) ? value : Number(value)
        }),
        new PassToSQS(sqs)
      );

      const targetKey = record.s3.object.key.replace(SOURCE_DIR, TARGET_DIR);
      console.log(`START MOVING FROM: ${BUCKET_NAME}/${record.s3.object.key}`);

      await s3.copyObject({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${record.s3.object.key}`,
        Key: targetKey
      }).promise();

      await s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: record.s3.object.key
      }).promise();

      console.log(`FILE MOVED TO: ${BUCKET_NAME}/${targetKey}`);
    } catch (e) {

      console.log(e);

    }
  }

  // S3Handler does not have any specific response: 'void | Promise<void>' only
  return;
};

class PassToSQS extends stream.Transform {
  sqs: SQS;

  constructor(sqs: SQS) {
    super({objectMode: true});

    this.sqs = sqs;
  }

  _transform(row, _enc, callback) {
    console.log('PROCESSING ROW: ', row);

    this.sqs.sendMessage({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(row)
    }, (err) => {
      if (err) {
        console.log('ERR: ', err);
        return callback(err);
      }

      console.log(`${row.title} is sent to SQS queue`);

      return callback(null, row);
    });

    return callback(null, row);
  }
}

export const importFileParserHandler: S3Handler = async event => {
  return importFileParser(event);
};
