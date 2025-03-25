import type React from "react";
import { useState, useEffect } from "react";
import {
  X,
  Loader,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validatePassword, validateEmail } from "../utils/validation";
import { signUp, signIn, checkUsername } from "../utils/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initAuth: () => Promise<void>;
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initAuth,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  useEffect(() => {
    if (successMessage && !isSignUp) {
      const timer = window.setTimeout(async () => {
        await initAuth();
        onAuthSuccess({ email, token: localStorage.getItem("authToken") });
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, isSignUp, onAuthSuccess, onClose, email, initAuth]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setError(null);
    setSuccessMessage(null);
    setVerificationSent(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleAuthError = (error: any) => {
    let errorMessage = "Authentication failed";
    if (error.message) {
      errorMessage = error.message;
    }
    setError(errorMessage);
    if (!isSignUp) {
      setAttempts((prev) => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!username.trim()) {
          throw new Error("Username is required");
        }
        if (username.length < 3) {
          throw new Error("Username must be at least 3 characters long");
        }

        const { exists } = await checkUsername(username);
        if (exists) {
          throw new Error("Username already taken");
        }

        const userData = await signUp(email, password, username);
        setSuccessMessage("Account created successfully!");
        setVerificationSent(true);
      } else {
        if (attempts >= 4) {
          setIsLocked(true);
          setLockTimer(300);
          throw new Error("Too many failed attempts. Try again in 5 minutes.");
        }

        const userData = await signIn(email, password);

        if (userData.token) {
          localStorage.setItem("authToken", userData.token);
          localStorage.setItem("userId", userData.user?._id);

          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("lastEmail", email);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("lastEmail");
          }

          setAttempts(0);
          setSuccessMessage("Login successful");
        } else {
          throw new Error("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("rememberMe") === "true") {
      const savedEmail = localStorage.getItem("lastEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden"
          >
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              {successMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="mb-4 flex justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {isSignUp ? "Verify your email" : "Welcome Back!"}
                  </h3>
                  {isSignUp && verificationSent ? (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        We've sent a verification link to
                      </p>
                      <p className="font-medium text-gray-800">{email}</p>
                      <p className="text-gray-600 mt-2">
                        Please check your inbox and click the link to verify
                        your account.
                      </p>
                      <button
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
                        onClick={() => {
                          // Add resend verification logic here
                          console.log("Resend verification");
                        }}
                      >
                        Didn't receive the email? Click here to resend
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600">{successMessage}</p>
                  )}
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}

                  {isLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                    >
                      <p className="text-sm text-yellow-700">
                        Account locked. Try again in {Math.ceil(lockTimer / 60)}{" "}
                        minutes.
                      </p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <label
                          htmlFor="username"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Username
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="username"
                            type="text"
                            required
                            minLength={3}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Choose a username"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email address
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder={
                            isSignUp
                              ? "Create a password"
                              : "Enter your password"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {isSignUp && (
                        <p className="mt-1 text-xs text-gray-500">
                          Password must be at least 8 characters long and
                          include a number
                        </p>
                      )}
                    </div>

                    {isSignUp && (
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirm Password
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Confirm your password"
                          />
                        </div>
                      </div>
                    )}

                    {!isSignUp && (
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="remember-me"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Remember me
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || isLocked}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : isSignUp ? (
                        "Sign Up"
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  <div className="mt-4 flex items-center justify-center">
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setSuccessMessage(null);
                        resetForm();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-200"
                    >
                      {isSignUp
                        ? "Already have an account?"
                        : "Don't have an account?"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
