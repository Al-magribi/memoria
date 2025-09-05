// Authentication utility functions

export const isAuthenticated = () => {
  return localStorage.getItem("isSignin") === "true";
};

export const setAuthenticated = () => {
  localStorage.setItem("isSignin", "true");
};

export const clearAuthentication = () => {
  localStorage.removeItem("isSignin");
};

export const checkAuthAndRedirect = (navigate, user) => {
  const isSigninFromStorage = isAuthenticated();
  if (!isSigninFromStorage) {
    navigate("/signin");
    return false;
  }
  return true;
};
