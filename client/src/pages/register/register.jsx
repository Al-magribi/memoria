import { useEffect, useState } from "react";
import "./register.scss";
import { useNavigate } from "react-router-dom";
import { MdExpandMore } from "react-icons/md";
import { useRegisterMutation } from "../../services/api/user/UserApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../services/api/user/UserSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isSignin } = useSelector((state) => state.user);

  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState({});
  const [register, { isSuccess, error, data: registerData, isLoading }] =
    useRegisterMutation();

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Prefer not to say",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!data.username) {
      newErrors.username = "Username is required";
    } else if (data.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(data.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // First name validation
    if (!data.firstName) {
      newErrors.firstName = "First name is required";
    } else if (data.firstName.length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    }

    // Last name validation
    if (!data.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (data.lastName.length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for backend (remove confirmPassword)
    const body = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender,
    };

    try {
      const result = await toast.promise(register(body).unwrap(), {
        pending: "Creating your account...",
        success: {
          render({ data }) {
            return data?.message || "Account created successfully!";
          },
        },
        error: {
          render({ data }) {
            return (
              data?.data?.message || "Registration failed. Please try again."
            );
          },
        },
      });

      // If we reach here, registration was successful
      if (result && result.user) {
        dispatch(setUser(result.user));
        // Navigate to home page after successful registration
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      // Error is already handled by toast.promise
      console.error("Registration error:", error);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle successful registration
  useEffect(() => {
    if (isSuccess && registerData) {
      dispatch(setUser(registerData.user));
      // Navigate to home page after successful registration
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  }, [isSuccess, registerData, dispatch, navigate]);

  useEffect(() => {
    if (isSignin && user?.id) {
      navigate("/");
    }
  }, [isSignin, user, navigate]);

  return (
    <div className='register d-flex-center'>
      <div className='wrapper'>
        <h1>{isMobile ? "Welcome to Memoria" : "Create Account"}</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-row'>
            <div className='form-group'>
              <input
                type='text'
                placeholder='First Name *'
                name='firstName'
                value={data.firstName}
                onChange={handleChange}
                className={errors.firstName ? "error" : ""}
                disabled={isLoading}
              />
              {errors.firstName && (
                <span className='error-text'>{errors.firstName}</span>
              )}
            </div>
            <div className='form-group'>
              <input
                type='text'
                placeholder='Last Name *'
                name='lastName'
                value={data.lastName}
                onChange={handleChange}
                className={errors.lastName ? "error" : ""}
                disabled={isLoading}
              />
              {errors.lastName && (
                <span className='error-text'>{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className='form-group'>
            <input
              type='text'
              placeholder='Username *'
              name='username'
              value={data.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              disabled={isLoading}
            />
            {errors.username && (
              <span className='error-text'>{errors.username}</span>
            )}
          </div>

          <div className='form-group'>
            <input
              type='email'
              placeholder='Email *'
              name='email'
              value={data.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              disabled={isLoading}
            />
            {errors.email && <span className='error-text'>{errors.email}</span>}
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <input
                type='date'
                placeholder='Date of Birth'
                name='dateOfBirth'
                value={data.dateOfBirth}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className='form-group'>
              <div className='select-wrapper'>
                <select
                  name='gender'
                  value={data.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value='Prefer not to say'>Prefer not to say</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
                <MdExpandMore className='select-icon' />
              </div>
            </div>
          </div>

          <div className='form-group'>
            <input
              type='password'
              placeholder='Password *'
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

          <div className='form-group'>
            <input
              type='password'
              placeholder='Confirm Password *'
              name='confirmPassword'
              value={data.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className='error-text'>{errors.confirmPassword}</span>
            )}
          </div>

          <button type='submit' className='btn-primary' disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <p className='signin-link'>
            Already have an account?{" "}
            <span onClick={() => navigate("/signin")}>Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
