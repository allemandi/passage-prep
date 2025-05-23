import { RateLimiterMemory } from 'rate-limiter-flexible';

export const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
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
  } catch {
    userIdentifier = 'anonymous_' + Math.random().toString(36).substring(2);
  }
  return userIdentifier;
};
