// Enum for contact linking logic
export enum LinkPrecedence {
    PRIMARY = "primary",
    SECONDARY = "secondary",
  }
  
  // DB record type (optional if you use Prisma auto types)
  export interface Contact {
    id: number;
    phoneNumber: string | null;
    email: string | null;
    linkedId: number | null;
    linkPrecedence: LinkPrecedence;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }
  
  // Input payload for /identify
  export interface IdentifyRequest {
    email?: string;
    phoneNumber?: string;
  }
  
  // API Response type
  export interface IdentifyResponse {
    contact: {
      primaryContactId: number;
      emails?: string[];
      phoneNumbers?: string[];
      secondaryContactIds?: number[];
    };
  }
  