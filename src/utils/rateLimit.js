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
      userIdentifier = Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(36))
        .join('');
      localStorage.setItem('rateLimitId', userIdentifier);
    }
  } catch {
    userIdentifier = 'anonymous_' + Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(36))
      .join('');
  }
  return userIdentifier;
};
