import { apiToken } from './token.sample.js';
// import CorelliumWebplayer from '@corellium/webplayer-client'
import CorelliumWebplayer from './build/index.min.js';

const deviceId = 'Your device ID';
const corelliumDomain = 'The Corellium domain you are connecting to';
const projectId = 'Your project ID';
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
      const res = await fetch('http://localhost:8000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: apiToken,
          projectId,
          features,
        }),
      });

      const { token, ...data } = await res.json();
      console.log('token', token, data);

      // now that we have a JWT, set up the webplayer
      // pass the id for the div that will hold the iframe as `containerId`
      const webplayer = new CorelliumWebplayer({
        token,
        domain: corelliumDomain,
        deviceId,
        containerId,
      });

      webplayer.on('success', (data) => {
        console.log('data', data);
      });

      webplayer.on('error', (data) => {
        console.error('err', data);
      });
    } catch (err) {
      console.log('server err :>> ', err);
    }
  });
})();
