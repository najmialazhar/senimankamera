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
   * Menghitung Signature DOKU menggunakan HMAC-SHA256 untuk POST
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
   * Menghitung Signature DOKU untuk GET request (tanpa body/digest)
   */
  private computeGetSignature(
    requestId: string,
    requestTimestamp: string,
    requestTarget: string
  ): string {
    const stringToSign = [
      `Client-Id:${this.clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${requestTimestamp}`,
      `Request-Target:${requestTarget}`,
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
   * Mengecek status transaksi secara aktif langsung ke API DOKU (Inquiry Status API).
   * Mengembalikan "SUCCESS", "FAILED", "EXPIRED", "PENDING", atau null jika error.
   */
  async checkTransactionStatus(invoiceNumber: string): Promise<string | null> {
    try {
      const requestTarget = `/orders/v1/status/${invoiceNumber}`;
      const requestId = crypto.randomUUID();
      const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

      const signature = this.computeGetSignature(
        requestId,
        requestTimestamp,
        requestTarget
      );

      const response = await fetch(`${this.baseUrl}${requestTarget}`, {
        method: "GET",
        headers: {
          "Client-Id": this.clientId,
          "Request-Id": requestId,
          "Request-Timestamp": requestTimestamp,
          Signature: signature,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const status = data?.transaction?.status || data?.order?.status || null;
      return status as string | null;
    } catch (err) {
      console.error(`Failed to check DOKU status for ${invoiceNumber}:`, err);
      return null;
    }
  }

  /**
   * Memverifikasi signature webhook dari DOKU.
   */
  verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
    requestTarget: string
  ): boolean {
    try {
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
      const headerTarget = getHeader("request-target");

      if (!clientId || !requestId || !requestTimestamp || !receivedSignature) {
        console.warn("DOKU webhook: Missing required headers for signature verification.");
        return false;
      }

      const digest = crypto
        .createHash("sha256")
        .update(rawBody)
        .digest("base64");

      const targetToUse = headerTarget || requestTarget;

      const expectedSignature = this.computeSignature(
        requestId,
        requestTimestamp,
        targetToUse,
        digest
      );

      const receivedBuffer = Buffer.from(receivedSignature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
        return true;
      }

      if (targetToUse !== requestTarget) {
        const altSignature = this.computeSignature(
          requestId,
          requestTimestamp,
          requestTarget,
          digest
        );
        const altBuffer = Buffer.from(altSignature);
        if (receivedBuffer.length === altBuffer.length && crypto.timingSafeEqual(receivedBuffer, altBuffer)) {
          return true;
        }
      }

      console.warn(`DOKU signature mismatch for Client-Id ${clientId}. Expected: ${expectedSignature}, Received: ${receivedSignature}`);
      return false;
    } catch (err) {
      console.error("DOKU webhook signature verification failed:", err);
      return false;
    }
  }
}
