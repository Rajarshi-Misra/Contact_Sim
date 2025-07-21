import prisma from "./lib/prisma";
import { IdentifyRequest, IdentifyResponse, Contact, LinkType } from "./types/identify";

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

function buildResponse(contacts: Contact[], truePrimaryContact: Contact): IdentifyResponse {
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];
  
    for (const contact of contacts) {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
  
      if (contact.id !== truePrimaryContact.id) {
        secondaryContactIds.push(contact.id);
      }
    }
  
    return {
     contact: {
      primaryContactId: truePrimaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds,
     }
    };
  }
  

const createNewContact = async ({ email, phoneNumber }: IdentifyRequest): Promise<IdentifyResponse> => {
    const newContact = await prisma.contact.create({
        data: {
            email: email,
            phoneNumber: phoneNumber
        }
    });

    return {
        contact: {
            primaryContactId: newContact.id,
            emails: newContact.email ? [newContact.email] : [],
            phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
            secondaryContactIds: [],
        } 
    };
}

const fetchContactsByLinkedId = async (primaryId: number): Promise<Contact[]> => {
  return await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryId },
        { linkedId: primaryId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
};

const getTruePrimary = (contacts: Contact[]): Contact => {
    const primaries = contacts.filter(c => c.linkPrecedence === LinkType.PRIMARY);
  
    let truePrimary = primaries[0];
    for (let p of primaries) {
      if (p.createdAt < truePrimary.createdAt) {
        truePrimary = p;
      }
    }
  
    return truePrimary;
};

export const identifyContact = async (data: IdentifyRequest): Promise<IdentifyResponse> => {
  const matchedContacts = await fetchMatchingContact(data);

  if (matchedContacts.length === 0) {
    return await createNewContact(data);
  }

  // Group all primaries from matched contacts
  const primaryContacts = matchedContacts.filter(c => c.linkPrecedence === "PRIMARY");

  // CASE: multiple primaries → merge needed
  if (primaryContacts.length > 1) {
    // Create a new primary
    const newPrimary = await prisma.contact.create({
      data: {
        email: data.email ?? null,
        phoneNumber: data.phoneNumber ?? null,
        linkedId: null,
        linkPrecedence: "PRIMARY",
      }
    });

    // Update all existing primaries to SECONDARY and link to newPrimary
    await prisma.contact.updateMany({
      where: {
        id: { in: primaryContacts.map(p => p.id) }
      },
      data: {
        linkPrecedence: "SECONDARY",
        linkedId: newPrimary.id
      }
    });

    const finalContacts = await fetchContactsByLinkedId(newPrimary.id);
    return buildResponse(finalContacts, newPrimary);
  }

  //if multiple primaries don't exist and we have a partial match we check if it has additional data 
  const emails = new Set(matchedContacts.map(c => c.email).filter(Boolean));
  const phones = new Set(matchedContacts.map(c => c.phoneNumber).filter(Boolean));
  const isNewEmail = !!data.email && !emails.has(data.email);
  const isNewPhone = !!data.phoneNumber && !phones.has(data.phoneNumber);

  const truePrimary = getTruePrimary(matchedContacts)

  //No additional data
  if (!isNewEmail && !isNewPhone) {
    const finalContacts = await fetchContactsByLinkedId(truePrimary.id);
    return buildResponse(finalContacts, truePrimary);
  }
  //Additional data entered
  await prisma.contact.create({
    data: {
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      linkedId: truePrimary.id,
      linkPrecedence: "SECONDARY",
    }
  });

  const finalContacts = await fetchContactsByLinkedId(truePrimary.id);
  return buildResponse(finalContacts, truePrimary);
};