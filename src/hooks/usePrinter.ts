import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePrinter = () => {
  const [selectedPrinterMac, setSelectedPrinterMac] = useState<string | null>(
    null,
  );

  const [showPrinterModal, setShowPrinterModal] = useState(false);

  useEffect(() => {
    loadPrinter();
  }, []);

  const loadPrinter = async () => {
    const saved = await AsyncStorage.getItem('SELECTED_PRINTER_MAC');

    if (saved) {
      setSelectedPrinterMac(saved);
    }
  };

  const selectPrinter = async (mac: string) => {
    setSelectedPrinterMac(mac);

    await AsyncStorage.setItem('SELECTED_PRINTER_MAC', mac);

    setShowPrinterModal(false);
  };

  return {
    selectedPrinterMac,
    showPrinterModal,
    setShowPrinterModal,
    selectPrinter,
  };
};