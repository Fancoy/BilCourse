import React from 'react';
import { useForm } from 'react-hook-form';
import './LoginScreen.css'; // Import the CSS file
import { Modal, Box } from "@mui/material";

export default function LogInForm({isOpen, onClose, darkMode}) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);
  
  return (
    <Modal 
    open={isOpen} 
    onClose={onClose} 
    >
      <Box>
        <div className={darkMode ? 'dark-mode' : ''}>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" placeholder="Email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
          {errors.email && <span>Enter a valid email address</span>}

          <input type="password" placeholder="password" {...register} />
          {errors.password && <span>Password is required</span>}
          <input type="submit" />
        </form>
      </div>
      </Box>
  </Modal>
  );
}
