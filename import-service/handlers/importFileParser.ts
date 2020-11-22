import {S3Event, S3Handler} from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import csv from 'csv-parser';
import util from 'util';
import stream from 'stream';

import {AWS_REGION, BUCKET_NAME, SOURCE_DIR, TARGET_DIR} from '../constants';

export const importFileParser = async (event: S3Event) => {
  const s3 = new AWS.S3({region: AWS_REGION});
  const pipeline = util.promisify(stream.pipeline);

  console.log('RECEIVED RECORDS: ', event.Records);

  for (const record of event.Records) {
    try {
      const s3Stream = s3.getObject({
        Bucket: BUCKET_NAME,
        Key: record.s3.object.key
      }).createReadStream();

      await pipeline(s3Stream, csv(), new LogEachRow());

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

class LogEachRow extends stream.Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(row, _enc, callback) {
    console.log('ROW: ', row);
    callback(null, row);
  }
}

export const importFileParserHandler: S3Handler = async event => {
  return importFileParser(event);
};
