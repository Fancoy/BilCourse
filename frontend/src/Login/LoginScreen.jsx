import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './LoginScreen.css'; // Import the CSS file
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

export default function LoginForm() {
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
        <input type="text" placeholder="First name" {...register("First name", {required: true, maxLength: 80})} />
        <input type="text" placeholder="Last name" {...register("Last name", {required: true, maxLength: 100})} />
        <input type="text" placeholder="Email" {...register("Email", {required: true, pattern: /^\S+@\S+$/i})} />
        <input type="tel" placeholder="Mobile number" {...register("Mobile number", {required: true, minLength: 10, maxLength: 10})} />
        <select {...register("Title", { required: true })}>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Miss">Miss</option>
          <option value="Dr">Dr</option>
        </select>

        <input {...register("Developer", { required: true })} type="radio" value="Yes" />
        <input {...register("Developer", { required: true })} type="radio" value="No" />

        <input type="submit" />
      </form>
    </div>
  );
}
