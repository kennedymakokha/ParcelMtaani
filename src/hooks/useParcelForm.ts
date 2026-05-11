import { useState } from 'react';
import { ParcelFormState } from '../../types';

export const useParcelForm = (user: any) => {
  const [formData, setFormData] =
    useState<ParcelFormState>({
      sender: {
        name: '',
        phone: '',
        address: '',
      },

      receiver: {
        name: '',
        phone: '',
        address: '',
      },

      parcel: {
        weight: '',
        instructions: '',
        destination: 'pickup',
        pickup: '',
        code: '',
        sentFrom: user.pickup?._id || '',
        price: '',
        fragile: false,
      },
    });

  const updateField = (
    section: any,
    field: any,
    value: any,
  ) => {
    setFormData((prev:any) => ({
      ...prev,

      [section]: {
        ...prev[section],

        [field]: value,
      },
    }));
  };

  return {
    formData,
    setFormData,
    updateField,
  };
};