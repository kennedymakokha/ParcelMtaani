export const buildReceiptText = ({
  receiptNo,
  invoiceId,
  sender,
  reciever,
  parcel,
  method = 'CASH',
  paid = 0,
  paidCash = 0,
  paidMpesa = 0,
  totals = {},
  changeDue = 0,
  from,
  pickupName,
  mpesaData,
  phoneNumber,
  user,
  customerPin,
}: any) => {
  const width = 32;
  const line = '-'.repeat(width) + '\n';

  const center = (str: string) => {
    const space = Math.max(0, Math.floor((width - str.length) / 2));
    return ' '.repeat(space) + str + '\n';
  };

  const formatLine = (label: string, value: any) => {
    const val = String(value ?? '');
    return label.padEnd(width - val.length) + val + '\n';
  };

  const formatMoney = (num: any) => Number(num || 0).toFixed(2);

  const paymentLabel =
    paidMpesa > 0 && paidCash > 0 ? 'MPESA/CASH (SPLIT)' : method;

  const totalAmount = Number(totals?.finalTotal || parcel?.price || 0);
  const net = Number(totals?.subtotal || totalAmount / 1.16);
  const vat = Number(totals?.tax || totalAmount - net);

  let text = '';

  // Header
  text += `Receipt No: ${receiptNo}\n`;
  text += `Invoice ID: ${invoiceId}\n`;
  text += `Payment: ${paymentLabel}\n`;

  if (customerPin) {
    text += `Customer PIN: ${customerPin.toUpperCase()}\n`;
  }

  if (mpesaData?.receiptNumber) {
    text += `Trans ID: ${mpesaData.receiptNumber}\n`;
    text += `Paid via: ${phoneNumber}\n`;
  }

  text += `Date: ${new Date().toLocaleString()}\n`;

  // Sender / Receiver
  text += line;
  text += `SENDER\n`;
  text += `Name: ${sender?.name || ''}\n`;
  text += `Phone: ${sender?.phone || ''}\n`;

  text += line;
  text += `RECEIVER\n`;
  text += `Name: ${reciever?.name || ''}\n`;
  text += `Phone: ${reciever?.phone || ''}\n`;

  // Parcel Info
  text += line;
  text += `PARCEL\n`;
  text += formatLine('Weight (kg)', parcel?.weight || '');
  text += formatLine('From', from || '');
  text += formatLine('Pickup Point', pickupName || '');

  if (parcel?.instructions) {
    text += `Notes: ${parcel.instructions}\n`;
  }

  text += line;

  // Pricing
  if (parcel?.price) {
    text += formatLine('Delivery Fee', formatMoney(parcel.price));
  }

  text += line;

  text += formatLine('TOTAL', formatMoney(totalAmount));
  text += line;

  if (customerPin) {
    text += formatLine('Net (Excl VAT)', formatMoney(net));
    text += formatLine('VAT (16%)', formatMoney(vat));
    text += line;
  }

  if (paidCash) {
    text += formatLine('Cash', formatMoney(paidCash));
  }

  if (paidMpesa) {
    text += formatLine('Mpesa', formatMoney(paidMpesa));
  }

  if (paid) {
    text += formatLine('Amount Paid', formatMoney(paid));
  }

  text += formatLine('Change', formatMoney(changeDue));
  text += line;

  // Footer
  text += center('Prices VAT Inclusive');
  text += center('Thank You!');

  if (user?.name) {
    text += center(`Served by: ${user.name}`);
  }

  return text;
};