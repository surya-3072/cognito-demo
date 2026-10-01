import { useEffect, useState } from "react";

import {
  signUp,
  confirmSignUp,
  signIn,
  signInWithRedirect,
  confirmSignIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import QRCode from "qrcode";

function App() {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [username, setUsername] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [mfaMode, setMfaMode] = useState("setup");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();

    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email: email,
            name: name,
          },
        },
      });

      console.log(result);

      setMessage(
        "Account created. Check your email for the verification code."
      );

      setMode("confirm");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleConfirmSignUp(e) {
    e.preventDefault();

    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      setMessage("Email verified successfully. You can now login.");

      setMode("login");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const result = await signIn({
        username: email,
        password,
      });

      console.log(result);

      if (result.isSignedIn) {
        await checkUser();
        setMessage("Login successful!");
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        setMode("mfa-login");
        setMessage("Enter the 6-digit code from your authenticator app.");
      } else {
        setMessage("Additional authentication step required.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithRedirect({
        provider: "Google",
      });
    } catch (error) {
      console.error("Google login failed:", error);
    }
  }

  async function handleLogout() {
    try {
      await signOut();

      setUser(null);
      setMessage("Logged out successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function showTokens() {
    try {
      const session = await fetchAuthSession();

      console.log("ID Token:", session.tokens?.idToken?.toString());
      console.log(
        "Access Token:",
        session.tokens?.accessToken?.toString()
      );

      setMessage("Tokens printed in browser console.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleConfirmMfaLogin(e) {
    e.preventDefault();

    try {
      const result = await confirmSignIn({
        challengeResponse: mfaCode,
      });

      if (result.isSignedIn) {
        await checkUser();
        setMfaCode("");
        setMessage("Login successful!");
      } else {
        setMessage("Additional authentication step required.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleStartMfaSetup() {
    try {
      const { sharedSecret } = await setUpTOTP();
      const account = encodeURIComponent(email || user?.username || "account");
      const issuer = encodeURIComponent("Cognito Demo");
      const uri = `otpauth://totp/${issuer}:${account}?secret=${sharedSecret}&issuer=${issuer}`;

      setMfaSecret(sharedSecret);
      setQrCode(await QRCode.toDataURL(uri));
      setMfaMode("verify");
      setMessage("Scan the QR code, then enter the 6-digit code.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleVerifyMfaSetup(e) {
    e.preventDefault();

    try {
      await verifyTOTPSetup({ code: mfaCode });
      await updateMFAPreference({ totp: "ENABLED" });
      setMfaCode("");
      setMfaMode("enabled");
      setMessage("MFA is enabled for your account.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();

    try {
      await resetPassword({
        username: email,
      });

      setMessage("Password reset code sent to your email.");

      setMode("reset-confirm");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });

      setMessage("Password reset successfully.");

      setMode("login");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (user) {
    if (mode === "mfa-setup") {
      return (
        <div className="container">
          <div className="card">
            <h1>Account Security</h1>

            {mfaMode === "setup" && (
              <>
                <p>Protect your account with an authenticator app.</p>
                <button onClick={handleStartMfaSetup}>Enable MFA</button>
              </>
            )}

            {mfaMode === "verify" && (
              <form onSubmit={handleVerifyMfaSetup}>
                <h2>Set Up Authenticator</h2>
                {qrCode && <img className="qr-code" src={qrCode} alt="MFA setup QR code" />}
                <p>Scan this code with Google Authenticator or another TOTP app.</p>
                <p className="secret-key">Manual key: {mfaSecret}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="6-digit code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                />
                <button type="submit">Verify and Enable</button>
              </form>
            )}

            {mfaMode === "enabled" && (
              <div className="success">
                <h2>MFA Enabled</h2>
                <p>Your authenticator app is now required when you sign in.</p>
              </div>
            )}

            <button className="link-button" onClick={() => setMode("account")}>
              Back to account
            </button>
            <p className="message">{message}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="card">
          <h1>Cognito Demo</h1>

          <div className="success">
            <h2>Welcome!</h2>

            <p>
              <strong>Username:</strong> {user.username}
            </p>

            <p>
              <strong>User ID:</strong>{" "}
              {user.userId}
            </p>
          </div>

          <button onClick={showTokens}>
            View JWT Tokens
          </button>

          <button onClick={() => setMode("mfa-setup")}>
            Security / MFA
          </button>

          <button
            className="logout"
            onClick={handleLogout}
          >
            Logout
          </button>

          <p className="message">{message}</p>
        </div>
      </div>
    );
  }

  if (mode === "mfa-login") {
    return (
      <div className="container">
        <div className="card">
          <h1>Two-Step Verification</h1>
          <form onSubmit={handleConfirmMfaLogin}>
            <p>Enter the 6-digit code from your authenticator app.</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength="6"
              placeholder="6-digit code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
            <button type="submit">Verify Code</button>
          </form>
          <p className="message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>AWS Cognito Demo</h1>

        <div className="tabs">
          <button onClick={() => setMode("login")}>
            Login
          </button>

          <button onClick={() => setMode("signup")}>
            Sign Up
          </button>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Login
            </button>

            <button type="button" onClick={handleGoogleLogin}>
              Continue with Google
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => setMode("forgot")}
            >
              Forgot Password?
            </button>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignUp}>
            <h2>Create Account</h2>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Sign Up
            </button>
          </form>
        )}

        {mode === "confirm" && (
          <form onSubmit={handleConfirmSignUp}>
            <h2>Verify Email</h2>

            <p>
              Enter the verification code sent
              to your email.
            </p>

            <input
              type="text"
              placeholder="Verification Code"
              value={confirmationCode}
              onChange={(e) =>
                setConfirmationCode(e.target.value)
              }
              required
            />

            <button type="submit">
              Verify Email
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <h2>Forgot Password</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <button type="submit">
              Send Reset Code
            </button>
          </form>
        )}

        {mode === "reset-confirm" && (
          <form onSubmit={handleResetPassword}>
            <h2>Reset Password</h2>

            <input
              type="text"
              placeholder="Verification Code"
              value={confirmationCode}
              onChange={(e) =>
                setConfirmationCode(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Reset Password
            </button>
          </form>
        )}

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;