"use strict"

// Helper function to check token expiration and clear if expired
const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expiration = decodedPayload.exp * 1000; // Convert to milliseconds

    if (Date.now() > expiration) {
      console.log("Token expired, removing from localStorage");
      localStorage.removeItem("token"); // Remove expired token
      return null; // Return null if the token is expired
    }

    console.log("Token is valid, expiration date:", new Date(expiration).toLocaleString());
    return new Date(expiration); // Return expiration date if valid
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default checkTokenExpiration;
