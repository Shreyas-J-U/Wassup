import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  // Controls whether user is on "Sign up" or "Login"
  const [currentState, setCurrentState] = useState("Sign up");

  // Controls whether user has submitted the initial form
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Input states
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auth function from context (e.g., will handle login/signup logic)
  const { login } = useContext(AuthContext);

  /**
   * Handles the first step submission:
   * - If user is logging in → perform login immediately
   * - If user is signing up → move to bio input step
   */
  const handleInitialSubmit = (e) => {
    e.preventDefault();

    if (currentState === "Sign up") {
      // Go to next step (bio input)
      setIsSubmitted(true);
    } else {
      // Login logic
      // console.log("Logging in with:", { email, password });
      login("login", { email, password }); // Only login here
      setIsSubmitted(true); // Could show success or redirect
    }
  };

  /**
   * Handles the final step of the sign-up process (bio input).
   * Submits full user data for account creation.
   */
  const handleBioSubmit = (e) => {
    e.preventDefault();

    const userData = { fullName, email, password, bio };
    // console.log("Signing up with:", userData);
    login("signup", userData); // Signup now that all fields are collected

    alert("Signup complete!");
    resetForm(); // Reset and switch to login view
  };

  /**
   * Resets form fields and toggles form type (login <→ signup)
   */
  const resetForm = () => {
    setCurrentState((prev) => (prev === "Sign up" ? "Login" : "Sign up"));
    setIsSubmitted(false);
    setFullName("");
    setBio("");
    setEmail("");
    setPassword("");
  };

  /**
   * Go back from bio step to previous signup form
   */
  const backToForm = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl px-4">
      {/* ---------- Left Side (Logo) ---------- */}
      <img src={assets.logo_big} alt="Logo" className="w-[min(30vh,250px)]" />

      {/* ---------- Right Side (Form Container) ---------- */}
      <div className="border-2 bg-white/8 border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg text-white w-full max-w-sm relative">
        {/* ---------- Header ---------- */}
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-2xl">{currentState}</h2>

          {/* Back arrow shown only on bio input screen (sign up step 2) */}
          {currentState === "Sign up" && isSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="Back"
              className="w-5 cursor-pointer"
              title="Back to Sign up form"
              onClick={backToForm}
            />
          )}
        </div>

        {/* ---------- BIO INPUT SCREEN (Sign up step 2) ---------- */}
        {currentState === "Sign up" && isSubmitted ? (
          <form onSubmit={handleBioSubmit} className="flex flex-col gap-4">
            {/* Bio textarea */}
            <textarea
              rows="4"
              placeholder="Provide a short Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-transparent border border-gray-400 rounded p-2 text-sm outline-none placeholder-white resize-none"
              required
            />

            {/* Final Sign up button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-400 to-violet-600 text-white py-2 rounded-full font-medium hover:opacity-90"
            >
              Finish Sign Up
            </button>
          </form>
        ) : (
          // ---------- LOGIN or SIGN UP FORM (step 1) ----------
          <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
            {/* Full name (Sign up only) */}
            {currentState === "Sign up" && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-transparent border border-gray-400 rounded p-2 text-sm outline-none placeholder-white"
                required
              />
            )}

            {/* Email input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-gray-400 rounded p-2 text-sm outline-none placeholder-white"
              required
            />

            {/* Password input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border border-gray-400 rounded p-2 text-sm outline-none placeholder-white"
              required
            />

            {/* Submit button (Continue → or Login Now) */}
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-400 to-violet-600 text-white py-2 rounded-full font-medium hover:opacity-90"
            >
              {currentState === "Sign up" ? "Continue" : "Login Now"}
            </button>

            {/* Terms checkbox (Sign up only) */}
            {currentState === "Sign up" && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" required />
                <p>Agree to terms & privacy policy</p>
              </div>
            )}

            {/* Toggle link: switch between Login and Sign up */}
            <div className="text-sm text-gray-300 text-center mt-2">
              {currentState === "Sign up" ? (
                <p>
                  Already have an account?{" "}
                  <span
                    onClick={resetForm}
                    className="text-violet-500 font-medium cursor-pointer"
                  >
                    Login here
                  </span>
                </p>
              ) : (
                <p>
                  Don’t have an account?{" "}
                  <span
                    onClick={resetForm}
                    className="text-violet-500 font-medium cursor-pointer"
                  >
                    Sign up here
                  </span>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
