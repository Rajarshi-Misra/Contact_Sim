import express from 'express';
import dotenv from 'dotenv';
import prisma from './lib/prisma';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', async (_req, res) => {
  const contacts = await prisma.contact.findMany();
  res.json({ message: 'Up', totalContacts: contacts.length });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
