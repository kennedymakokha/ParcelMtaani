export interface TicketReceiptParams {
  business: {
    name: string;
    phone?: string;
    address?: string;
  };

  ticket: {
    ticketNumber: string;
    createdAt: string;
  };

  passenger: {
    fullName: string;
    phone: string;
    nationalId?: string;
  };

  journey: {
    from: string;
    destination: string;
    vehicle: string;
    trip: string;
    departureTime: string;
    fare: number;
  };

  seat: {
    seatNo: number;
  };

  payment: {
    method: string;
    amount: number;
    receiptNumber?: string;
  };

  luggage: number;
}

export const buildTicketReceipt = ({
  business,
  ticket,
  passenger,
  journey,
  seat,
  payment,
  luggage,
}: TicketReceiptParams) => {
  const line =
    '--------------------------------';

  return `
        ${business.name.toUpperCase()}
${business.address ?? ''}
Tel: ${business.phone ?? ''}

${line}

PASSENGER TICKET

${line}

Ticket No : ${ticket.ticketNumber}

Date      : ${new Date(
    ticket.createdAt,
).toLocaleString()}

${line}

Passenger : ${passenger.fullName}

Phone     : ${passenger.phone}

ID        : ${passenger.nationalId ?? '--'}

${line}

FROM      : ${journey.from}

TO        : ${journey.destination}

Vehicle   : ${journey.vehicle}

Trip      : ${journey.trip}

Departure : ${journey.departureTime}

Seat      : ${seat.seatNo}

${line}

Fare      : KES ${payment.amount}

Payment   : ${payment.method}

Receipt   : ${payment.receiptNumber ?? '--'}

${line}

Luggage   : ${luggage}

${line}

Please arrive 30 minutes
before departure.

Keep this ticket safe.

Thank you for travelling
with ${business.name}.

${line}


`;
};