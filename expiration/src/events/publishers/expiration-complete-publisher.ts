import { ExpirationCompleteEvent, Publisher, Subjects } from "@codeshive/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}