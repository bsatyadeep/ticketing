import { Subjects } from "./subjects";

export interface TicketUpdaedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    title: string;
    price: number;
    orderId?: string;
    userId: string;
    version: number;
  };
}