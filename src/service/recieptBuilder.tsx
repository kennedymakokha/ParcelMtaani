
import { FormatDate } from '../utils/dates.utils';

export const buildReceiptText = ({
  receiptNo,
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
  printDate,
  mpesaData,
  phoneNumber,
  user,
  customerPin,
  business,
}: any) => {
  const width = 32;
  const line = '-'.repeat(width) + '\n';

  const center = (str: string) => {
    const text = String(str || '').toUpperCase();
    const space = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(space) + text + '\n';
  };

  const formatLine = (label: string, value: any) => {
    const val = String(value ?? '');
    return label.padEnd(width - val.length) + val + '\n';
  };

  const formatMoney = (num: any) => Number(num || 0).toFixed(2);

  const paymentLabel =
    paidMpesa > 0 && paidCash > 0
      ? 'MPESA/CASH (SPLIT)'
      : method;

  const totalAmount = Number(
    totals?.finalTotal ||
      totals?.total ||
      parcel?.price ||
      0,
  );

  const net = Number(totalAmount / 1.16);
  const vat = Number(totalAmount - net);

  /**
   * =========================
   * BUSINESS HEADER (FIXED)
   * =========================
   */
  let text = '';

  const businessName =
    business?.business_name ||
    user?.business?.business_name ||
    user?.businessName ||
    '';

  const businessAddress =
    business?.postal_address ||
    user?.business?.postal_address;

  const businessPhone =
    business?.phone_number ||
    user?.business?.phone_number;

  if (businessName) text += center(businessName);
  if (businessAddress) text += center(businessAddress);
  if (businessPhone) text += center(`TEL: ${businessPhone}`);

  text += line;

  text += `Receipt No: ${receiptNo}\n`;
  text += `Payment: ${paymentLabel}\n`;

  if (customerPin) {
    text += `Customer PIN: ${customerPin.toUpperCase()}\n`;
  }

  /**
   * MPESA
   */
  if (mpesaData?.receiptNumber) {
    text += `Trans ID: ${mpesaData.receiptNumber}\n`;
    text += `Paid via: ${mpesaData?.phoneNumber || phoneNumber}\n`;
  }

  const displayDate = mpesaData?.transactionDate
    ? FormatDate(`${mpesaData.transactionDate}`)
    : new Date(printDate).toLocaleString()||new Date().toLocaleString();

  text += `Date: ${displayDate}\n`;

  text += line;

  /**
   * SENDER
   */
  text += `SENDER\n`;
  text += `Name: ${sender?.name || ''}\n`;
  text += `Phone: ${sender?.phone || ''}\n`;

  text += line;

  /**
   * RECEIVER
   */
  text += `RECEIVER\n`;
  text += `Name: ${reciever?.name || ''}\n`;
  text += `Phone: ${reciever?.phone || ''}\n`;

  text += line;

  /**
   * PARCEL (FIXED WEIGHT)
   */
  text += `PARCEL\n`;

  if (parcel?.fragile) {
    text += '*** FRAGILE ITEM ***\n';
  }

  const weight =
    parcel?.weight ? `${parcel.weight} kg` : 'N/A';

  text += formatLine('Weight (kg)', weight);
  // text += formatLine('From', from || '');
  text += formatLine('Pickup:', pickupName || '');

  if (parcel?.instructions) {
    text += `Notes: ${parcel.instructions}\n`;
  }

  text += line;

  /**
   * TOTALS
   */
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

  text += center('THANK YOU FOR YOUR BUSINESS');

  if (user?.name) {
    text += center(`SERVED BY: ${user.name}`);
  }

  return text;
};