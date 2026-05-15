import type { Client, Invoice, Settings } from '@/types';
import { formatCurrency } from './currency';

export function openInvoicePrintWindow(invoice: Invoice, client: Client | undefined, settings: Settings): boolean {
  const branding = settings.invoiceBranding || {};
  const businessName = branding.businessName || settings.name || 'ProSource';
  const currency = invoice.currency || settings.currency;
  const lineItems = invoice.products || [];
  const subtotal = invoice.subtotal || lineItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = invoice.discAmt || 0;
  const tax = invoice.taxAmt || 0;
  const total = invoice.total || subtotal - discount + tax;

  const itemsHtml = lineItems.length
    ? lineItems
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(item.name)}</td>
              <td class="right">${item.qty}</td>
              <td>${escapeHtml(item.unit)}</td>
              <td class="right">${formatCurrency(item.price, currency)}</td>
              <td class="right">${formatCurrency(item.qty * item.price, currency)}</td>
            </tr>
          `
        )
        .join('')
    : `<tr><td colspan="6" class="empty">No line items were added to this invoice.</td></tr>`;

  const opened = window.open('', '_blank', 'width=1100,height=1400');
  if (!opened) return false;

  opened.document.open();
  opened.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${escapeHtml(invoice.num)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 28px;
      font-family: Inter, Arial, sans-serif;
      color: #111827;
      background: #f7f7f8;
    }
    .sheet {
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 20px 60px rgba(0,0,0,.08);
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .logo {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      object-fit: cover;
      border: 1px solid #e5e7eb;
      background: #fafafa;
    }
    .brand h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.1;
    }
    .muted { color: #6b7280; }
    .meta {
      text-align: right;
      min-width: 240px;
      font-size: 14px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      overflow: hidden;
      border-radius: 12px;
    }
    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 12px 10px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #f3f4f6;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #374151;
    }
    .right { text-align: right; }
    .summary {
      margin-top: 18px;
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 18px;
      align-items: start;
    }
    .totals { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-row.total {
      border-top: 1px solid #e5e7eb;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
    }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px dashed #d1d5db;
      font-size: 13px;
      color: #4b5563;
    }
    .empty { text-align: center; color: #6b7280; padding: 20px; }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { border: none; border-radius: 0; box-shadow: none; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand">
        ${branding.logoUrl ? `<img class="logo" src="${escapeAttr(branding.logoUrl)}" alt="Logo" />` : ''}
        <div>
          <h1>${escapeHtml(businessName)}</h1>
          <div class="muted" style="margin-top:6px; line-height:1.6">
            ${branding.address ? `<div>${escapeHtml(branding.address)}</div>` : ''}
            ${branding.phone ? `<div>Phone: ${escapeHtml(branding.phone)}</div>` : ''}
            ${branding.email ? `<div>Email: ${escapeHtml(branding.email)}</div>` : ''}
            ${branding.website ? `<div>Web: ${escapeHtml(branding.website)}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="meta">
        <div class="label">Invoice</div>
        <div class="value">${escapeHtml(invoice.num)}</div>
        <div style="height:10px"></div>
        <div><span class="label">Issue</span><div class="value" style="font-size:14px">${escapeHtml(invoice.issueDate)}</div></div>
        <div style="height:8px"></div>
        <div><span class="label">Due</span><div class="value" style="font-size:14px">${escapeHtml(invoice.dueDate)}</div></div>
      </div>
    </div>

    <div class="card grid">
      <div>
        <div class="label">Bill To</div>
        <div class="value">${escapeHtml(client?.name || 'Unknown Client')}</div>
        ${client?.company ? `<div class="muted">${escapeHtml(client.company)}</div>` : ''}
        ${client?.phone ? `<div class="muted">${escapeHtml(client.phone)}</div>` : ''}
        ${client?.email ? `<div class="muted">${escapeHtml(client.email)}</div>` : ''}
      </div>
      <div>
        <div class="label">Invoice Notes</div>
        <div class="value" style="font-weight:500; white-space:pre-wrap">${escapeHtml(invoice.notes || branding.footerNote || 'Thank you for your business.')}</div>
      </div>
    </div>

    <div class="card">
      <div class="label">Line Items</div>
      <table>
        <thead>
          <tr>
            <th style="width:48px">#</th>
            <th>Description</th>
            <th class="right" style="width:90px">Qty</th>
            <th style="width:100px">Unit</th>
            <th class="right" style="width:140px">Price</th>
            <th class="right" style="width:150px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <div class="summary">
      <div class="card">
        <div class="label">Payment Status</div>
        <div class="value">${escapeHtml(invoice.payStatus.toUpperCase())}</div>
        <div style="margin-top:12px" class="muted">
          ${branding.footerNote ? escapeHtml(branding.footerNote) : 'Professional invoice generated by ProSource CRM.'}
        </div>
      </div>
      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal, currency)}</span></div>
        <div class="totals-row"><span>Discount</span><span>${formatCurrency(discount, currency)}</span></div>
        <div class="totals-row"><span>Tax</span><span>${formatCurrency(tax, currency)}</span></div>
        <div class="totals-row total"><span>Total</span><span>${formatCurrency(total, currency)}</span></div>
      </div>
    </div>

    <div class="footer">
      ${branding.footerNote ? escapeHtml(branding.footerNote) : 'This invoice is computer-generated and valid without signature.'}
    </div>
  </div>
  <script>
    window.onload = () => { window.focus(); window.print(); };
  </script>
</body>
</html>
  `);
  opened.document.close();
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replaceAll('`', '&#96;');
}
