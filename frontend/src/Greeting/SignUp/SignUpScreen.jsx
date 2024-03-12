import React from 'react';
import { useForm } from 'react-hook-form';
import './SignUpScreen.css'; // Import the CSS file
import { Modal } from "@mui/material";

export default function SignUpForm({isOpen, onClose, darkMode}) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm();
  const onSubmit = data => console.log(data);

  //Check if passwords match
  const validatePasswordMatch = value => {
    const { password, confirmPassword } = getValues();
    return password === confirmPassword || "Passwords do not match";
  };
  
  return (
      <Modal open={isOpen} onClose={onClose}>
        <div className={darkMode ? 'dark-mode' : ''}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="text" placeholder="First name" {...register("firstName", { required: true, maxLength: 80 })} />
            {errors.firstName && <span>First name is required</span>}

            <input type="text" placeholder="Last name" {...register("lastName", { required: true, maxLength: 100 })} />
            {errors.lastName && <span>Last name is required</span>}

            <input type="text" placeholder="Email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
            {errors.email && <span>Enter a valid email address</span>}
            
            <input type="password" placeholder="Password" {...register("password", { required: true })} />
            {errors.password && <span>Password is required</span>}

            <input type="password" placeholder="Re-enter Password" {...register("confirmPassword", { required: true, validate: validatePasswordMatch })} />
            {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

            <input type="tel" placeholder="Mobile number" {...register("mobileNumber", { required: true, minLength: 10, maxLength: 10 })} />
            {errors.mobileNumber && <span>Enter a valid 10-digit mobile number</span>}

            <select {...register("title", { required: true })}>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Miss">Miss</option>
              <option value="Dr">Dr</option>
            </select>
            {errors.title && <span>Title is required</span>}
            <div className='radioButtonGroup'>
              <input {...register("registrationType", { required: true })} type="radio" value="Student" name="registrationType" />Student
              <input {...register("registrationType", { required: true })} type="radio" value="Instructor" name="registrationType" />Instructor
            </div>
            {errors.registrationType && <span>Please select registration type</span>}
            <input type="submit" />
          </form>
        </div>
      </Modal>
  );
}
