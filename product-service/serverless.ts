import type {Serverless} from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service'
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    snsRegular: String(process.env.SNS_REGULAR),
    snsSuspected: String(process.env.SNS_SUSPECTED)
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-dotenv-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE: process.env.PG_DATABASE,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
      SNS_TOPIC_ARN: {
        Ref: 'SNSTopic'
      }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:Publish'],
        Resource: [{Ref: 'SNSTopic'}]
      },
      /**
       * Just to meet task requirements; there is no need in the policy below
       * serverless adds the policy automatically because
       * SQS Queue is configured as an event source for catalogBatchProcess
       */
      {
        Effect: 'Allow',
        Action: ['sqs:DeleteMessage', 'sqs:ReceiveMessage'],
        Resource: [{
          'Fn::GetAtt': ['SQSQueue', 'Arn']
        }]
      }
    ]
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
          ReceiveMessageWaitTimeSeconds: 20
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'oleksandr.halahan@gmail.com',
          Protocol: 'email',
          TopicArn: {Ref: 'SNSTopic'}
        }
      },
      SNSSubscriptionLowPrice: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'nodejsaws.olhal@gmail.com',
          Protocol: 'email',
          TopicArn: {Ref: 'SNSTopic'},
          FilterPolicy: JSON.stringify({
            minPrice: [{numeric: ['<=', 20000]}]
          })
        }
      }
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: 'SQSQueue'
        }
      },
      SQSQueueArn: {
        Value: {
          'Fn::GetAtt': ['SQSQueue', 'Arn']
        }
      }
    }
  },
  functions: {
    getProductsList: {
      handler: 'handler.getProductsListHandler',
      events: [
        {
          http: {
            method: 'get',
            path: '/products',
            cors: true
          }
        }
      ]
    },
    getProductById: {
      handler: 'handler.getProductByIdHandler',
      events: [
        {
          http: {
            method: 'get',
            path: '/products/{id}',
            cors: true
          }
        }
      ]
    },
    createProduct: {
      handler: 'handler.createProductHandler',
      events: [
        {
          http: {
            method: 'post',
            path: 'products'
          }
        }
      ]
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcessHandler',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {'Fn::GetAtt': ['SQSQueue', 'Arn']}
          }
        }
      ]
    }
  }
};

module.exports = serverlessConfiguration;
