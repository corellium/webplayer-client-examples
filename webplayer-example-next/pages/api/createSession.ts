import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  method?: string;
  error?: string;
};

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
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  const { instanceId, projectId, domain, features } = body;

  const LOGIN_URL = `${domain}/api/v1/webplayer`;

  if (!projectId) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'my_api_token', // Add your API token
        },
        body: JSON.stringify({
          instanceId,
          projectId,
          expiresIn: 60 * 60 * 5, // value is in seconds
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
      console.log('ERROR creating session: ', err);
      res.status(500).send({ error: 'ERROR getting token from the server' });
    }
  }

  res.status(200).json({ method: 'API only support POST requests' });
}
