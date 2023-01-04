import type { NextPage } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import type { FormEventHandler } from 'react';
import styles from '../styles/Home.module.css';
import Webplayer from '@corellium/corellium-webplayer';

const features = {
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
};

type TParams = {
  projectId: string;
  corelliumDomain: string;
  deviceId: string;
  containerId: string;
  features: {
    [key: string]: boolean;
  };
};

const Home: NextPage = () => {
  const [text, setText] = useState('Connect');
  const [show, setShow] = useState(false);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setShow(false);
    setText('Connecting...');

    const formData = new FormData(e.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);

    const {
      features,
      projectId,
      deviceId,
      corelliumDomain,
      containerId,
    }: TParams = Object.keys(formProps).reduce((params, formInput) => {
      if (formProps[formInput] === 'on') {
        return {
          ...params,
          features: {
            // @ts-ignore
            ...params.features,
            [formInput]: true,
          },
        };
      }

      return {
        ...params,
        [formInput]: formProps[formInput],
      };
    }, {}) as TParams;

    try {
      setText('Getting token...');
      // get JWT using token
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: process.env.ACCESS_TOKEN,
          projectId,
          instanceId: deviceId,
          features,
        }),
      });
      const { token, ...data } = await res.json();
      console.log(
        'consthandleFormSubmit:FormEventHandler<HTMLFormElement>= ~ token',
        token,
        data
      );
      if (token) {
        setText('Token recieved and connecting ...');

        // now that we have a JWT, set up the webplayer
        // pass the id for the div that will hold the iframe as `containerId`
        const webplayer = new Webplayer({
          token,
          domain: corelliumDomain,
          deviceId,
          containerId,
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
        <form className={styles.form} onSubmit={handleFormSubmit}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="projectId">Project ID</label>
              <input type="text" name="projectId" />
            </div>
            <div className={styles.field}>
              <label htmlFor="corelliumDomain">Corellium Domain</label>
              <input type="text" name="corelliumDomain" />
            </div>
            <div className={styles.field}>
              <label htmlFor="deviceId">Device ID</label>
              <input type="text" name="deviceId" />
            </div>

            <div className={styles.field}>
              <label htmlFor="containerId">Container ID</label>
              <input type="text" name="containerId" />
            </div>
            <button className={styles.btn} type="submit">
              Connect
            </button>
          </div>

          <div className={styles.features}>
            {Object.keys(features).map((feature, index) => (
              <div className={styles.featuresWrapper} key={index}>
                <input
                  type="checkbox"
                  name={feature}
                  id={feature}
                  defaultChecked={features[feature as keyof typeof features]}
                />
                <label className={styles.label} htmlFor={feature}>
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </form>
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
