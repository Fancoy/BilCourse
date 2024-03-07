import React, { useState } from 'react';
import SignUpForm from './SignUp/SignUpScreen';
import Button from '@mui/material/Button';
import LogInForm from './LogIn/LoginScreen';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

function GreetingScreen() {
	const [isSignUpFormOpen, setIsSignUpFormOpen] = React.useState(false);
	const [isLogInFormOpen, setIsLogInFormOpen] = React.useState(false);
	const [darkMode, setDarkMode] = React.useState(false); // State to track dark mode

	const handleOpenSignUpForm = () => {
		setIsSignUpFormOpen(true);
	}

	const handleCloseSignUpForm = () => {
		setIsSignUpFormOpen(false);
	}

	const handleOpenLogInUpForm = () => {
		setIsLogInFormOpen(true);
	}

	const handleCloseLogInForm = (event) => {
		setIsLogInFormOpen(false);
	}

	const toggleDarkMode = () => {
		setDarkMode(prevMode => !prevMode);
	};

	return (
		<div>
			<button onClick={toggleDarkMode}>
          		{darkMode ? <DarkModeOutlinedIcon /> : <DarkModeIcon />}
        	</button>
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
				<LogInForm isOpen={isLogInFormOpen} onClose={handleCloseLogInForm} darkMode={darkMode} />
				<SignUpForm isOpen={isSignUpFormOpen} onClose={handleCloseSignUpForm} darkMode={darkMode} />
			</div>
		</div>
	);
}

export default GreetingScreen;
