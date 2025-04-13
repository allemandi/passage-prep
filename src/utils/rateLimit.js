import { RateLimiterMemory } from 'rate-limiter-flexible';

export const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
});

export const getUserIdentifier = () => {
  let userIdentifier;
  try {
    userIdentifier = localStorage.getItem('rateLimitId');
    if (!userIdentifier) {
      userIdentifier = Math.random().toString(36).substring(2);
      localStorage.setItem('rateLimitId', userIdentifier);
    }
  } catch (error) {
    // Fallback to memory if storage is blocked (e.g., private mode)
    userIdentifier = 'anonymous_' + Math.random().toString(36).substring(2);
  }
  return userIdentifier;
};
