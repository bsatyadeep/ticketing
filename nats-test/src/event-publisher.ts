import { Stan } from "node-nats-streaming";

export class EventPublisher {
  private client: Stan;

  constructor(client: Stan){
    this.client = client;
  }

  publishEvent(subject: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(subject, JSON.stringify(data), (err) => {
        if(err){
          return reject(err);
        }

        console.log(`Event ${subject} Published!`);
        console.table(data);
        resolve();
      });
    });

  }
}