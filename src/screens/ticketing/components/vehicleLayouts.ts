export type SeatRow =
  | {
      type: 'driver';
      seats: number[];
    }
  | {
      type: '3-seat';
      seats: number[];
    }
  | {
      type: '4-seat';
      seats: number[];
    }
  | {
      type: 'rear';
      seats: number[];
    };

export interface VehicleLayout {
  code: string;
  name: string;
  capacity: number;
  rows: SeatRow[];
}