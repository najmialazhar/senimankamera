import crypto from "crypto";

export interface CreateDokuCheckoutInput {
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemName: string;
  paymentDueMinutes?: number;
  callbackUrl?: string;
}

export interface DokuCheckoutResult {
  paymentUrl: string;
  invoiceNumber: string;
}

export class DokuService {
  private clientId: string;
  private secretKey: string;
  private isSandbox: boolean;

  constructor() {
    this.clientId = process.env.DOKU_CLIENT_ID || "";
    this.secretKey = process.env.DOKU_SECRET_KEY || "";
    this.isSandbox = process.env.NEXT_PUBLIC_DOKU_IS_PRODUCTION !== "true";

    if (!this.clientId || !this.secretKey) {
      throw new Error("DOKU credentials (DOKU_CLIENT_ID, DOKU_SECRET_KEY) are not configured in environment variables.");
    }
  }

  private get baseUrl(): string {
    return this.isSandbox
      ? "https://api-sandbox.doku.com"
      : "https://api.doku.com";
  }

  /**
   * Menghitung Digest (Base64-encoded SHA-256 dari JSON body)
   */
  private computeDigest(body: object): string {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("base64");
  }

  /**
   * Menghitung Signature DOKU menggunakan HMAC-SHA256
   * Format string to sign:
   * Client-Id:<clientId>\nRequest-Id:<requestId>\nRequest-Timestamp:<timestamp>\nRequest-Target:<target>\nDigest:<digest>
   */
  private computeSignature(
    requestId: string,
    requestTimestamp: string,
    requestTarget: string,
    digest: string
  ): string {
    const stringToSign = [
      `Client-Id:${this.clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${requestTimestamp}`,
      `Request-Target:${requestTarget}`,
      `Digest:${digest}`,
    ].join("\n");

    const hmac = crypto
      .createHmac("sha256", this.secretKey)
      .update(stringToSign)
      .digest("base64");

    return `HMACSHA256=${hmac}`;
  }

  /**
   * Membuat sesi checkout DOKU dan mendapatkan payment URL.
   */
  async createCheckoutSession(
    input: CreateDokuCheckoutInput
  ): Promise<DokuCheckoutResult> {
    const requestTarget = "/checkout/v1/payment";
    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

    const body = {
      order: {
        amount: Math.round(input.amount),
        invoice_number: input.invoiceNumber,
        currency: "IDR",
        ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
      },
      payment: {
        payment_due_date: input.paymentDueMinutes ?? 20,
      },
      customer: {
        name: input.customerName,
        email: input.customerEmail,
        ...(input.customerPhone ? { phone: input.customerPhone } : {}),
      },
    };

    const digest = this.computeDigest(body);
    const signature = this.computeSignature(
      requestId,
      requestTimestamp,
      requestTarget,
      digest
    );

    const response = await fetch(`${this.baseUrl}${requestTarget}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Client-Id": this.clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Signature: signature,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DOKU API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const paymentUrl = data?.response?.payment?.url || data?.payment?.url;

    if (!paymentUrl) {
      throw new Error(`DOKU API returned unexpected response: ${JSON.stringify(data)}`);
    }

    return {
      paymentUrl: paymentUrl as string,
      invoiceNumber: input.invoiceNumber,
    };
  }

  /**
   * Memverifikasi signature webhook dari DOKU.
   * Gunakan rawBody (string mentah) untuk menghitung Digest agar tidak terjadi perubahan whitespace.
   */
  verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
    requestTarget: string
  ): boolean {
    try {
      // Ambil header DOKU — header bisa berupa lowercase atau mixed-case
      const getHeader = (name: string): string => {
        const lower = name.toLowerCase();
        for (const [key, value] of Object.entries(headers)) {
          if (key.toLowerCase() === lower) {
            return Array.isArray(value) ? value[0] : (value ?? "");
          }
        }
        return "";
      };

      const clientId = getHeader("client-id");
      const requestId = getHeader("request-id");
      const requestTimestamp = getHeader("request-timestamp");
      const receivedSignature = getHeader("signature");

      if (!clientId || !requestId || !requestTimestamp || !receivedSignature) {
        console.warn("DOKU webhook: Missing required headers for signature verification.");
        return false;
      }

      // Hitung digest dari raw body
      const digest = crypto
        .createHash("sha256")
        .update(rawBody)
        .digest("base64");

      // Rekonstruksi string to sign
      const expectedSignature = this.computeSignature(
        requestId,
        requestTimestamp,
        requestTarget,
        digest
      );

      // Constant-time comparison untuk mencegah timing attack
      const receivedBuffer = Buffer.from(receivedSignature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    } catch (err) {
      console.error("DOKU webhook signature verification failed:", err);
      return false;
    }
  }
}
