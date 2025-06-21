import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.scss";

const Login = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!data.identifier)
      newErrors.identifier = "Username or email is required";
    if (!data.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log(data);
  };

  return (
    <div className='login d-flex-center'>
      <div className='wrapper'>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <input
              type='text'
              placeholder='Username or Email'
              name='identifier'
              value={data.identifier}
              onChange={handleChange}
              className={errors.identifier ? "error" : ""}
            />
            {errors.identifier && (
              <span className='error-text'>{errors.identifier}</span>
            )}
          </div>
          <div className='form-group'>
            <input
              type='password'
              placeholder='Password'
              name='password'
              value={data.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <span className='error-text'>{errors.password}</span>
            )}
          </div>
          <button type='submit' className='btn-primary'>
            Sign In
          </button>
          <p className='signup-link'>
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
