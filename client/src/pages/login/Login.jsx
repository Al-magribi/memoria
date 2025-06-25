import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.scss";
import { useLoginMutation } from "../../services/api/user/UserApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../services/api/user/UserSlice";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isSuccess, error, data: loginData, isLoading }] =
    useLoginMutation();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await toast.promise(login(data).unwrap(), {
        pending: "Logging in...",
        success: {
          render({ data }) {
            return data?.message || "Logged in successfully!";
          },
        },
        error: {
          render({ data }) {
            console.log(data);
            return data?.data?.message || "Login failed. Please try again.";
          },
        },
      });

      if (result && result.user) {
        dispatch(setUser(result.user));
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isSuccess && loginData) {
      dispatch(setUser(loginData.user));
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  }, [isSuccess, loginData, dispatch, navigate]);

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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            {errors.password && (
              <span className='error-text'>{errors.password}</span>
            )}
          </div>
          <button type='submit' className='btn-primary' disabled={isLoading}>
            {isLoading ? "Logging in..." : "Sign In"}
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
