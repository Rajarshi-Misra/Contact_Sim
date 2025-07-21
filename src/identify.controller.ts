import prisma from "./lib/prisma";

export const identifyContact = async (email?: string, phoneNumber?: string) => {
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