import { Router } from 'express';
import prisma from '../lib/prisma';

const identifyRouter = Router();

identifyRouter.post('/', async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
  }

  return res.status(200).json({ message: 'Validation passed', email, phoneNumber });
});

export default identifyRouter;
