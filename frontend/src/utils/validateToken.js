// filepath: d:\PeerSync\frontend\src\utils\validateToken.js
const validateToken = () => {
  const token = localStorage.getItem("token");
  // Add your token validation logic here
  return token !== null; // Example: Check if token exists
};

export default validateToken;