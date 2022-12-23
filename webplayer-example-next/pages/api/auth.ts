import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  method?: string;
  error?: string;
};

const LOGIN_URL = 'https://example.corellium.dev/api/v1/webplayer'; // example for this domain would be https://app.corellium.co/api/v1/webplayer in production

const defaultFeatures = {
  powerManagement: true,
  deviceControl: true,
  deviceDelete: true,
  profile: true,
  images: true,
  netmon: true,
  strace: true,
  system: true,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { token, instanceId, projectId, features } = req.body;

  if (!token || !projectId) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          instanceId,
          projectId,
          expiresIn: 18000,
          features: {
            ...defaultFeatures,
            ...features,
          },
        }),
      });

      const data = await response.json();

      res.status(200).json(data);

      return;
    } catch (err: unknown) {
      console.log('webplayer ERROR: ', err);
      res.status(500).send({ error: 'ERROR getting token from the server' });
    }
  }

  res.status(200).json({ method: 'API only support POST requests' });
}
