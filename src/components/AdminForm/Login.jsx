import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ToastMessage/Toast';
import { login } from '../../services/dataService';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(username, password);
      setIsLoggedIn(true);
      showToast('Login successful', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto w-full flex flex-col gap-8 py-10">
      <Input
        label="Username"
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        placeholder="Enter your username"
      />

      <Input
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Enter your password"
      />

      <Button
        type="submit"
        isLoading={isLoading}
        size="lg"
        className="w-full mt-4"
      >
        Login
      </Button>
    </form>
  );
};

export default Login;
