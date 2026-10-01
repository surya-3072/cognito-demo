# AWS Cognito Demo

This project is a React + Vite authentication demo built around Amazon Cognito. It demonstrates a real-world user authentication flow for a single-page application, including user sign-up, sign-in, password reset, Google social login, and MFA setup.

The project is designed to match a typical AWS Cognito setup where a user pool, app client, and external identity provider are created and connected to a frontend login experience.

## Features

- Email/password login and sign-up
- Email verification with confirmation code
- Forgot password and reset password workflow
- Google login through Cognito social identity provider
- TOTP MFA setup using QR code generation
- MFA verification during sign-in
- User session check and logout
- Easy integration with AWS Cognito configuration variables

## Screenshots

### Login page

![AWS Cognito Demo login page](./screenshots/Screenshot%202026-10-01%20122004.png)

### Cognito app client configuration

![AWS Cognito app client setup](./screenshots/Screenshot%202026-10-01%20121827.png)

### User pool overview

![AWS Cognito user pool overview](./screenshots/Screenshot%202026-10-01%20121841.png)

### Social identity provider setup

![Google identity provider in Cognito](./screenshots/Screenshot%202026-10-01%20121816.png)

## Tech Stack

- React
- Vite
- AWS Amplify Auth
- JavaScript / JSX
- QRCode generation for MFA setup

## Prerequisites

Before running the app, ensure you have:

- Node.js 18+
- npm or yarn
- An AWS Cognito User Pool configured
- An App Client created for the frontend
- Optional: Google OAuth configuration in Cognito for social login

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root of the project and add your Cognito values:

```env
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_USER_POOL_CLIENT_ID=your_user_pool_client_id
VITE_COGNITO_OAUTH_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
```

These variables are loaded by [amplify-config.js](amplify-config.js) and used to configure AWS Amplify.

## Run the application

```bash
npm run dev
```

Then open the local URL displayed in the terminal, usually:

```text
http://localhost:5173/
```

## Production build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```text
.
├── app.jsx              # Authentication UI and Cognito logic
├── app.css              # Styling for login page and app layout
├── amplify-config.js    # AWS Cognito configuration
├── main.jsx             # React app bootstrap and Amplify setup
├── index.html           # Vite entry file
├── package.json         # Scripts and project dependencies
├── screenshots/         # UI and AWS console screenshots
├── .env                 # Local environment variables
├── README.md            # Project documentation
├── .gitignore           # Git ignore rules
└── dist/                # Production build output
```

## AWS Cognito Setup Overview

This demo maps closely to a typical Cognito setup:

1. Create a user pool for authentication.
2. Create an app client for the frontend web app.
3. Configure sign-in methods such as email/password and Google.
4. Add a social identity provider for Google login.
5. Map user pool attributes such as email, name, and username.
6. Enable MFA where required for additional security.

## Notes

- The app uses the `aws-amplify/auth` package for sign-up, sign-in, MFA, and password reset flows.
- TOTP setup generates a QR code from the Cognito shared secret.
- Google login is triggered using the OAuth redirect flow.
- The app prints token-related information to the browser console when the token inspection action is used.

## License

This project is intended for educational and demonstration purposes related to AWS Cognito authentication.
