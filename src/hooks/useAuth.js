import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuth = () => {
  console.log('useAuth hook invoked');
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      const currentPath = location.pathname + location.search;
      console.log('No token found. Setting intendedPath to:', currentPath);
      localStorage.setItem('intendedPath', currentPath);
      console.log('intendedPath after setting:', localStorage.getItem('intendedPath'));
      navigate('/login');
    } else {
      console.log('Token found:', storedToken);
      setToken(storedToken);
    }
  }, [navigate, location]);

  return { token };
};

export default useAuth;
