import { NextApiHandler } from 'next';
// @ts-ignore
import { Corellium } from '@corellium/corellium-api';

const handler: NextApiHandler = async (req, res) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body.endpoint) {
    throw new Error('Missing required parameters');
  }
  const flavor = 'iphone6';
  const os = '12.5.6';
  const apiToken = 'my_api_token'; // Add your API token
  const endpoint = body.endpoint;
  const snapshot = 'my_snapshot_id'; // Add your snapshot ID

  try {
    const corellium = new Corellium({
      endpoint,
      apiToken,
    });

    const project = await corellium.createProject('Webplayer Project');

    await project.setQuotas({
      cores: 2,
    });

    const instance = await project.createInstance({
      name: 'Webplayer Device',
      flavor,
      os,
      bootOptions: {
        snapshot,
      },
    });

    res.status(200).json({
      instanceId: instance.id,
      projectId: project.id,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: `ERROR creating device: ${error.message}` });
  }
};

export default handler;
