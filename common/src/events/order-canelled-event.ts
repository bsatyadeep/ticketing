import { Subjects } from "./subjects";

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled,
  data: {
    id: string;
    userId: string;
    ticket: {
      id: string;
    },
    version: number;
  }
}