export class TelegramService {
  private token = process.env.TELEGRAM_BOT_TOKEN || "";
  private chatId = process.env.TELEGRAM_CHAT_ID || "";

  constructor() {
    if (!this.token || !this.chatId) {
      console.warn("Telegram API token or chat ID is missing in environment variables. Telegram notifications will be disabled.");
    }
  }

  async sendBookingNotification(booking: {
    id?: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    instagram?: string;
    categoryName?: string;
    packageType: string;
    bookingDate: Date;
    eventTime?: string;
    eventName?: string;
    eventLocation?: string;
    notes?: string;
    dpAmount?: number;
    totalAmount?: number;
  }) {
    if (!this.token || !this.chatId) {
      console.log("Skipping Telegram notification because bot token or chat ID is not configured.");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(booking.bookingDate);

    const formattedDP = booking.dpAmount
      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(booking.dpAmount)
      : "-";
    const formattedTotal = booking.totalAmount
      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(booking.totalAmount)
      : "-";

    const paketLabel = booking.categoryName
      ? `${booking.categoryName} · ${booking.packageType}`
      : booking.packageType;

    const message = `
📸 <b>ADA PESANAN BARU</b> 📸
----------------------------------
🆔 <b>Tracking Code / Order ID:</b> <code>${booking.id || "-"}</code>
👤 <b>Nama Klien:</b> ${booking.fullName}
📧 <b>Email:</b> ${booking.email}
📞 <b>No. HP / WA:</b> ${booking.phoneNumber || "-"}
🔗 <b>Instagram:</b> ${booking.instagram || "-"}
📦 <b>Paket Event:</b> ${paketLabel}
📅 <b>Tanggal Booking:</b> ${formattedDate}
⏰ <b>Waktu Acara:</b> ${booking.eventTime || "-"}
🎉 <b>Nama Acara:</b> ${booking.eventName || "-"}
📍 <b>Lokasi Acara:</b> ${booking.eventLocation || "-"}
💰 <b>Uang Muka (DP):</b> ${formattedDP} <b>(TELAH DIBAYAR)</b> dari Total: ${formattedTotal}
📝 <b>Catatan Vision:</b> ${booking.notes || "-"}
----------------------------------
Silahkan cek Admin Dashboard di senimankamera.my.id/login
`;

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Failed to send Telegram notification:", errText);
      } else {
        console.log("Telegram notification sent successfully!");
      }
    } catch (error) {
      console.error("TelegramService Error:", error);
    }
  }

  async sendBookingStatusNotification(
    clientName: string,
    eventName: string,
    bookingDate: Date,
    status: string,
    bookingId?: string
  ) {
    if (!this.token || !this.chatId) {
      console.log("Skipping Telegram notification because bot token or chat ID is not configured.");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(new Date(bookingDate));

    let emoji = "ℹ️";
    let statusText = status.toUpperCase();
    if (status === "APPROVED") {
      emoji = "✅";
      statusText = "DISETUJUI / APPROVED";
    } else if (status === "REJECTED") {
      emoji = "❌";
      statusText = "DITOLAK / REJECTED";
    } else if (status === "CANCELLED") {
      emoji = "🚫";
      statusText = "DIBATALKAN / CANCELLED";
    } else if (status === "LUNAS") {
      emoji = "💰";
      statusText = "LUNAS";
    }

    const message = `
${emoji} <b>STATUS BOOKING DIPERBARUI</b> ${emoji}
----------------------------------
🆔 <b>Tracking Code / Order ID:</b> <code>${bookingId || "-"}</code>
👤 <b>Nama Klien:</b> ${clientName}
🎉 <b>Acara:</b> ${eventName || "-"}
📅 <b>Tanggal Acara:</b> ${formattedDate}
📌 <b>Status Baru:</b> <b>${statusText}</b>
----------------------------------
Silahkan cek di Admin Dashboard di senimankamera.my.id/login
`;

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Failed to send Telegram status notification:", errText);
      } else {
        console.log("Telegram status notification sent successfully!");
      }
    } catch (error) {
      console.error("TelegramStatusNotification Error:", error);
    }
  }

  async sendOtpMessage(data: { otp: string; name: string; email: string; username: string }) {
    if (!this.token || !this.chatId) {
      console.log("Skipping Telegram notification because bot token or chat ID is not configured.");
      return;
    }

    const message = `
🔐 <b>PERMINTAAN RESET PASSWORD</b> 🔐
----------------------------------
👤 <b>Nama Admin:</b> ${data.name}
📧 <b>Email:</b> ${data.email}
👤 <b>Username:</b> ${data.username}
----------------------------------
🔑 <b>KODE OTP:</b> <code>${data.otp}</code>
⏱️ <b>Berlaku:</b> 5 Menit

<i>Mohon jangan berikan kode OTP ini kepada siapapun.</i>
`;

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Failed to send Telegram OTP message:", errText);
      } else {
        console.log("Telegram OTP message sent successfully!");
      }
    } catch (error) {
      console.error("Telegram OTP message Error:", error);
    }
  }
}
