import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './LogInScreen.css'; // Import the CSS file
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

export default function LogInForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);
  const [darkMode, setDarkMode] = useState(false); // State to track dark mode

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      <button onClick={toggleDarkMode}>
        {darkMode ? <DarkModeOutlinedIcon /> : <DarkModeIcon />}
      </button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
        {errors.email && <span>Enter a valid email address</span>}

        <input type="password" placeholder="password" {...register} />
        {errors.password && <span>Password is required</span>}
        <input type="submit" />
      </form>
    </div>
  );
}
