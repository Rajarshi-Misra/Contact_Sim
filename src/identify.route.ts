import { Router, Request, Response } from 'express';
import { identifyContact } from './identify.controller';
import type { IdentifyRequest, IdentifyResponse } from './types/identify';

const identifyRouter = Router();

identifyRouter.post('/', async (req: Request<{}, {}, IdentifyRequest>, res: Response<IdentifyResponse>) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided' } as any);
  }

  try {
    const contact = await identifyContact({ email, phoneNumber });

    return res.status(200).json(contact);
  } catch (error) {
    console.error('Error identifying contact:', error);
    return res.status(500).json({ error: 'Internal server error' } as any);
  }
});

export default identifyRouter;
