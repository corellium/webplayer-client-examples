import type { NextPage } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Webplayer from '@corellium/corellium-webplayer';

const Home: NextPage = () => {
  const [text, setText] = useState('Add your endpoint and press Connect');
  const [show, setShow] = useState(false);
  const [endpoint, setEndpoint] = useState('');
  const [features, setFeatures] = useState({
    connect: true,
    files: true,
    apps: true,
    network: true,
    coretrace: true,
    messaging: true,
    settings: true,
    frida: true,
    console: true,
    portForwarding: true,
    sensors: true,
    snapshots: true,
  });

  const handleCreateDevice = async () => {
    setText('Creating device...');

    try {
      const createdDevice = await fetch('/api/createDevice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
        }),
      });

      setText('Device created successfully');

      const json = await createdDevice.json();

      handleCreateSession(json.projectId, json.instanceId);
    } catch (error) {
      console.error(error);
      setText('Error creating device!');
    }
  };

  const handleCreateSession = async (projectId: string, instanceId: string) => {
    setText('Getting token...');

    try {
      setText('Getting token...');
      // get JWT using access token
      const res = await fetch('/api/createSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: endpoint,
          projectId,
          instanceId,
          features,
        }),
      });
      const { token, ...data } = await res.json();
      console.log('received JWT', token, data);
      if (token) {
        setText('Token recieved and connecting ...');

        const webplayer = new Webplayer({
          token,
          domain: endpoint,
          deviceId: instanceId,
          containerId: 'container',
        });
        webplayer.on('success', (data) => {
          console.log('data', data);
          setText('Connected!');
          setTimeout(() => {
            setShow(true);
          }, 1000);
        });
        webplayer.on('error', (data) => {
          console.error('next error', data);
          setText('Error!');
        });
      }
    } catch (err) {
      console.log('server err :>> ', err);
      setText('Error!');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Corellium - Web Player Example</title>
        <meta name="description" content="Corellium Web Player Example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.field}>
          <label htmlFor="corelliumDomain">Enterprise Endpoint</label>
          <input
            type="text"
            name="corelliumDomain"
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>
        <div className={styles.features}>
          {Object.keys(features).map((feature, index) => (
            <div className={styles.featuresWrapper} key={index}>
              <input
                type="checkbox"
                name={feature}
                id={feature}
                checked={features[feature as keyof typeof features]}
                onChange={(e) =>
                  setFeatures({
                    ...features,
                    [feature]: e.target.checked,
                  })
                }
              />
              <label className={styles.label} htmlFor={feature}>
                {feature}
              </label>
            </div>
          ))}
        </div>
        <div className={styles.field}>
          <button className={styles.btn} onClick={handleCreateDevice}>
            Connect
          </button>
        </div>
        <h1>{text}</h1>
        <div
          className={styles.container}
          id="container"
          style={{ opacity: show ? 1 : 0 }}
        ></div>
      </main>
    </div>
  );
};

export default Home;
