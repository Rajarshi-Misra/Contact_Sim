export { Contact, LinkType } from '@prisma/client';

export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}
export interface IdentifyResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}
  