import crypto from "crypto";

// Token QR firmado con HMAC-SHA256: base64url(bookingId).base64url(firma)
// El conductor lo contrasta contra la lista de pasajeros (MVP).

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateQrToken(bookingId: string): string {
  const secret = process.env.QR_SECRET;
  if (!secret) throw new Error("QR_SECRET no configurado");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(bookingId)
    .digest();
  return `${base64url(bookingId)}.${base64url(signature)}`;
}

export function verifyQrToken(token: string): string | null {
  const secret = process.env.QR_SECRET;
  if (!secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const bookingId = Buffer.from(
    payload.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString();

  const expected = generateQrToken(bookingId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return bookingId;
}
