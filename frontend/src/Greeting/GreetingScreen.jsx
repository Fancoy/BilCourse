import React, { useState } from 'react';
import SignUpForm from './SignUp/SignUpScreen';
import Button from '@mui/material/Button';
import LogInForm from './LogIn/LoginScreen';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

function GreetingScreen() {
  const [isSignUpFormOpen, setIsSignUpFormOpen] = useState(false);
  const [isLogInFormOpen, setIsLogInFormOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // State to track dark mode

  const handleOpenSignUpForm = () => {
    setIsSignUpFormOpen(true);
  }

  const handleCloseSignUpForm = () => {
    setIsSignUpFormOpen(false);
  }

  const handleOpenLogInUpForm = () => {
    setIsLogInFormOpen(true);
  }

  const handleCloseLogInForm = () => {
    setIsLogInFormOpen(false);
  }

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={darkMode ? 'dark-mode' : ''}> {/* Apply dark mode class */}
      {/* Button to toggle dark mode */}
      <button onClick={toggleDarkMode}>
        {darkMode ? <DarkModeOutlinedIcon /> : <DarkModeIcon />}
      </button>

      {/* Buttons for sign-up and login */}
      <div className="button-container">
        <Button
          variant="outlined"
          className="sign-up-button"
          onClick={handleOpenSignUpForm}
        >
          Create an Account
        </Button>
        <Button
          variant="outlined"
          className="sign-up-button"
          onClick={handleOpenLogInUpForm}
        >
          Log In
        </Button>
      </div>

      {/* Render the login and signup forms */}
      <LogInForm isOpen={isLogInFormOpen} onClose={handleCloseLogInForm} darkMode={darkMode} />
      <SignUpForm isOpen={isSignUpFormOpen} onClose={handleCloseSignUpForm} darkMode={darkMode} />
    </div>
  );
}

export default GreetingScreen;
