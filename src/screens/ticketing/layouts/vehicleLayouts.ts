export type LayoutType = "driver" | "3-seat" | "4-seat" | "rear";

export interface SeatRow {
  type: LayoutType;
  seats: number[];
}

export interface VehicleLayout {
  code: string;
  name: string;
  capacity: number;
  rows: SeatRow[];
}

export const HIACE_11: VehicleLayout = {
  code: "HIACE_11",
  name: "Toyota Hiace 11 Seater",
  capacity: 11,
  rows: [
    { type: "driver", seats: [1] },
    { type: "3-seat", seats: [2, 3, 4] },
    { type: "3-seat", seats: [5, 6, 7] },
    { type: "3-seat", seats: [8, 9, 10] },
  ],
};

export const HIACE_14: VehicleLayout = {
  code: 'HIACE_14',
  name: 'Toyota Hiace 14 Seater',
  capacity: 14,
  rows: [
    {
      type: 'driver',
      seats: [1],
    },
    {
      type: '3-seat',
      seats: [2, 3, 4],
    },
    {
      type: '3-seat',
      seats: [5, 6, 7],
    },
    {
      type: '3-seat',
      seats: [8, 9, 10],
    },
    {
      type: '3-seat',
      seats: [11, 12, 13],
    },
    {
      type: 'rear',
      seats: [14],
    },
  ],
};

export const BUS_25: VehicleLayout = {
  code: "BUS_25",
  name: "25 Seater",
  capacity: 25,
  rows: [
    { type: "driver", seats: [1, 2] },
    { type: "4-seat", seats: [3, 4, 5, 6] },
    { type: "4-seat", seats: [7, 8, 9, 10] },
    { type: "4-seat", seats: [11, 12, 13, 14] },
    { type: "4-seat", seats: [15, 16, 17, 18] },
    { type: "4-seat", seats: [19, 20, 21, 22] },
    { type: "3-seat", seats: [23, 24, 25] },
  ],
};

export const BUS_33: VehicleLayout = {
  code: "BUS_33",
  name: "33 Seater",
  capacity: 33,
  rows: [
    { type: "driver", seats: [1, 2] },

    { type: "4-seat", seats: [3, 4, 5, 6] },
    { type: "4-seat", seats: [7, 8, 9, 10] },
    { type: "4-seat", seats: [11, 12, 13, 14] },
    { type: "4-seat", seats: [15, 16, 17, 18] },
    { type: "4-seat", seats: [19, 20, 21, 22] },
    { type: "4-seat", seats: [23, 24, 25, 26] },
    { type: "4-seat", seats: [27, 28, 29, 30] },

    { type: "3-seat", seats: [31, 32, 33] },
  ],
};

export const BUS_49: VehicleLayout = {
  code: "BUS_49",
  name: "49 Seater Coach",
  capacity: 49,
  rows: [
    { type: "driver", seats: [1, 2] },

    { type: "4-seat", seats: [3, 4, 5, 6] },
    { type: "4-seat", seats: [7, 8, 9, 10] },
    { type: "4-seat", seats: [11, 12, 13, 14] },
    { type: "4-seat", seats: [15, 16, 17, 18] },
    { type: "4-seat", seats: [19, 20, 21, 22] },
    { type: "4-seat", seats: [23, 24, 25, 26] },
    { type: "4-seat", seats: [27, 28, 29, 30] },
    { type: "4-seat", seats: [31, 32, 33, 34] },
    { type: "4-seat", seats: [35, 36, 37, 38] },
    { type: "4-seat", seats: [39, 40, 41, 42] },
    { type: "4-seat", seats: [43, 44, 45, 46] },

    { type: "3-seat", seats: [47, 48, 49] },
  ],
};

export const BUS_51: VehicleLayout = {
  code: "BUS_51",
  name: "51 Seater Coach",
  capacity: 51,
  rows: [
    { type: "driver", seats: [1, 2] },

    { type: "4-seat", seats: [3, 4, 5, 6] },
    { type: "4-seat", seats: [7, 8, 9, 10] },
    { type: "4-seat", seats: [11, 12, 13, 14] },
    { type: "4-seat", seats: [15, 16, 17, 18] },
    { type: "4-seat", seats: [19, 20, 21, 22] },
    { type: "4-seat", seats: [23, 24, 25, 26] },
    { type: "4-seat", seats: [27, 28, 29, 30] },
    { type: "4-seat", seats: [31, 32, 33, 34] },
    { type: "4-seat", seats: [35, 36, 37, 38] },
    { type: "4-seat", seats: [39, 40, 41, 42] },
    { type: "4-seat", seats: [43, 44, 45, 46] },
    { type: "3-seat", seats: [47, 48, 49] },
    { type: "driver", seats: [50, 51] },
  ],
};

export const VEHICLE_LAYOUTS: Record<string, VehicleLayout> = {
  HIACE_11,
  HIACE_14,
  BUS_25,
  BUS_33,
  BUS_49,
  BUS_51,
};

export const getVehicleLayout = (
  code: string,
): VehicleLayout => {
  return VEHICLE_LAYOUTS[code] ?? HIACE_14;
};