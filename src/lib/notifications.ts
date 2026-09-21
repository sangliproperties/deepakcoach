import "server-only";

export type NotificationChannel = "IN_APP" | "EMAIL" | "WHATSAPP" | "SMS";
export type NotificationDeliveryStatus = "QUEUED" | "SENT" | "FAILED";

export type NotificationMessage = {
  recipient: string;
  message: string;
  type: string;
  bookingId?: string;
  paymentId?: string;
};

export type NotificationDeliveryResult = {
  providerMessageId?: string;
  retryable: boolean;
};

export interface NotificationProvider {
  readonly channel: Exclude<NotificationChannel, "IN_APP">;
  deliver(message: NotificationMessage): Promise<NotificationDeliveryResult>;
}

export const unavailableNotificationProviders: Record<Exclude<NotificationChannel, "IN_APP">, NotificationProvider> = {
  EMAIL: {
    channel: "EMAIL",
    async deliver() {
      throw new Error("Email delivery is not configured.");
    }
  },
  WHATSAPP: {
    channel: "WHATSAPP",
    async deliver() {
      throw new Error("WhatsApp delivery is not configured.");
    }
  },
  SMS: {
    channel: "SMS",
    async deliver() {
      throw new Error("SMS delivery is not configured.");
    }
  }
};

export function retryDelay(attemptCount: number) {
  return Math.min(24 * 60 * 60 * 1000, 30_000 * 2 ** Math.max(0, attemptCount - 1));
}
