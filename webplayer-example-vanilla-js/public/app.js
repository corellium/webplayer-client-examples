import { apiToken } from './token.js';
const CorelliumWebplayer = window.CorelliumWebplayer.default;

const instanceId = 'b2c20494-3246-4686-9c65-b239710a0d9f';
const corelliumDomain = 'http://localhost:9000';
const projectId = '00d6a900-321f-4ec4-9d93-88ebcf7b9e03';
const features = {
  apps: true,
  console: true,
  coretrace: true,
  deviceControl: true,
  deviceDelete: true,
  files: true,
  frida: true,
  images: true,
  messaging: true,
  netmon: true,
  network: true,
  portForwarding: true,
  profile: true,
  sensors: true,
  settings: true,
  snapshots: true,
  strace: true,
  system: true,
  connect: true,
};

// the ID of the element to contain the iframe
const containerId = 'container';

(function () {
  // Setup the iFrame
  document.addEventListener('DOMContentLoaded', async function (event) {
    try {
      // get JWT using token
      console.log('Starting fetch request...');

      const response = await fetch('http://localhost:8000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token: apiToken,
          instanceId,
          projectId,
          features,
        }),
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log('Fetch completed, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Response data received:', responseData);

      const { token, ...data } = responseData;
      console.log('Token extracted:', token ? 'Token exists' : 'No token');

      const webplayer = new CorelliumWebplayer({
        token,
        domain: corelliumDomain,
        instanceId,
        containerId,
      });

      webplayer.on('success', (data) => {
        console.log('Webplayer success:', data);
      });

      webplayer.on('error', (data) => {
        console.error('Webplayer error:', data);
      });
    } catch (error) {
      console.error('Request failed:', error);
      if (error.name === 'AbortError') {
        console.error('Request timed out');
      }
      throw error;
    }
  });
})();
