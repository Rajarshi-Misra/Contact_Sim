import { Router } from 'express';
import prisma from './lib/prisma';
import { identifyContact } from './identify.controller';

const identifyRouter = Router();

identifyRouter.post('/', async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
  }

  const matchedContacts = await identifyContact(email, phoneNumber);

  return res.status(200).json({ message: 'Validation passed', ...matchedContacts});
});

export default identifyRouter;
