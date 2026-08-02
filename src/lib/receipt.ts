import { jsPDF } from "jspdf";
import { format, addDays, differenceInCalendarDays, parseISO } from "date-fns";
import { locations } from "@/data/locations";

export interface ReceiptData {
  reference: string;
  locationId: string;
  checkIn: string; // yyyy-MM-dd
  checkOut: string; // yyyy-MM-dd
  guests: number;
  guestName: string;
  email: string;
  phone?: string | null;
  totalPrice?: number | null;
  status?: string;
  issuedAt?: string;
}

const SAGE: [number, number, number] = [110, 128, 108];
const INK: [number, number, number] = [42, 46, 42];
const MUTED: [number, number, number] = [125, 132, 124];
const LINE: [number, number, number] = [216, 220, 214];

const computeReceipt = (data: ReceiptData) => {
  const site = locations.find((l) => l.id === data.locationId);
  const from = parseISO(data.checkIn);
  const to = parseISO(data.checkOut);
  const nights = Math.max(1, differenceInCalendarDays(to, from));
  const rawRate = site?.price ?? 0;
  const total = data.totalPrice != null ? Number(data.totalPrice) : nights * rawRate;
  return {
    siteName: site?.name ?? data.locationId,
    from,
    to,
    nights,
    nightlyRate: rawRate || Math.round(total / nights),
    total,
    issued: data.issuedAt ? parseISO(data.issuedAt) : new Date(),
    status: (data.status ?? "pending").replace(/^\w/, (c) => c.toUpperCase()),
  };
};

export const cancellationPolicy = [
  "Free cancellation up to 14 days before check-in - full refund.",
  "Cancel 7-14 days before arrival and 50% of the total is refunded.",
  "Within 7 days of arrival the stay is non-refundable, but dates can be moved once.",
  "Check-in from 3pm, check-out by 11am. Quiet hours 10pm-7am.",
];

/** Opens a clean, printer-friendly view of the receipt and triggers the print dialog. */
export const printReceipt = (data: ReceiptData) => {
  const r = computeReceipt(data);
  const nightRows = Array.from({ length: r.nights }, (_, i) => {
    const night = addDays(r.from, i);
    return `<tr><td>${format(night, "EEE d MMM yyyy")}</td><td class="num">$${r.nightlyRate}</td></tr>`;
  }).join("");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>Wild Haven receipt ${data.reference}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 32px; font-family: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
    color: #2a2e2a; font-weight: 300; background: #fff; max-width: 760px; margin-inline: auto; }
  h1 { font-size: 26px; font-weight: 300; color: #6e806c; margin: 0; letter-spacing: .01em; }
  .label { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #7d847c; }
  .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  hr { border: none; border-top: 1px solid #d8dcd6; margin: 22px 0; }
  .val { font-size: 15px; margin-top: 4px; }
  .grid { display: flex; gap: 48px; flex-wrap: wrap; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 5px 0; }
  .num { text-align: right; }
  .total { font-size: 22px; }
  ul { padding-left: 18px; margin: 10px 0 0; font-size: 12px; color: #7d847c; line-height: 1.7; }
  footer { margin-top: 36px; font-size: 11px; color: #7d847c; }
  .actions { margin-bottom: 28px; }
  button { font: inherit; font-size: 13px; padding: 8px 18px; border-radius: 999px; border: 1px solid #d8dcd6;
    background: #6e806c; color: #fff; cursor: pointer; }
  @media print { .actions { display: none; } body { padding: 0; } }
</style></head><body>
<div class="actions"><button onclick="window.print()">Print receipt</button></div>
<div class="row">
  <div><h1>Wild Haven</h1><div class="label" style="margin-top:6px">Off-grid camping</div></div>
  <div style="text-align:right">
    <div class="label">Receipt</div>
    <div class="val">${data.reference}</div>
    <div class="label" style="margin-top:6px">Issued ${format(r.issued, "d MMM yyyy")}</div>
  </div>
</div>
<hr />
<div class="row">
  <div><div class="label">Campsite</div><div class="val">${r.siteName}</div></div>
  <div style="text-align:right"><div class="label">Status</div><div class="val">${r.status}</div></div>
</div>
<div class="row" style="margin-top:22px">
  <div class="grid">
    <div><div class="label">Check-in</div><div class="val">${format(r.from, "EEE d MMM yyyy")}</div></div>
    <div><div class="label">Check-out</div><div class="val">${format(r.to, "EEE d MMM yyyy")}</div></div>
  </div>
  <div style="text-align:right"><div class="label">Guests</div><div class="val">${data.guests}</div></div>
</div>
<hr />
<div class="label">Guest</div>
<div class="val">${data.guestName}</div>
<div class="val" style="font-size:13px">${data.email}</div>
${data.phone ? `<div class="val" style="font-size:13px">${data.phone}</div>` : ""}
<hr />
<div class="row"><div class="label">Nights</div><div class="label">Rate</div></div>
<table style="margin-top:8px">${nightRows}</table>
<hr />
<div class="row">
  <div style="font-size:12px;color:#7d847c">$${r.nightlyRate} per night &times; ${r.nights} ${r.nights === 1 ? "night" : "nights"}</div>
  <div style="text-align:right"><div class="label">Total</div><div class="total">$${r.total}</div></div>
</div>
<hr />
<div class="label">Cancellation policy</div>
<ul>${cancellationPolicy.map((l) => `<li>${l}</li>`).join("")}</ul>
<footer>Wild Haven - this receipt confirms your reservation request. Taxes and fees are confirmed by email.</footer>
<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 250); });</script>
</body></html>`;

  const win = window.open("", "_blank", "noopener,width=900,height=1000");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
};

export const generateReceiptPdf = (data: ReceiptData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 56;
  const right = pageW - M;

  const site = locations.find((l) => l.id === data.locationId);
  const siteName = site?.name ?? data.locationId;
  const rawRate = site?.price ?? 0;

  const from = parseISO(data.checkIn);
  const to = parseISO(data.checkOut);
  const nights = Math.max(1, differenceInCalendarDays(to, from));
  const total = data.totalPrice != null ? Number(data.totalPrice) : nights * rawRate;
  const nightlyRate = rawRate || Math.round(total / nights);

  const label = (text: string, x: number, y: number, align: "left" | "right" = "left") => {
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTED);
    doc.text(text.toUpperCase(), x, y, { align, charSpace: 1.2 });
  };
  const value = (text: string, x: number, y: number, size = 11, align: "left" | "right" = "left") => {
    doc.setFont("helvetica", "normal").setFontSize(size).setTextColor(...INK);
    doc.text(text, x, y, { align });
  };
  const rule = (y: number) => {
    doc.setDrawColor(...LINE).setLineWidth(0.6);
    doc.line(M, y, right, y);
  };

  // Header
  doc.setFont("helvetica", "normal").setFontSize(20).setTextColor(...SAGE);
  doc.text("Wild Haven", M, 80);
  label("Off-grid camping", M, 96);

  label("Receipt", right, 80, "right");
  doc.setFontSize(11).setTextColor(...INK);
  doc.text(data.reference, right, 96, { align: "right" });
  label(`Issued ${format(data.issuedAt ? parseISO(data.issuedAt) : new Date(), "d MMM yyyy")}`, right, 110, "right");

  rule(130);

  // Stay details
  let y = 162;
  label("Campsite", M, y);
  value(siteName, M, y + 18, 13);
  label("Status", right, y, "right");
  value((data.status ?? "pending").replace(/^\w/, (c) => c.toUpperCase()), right, y + 18, 13, "right");

  y += 52;
  label("Check-in", M, y);
  value(format(from, "EEE d MMM yyyy"), M, y + 16);
  label("Check-out", M + 190, y);
  value(format(to, "EEE d MMM yyyy"), M + 190, y + 16);
  label("Guests", right, y, "right");
  value(String(data.guests), right, y + 16, 11, "right");

  y += 46;
  rule(y);

  // Guest
  y += 28;
  label("Guest", M, y);
  value(data.guestName, M, y + 16);
  value(data.email, M, y + 32, 10);
  if (data.phone) value(data.phone, M, y + 48, 10);

  y += (data.phone ? 72 : 56);
  rule(y);

  // Nights breakdown
  y += 28;
  label("Nights", M, y);
  label("Rate", right, y, "right");
  y += 8;

  for (let i = 0; i < nights; i += 1) {
    y += 18;
    if (y > pageH - 160) {
      doc.addPage();
      y = 80;
    }
    const night = addDays(from, i);
    value(format(night, "EEE d MMM yyyy"), M, y, 10);
    value(`$${nightlyRate}`, right, y, 10, "right");
  }

  y += 18;
  rule(y);
  y += 24;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
  doc.text(`$${nightlyRate} per night x ${nights} ${nights === 1 ? "night" : "nights"}`, M, y);
  label("Total", right - 70, y, "right");
  doc.setFontSize(16).setTextColor(...INK);
  doc.text(`$${total}`, right, y + 2, { align: "right" });

  // Cancellation policy
  y += 40;
  if (y > pageH - 170) {
    doc.addPage();
    y = 80;
  }
  rule(y);
  y += 26;
  label("Cancellation policy", M, y);
  const policy = cancellationPolicy;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
  policy.forEach((line, i) => {
    doc.text(`•  ${line}`, M, y + 18 + i * 15, { maxWidth: right - M });
  });

  // Footer
  doc.setFontSize(8).setTextColor(...MUTED);
  doc.text(
    "Wild Haven - this receipt confirms your reservation request. Taxes and fees are confirmed by email.",
    M,
    pageH - 48,
    { maxWidth: right - M }
  );

  doc.save(`wild-haven-receipt-${data.reference}.pdf`);
};
