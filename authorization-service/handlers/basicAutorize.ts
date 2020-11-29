import {APIGatewayAuthorizerEvent, APIGatewayAuthorizerHandler, APIGatewayAuthorizerResult} from 'aws-lambda';
import {PASSWORD, USERNAME} from '../config';

export const basicAuthorize = async (event: APIGatewayAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('event: ', event);

  if (event.type !== 'TOKEN') {
    return Promise.reject('Unauthorized');
  }

  try {
    const resource = event.methodArn;

    const {authorizationToken} = event;

    const [authType, encodedCreds] = authorizationToken.split(' ');

    if (authType !== 'Basic') {
      return Promise.reject('Unauthorized');
    }

    const [username, password] = Buffer.from(encodedCreds, 'base64')
      .toString('utf-8')
      .split(':');

    let effect = 'Allow';

    if (
      username !== USERNAME ||
      password !== PASSWORD
    ) {
      effect = 'Deny';
    }

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
