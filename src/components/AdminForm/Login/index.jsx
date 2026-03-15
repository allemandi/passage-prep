import { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useToast } from '../../ToastMessage/Toast';

const authChannel = new BroadcastChannel('auth');

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');

      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      authChannel.postMessage({ type: 'LOGIN' });
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
        isRequired
      />

      <Input
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Enter your password"
        isRequired
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
