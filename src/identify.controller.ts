import prisma from "./lib/prisma";
import { IdentifyRequest } from "./types/identify";

const fetchMatchingContact = async ({ email, phoneNumber }: IdentifyRequest) => {
    const orConditions: any[] = [];

    if (email) {
      orConditions.push({ email });
    }
  
    if (phoneNumber) {
      orConditions.push({ phoneNumber });
    }
  
    const matchedContacts = await prisma.contact.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: { createdAt: 'asc' },
    });
  
    return matchedContacts;
}

const createNewContact = async ({ email, phoneNumber }: IdentifyRequest) => {
    const newContact = await prisma.contact.create({
        data: {
            email: email,
            phoneNumber: phoneNumber
        }
    });

    return {
          primaryContactId: newContact.id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: [],
    };
}

export const identifyContact = async (data: IdentifyRequest) => {
    const matchedContacts = await fetchMatchingContact({ email: data.email, phoneNumber: data.phoneNumber })

    if (matchedContacts.length === 0) {
        const newContact = await createNewContact(data);
        return newContact;
    }

    return matchedContacts;
}