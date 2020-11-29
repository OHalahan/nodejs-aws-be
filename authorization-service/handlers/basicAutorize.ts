import {APIGatewayAuthorizerEvent, APIGatewayAuthorizerHandler, APIGatewayAuthorizerResult} from 'aws-lambda';
import {IMPORT_PASSWORD, IMPORT_USERNAME} from '../config';

export const basicAuthorize = async (event: APIGatewayAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('event: ', event);

  if (event.type !== 'TOKEN') {
    return Promise.reject('Unauthorized');
  }

  try {
    const resource = event.methodArn;

    const {authorizationToken} = event;

    const [authType, encodedCreds] = authorizationToken.split(' ');

    console.log('AUTH TYPE: ', authType);
    console.log('ENCODED CREDENTIALS: ', encodedCreds);

    let effect = 'Allow';
    let username = '';
    let password = '';

    if (authType && encodedCreds) {
      [username, password] = Buffer.from(encodedCreds, 'base64')
        .toString('utf-8')
        .split(':');

      if (
        username !== IMPORT_USERNAME ||
        password !== IMPORT_PASSWORD
      ) {
        effect = 'Deny';
      }
    } else {
      effect = 'Deny';
    }

    console.log('DECODED USERNAME: ', username);
    console.log('DECODED PASSWORD: ', password);

    const policy = generatePolicy(encodedCreds, effect, resource);

    return Promise.resolve(policy);
  } catch (err) {
    console.log('ERROR: ', err);
    return Promise.reject('Unauthorized');
  }
};

function generatePolicy(principalId, effect, resource): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };
}

export const basicAuthorizeHandler: APIGatewayAuthorizerHandler = async (event: APIGatewayAuthorizerEvent) => {
  return basicAuthorize(event);
};
