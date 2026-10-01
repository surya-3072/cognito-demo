const {
  VITE_COGNITO_USER_POOL_ID,
  VITE_COGNITO_USER_POOL_CLIENT_ID,
  VITE_COGNITO_OAUTH_DOMAIN,
} = import.meta.env;

const cognitoAuth =
  VITE_COGNITO_USER_POOL_ID && VITE_COGNITO_USER_POOL_CLIENT_ID
    ? {
        userPoolId: VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: VITE_COGNITO_USER_POOL_CLIENT_ID,
        ...(VITE_COGNITO_OAUTH_DOMAIN
          ? {
              loginWith: {
                oauth: {
                  domain: VITE_COGNITO_OAUTH_DOMAIN,
                  scopes: ["openid", "email"],
                  redirectSignIn: ["http://localhost:5173/"],
                  redirectSignOut: ["http://localhost:5173/"],
                  responseType: "code",
                },
              },
            }
          : {}),
      }
    : null;

export const cognitoConfig = cognitoAuth
  ? {
      Auth: {
        Cognito: cognitoAuth,
      },
    }
  : {};
