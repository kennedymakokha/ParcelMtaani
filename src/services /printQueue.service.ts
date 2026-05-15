import AsyncStorage from '@react-native-async-storage/async-storage';
import { printToPrinter } from './printer.service';

const STORAGE_KEY = 'pending_print_jobs';

export interface PrintJob {
  id: string;
  printerMac: string;
  receiptText: string;
  qrData: string;
  createdAt: string;
}

export const addPrintJob = async (
  job: PrintJob,
) => {
  const existing = await AsyncStorage.getItem(
    STORAGE_KEY,
  );

  const jobs: PrintJob[] = existing
    ? JSON.parse(existing)
    : [];

  jobs.push(job);

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(jobs),
  );
};

export const removePrintJob = async (
  id: string,
) => {
  const existing = await AsyncStorage.getItem(
    STORAGE_KEY,
  );

  const jobs: PrintJob[] = existing
    ? JSON.parse(existing)
    : [];

  const updated = jobs.filter(
    job => job.id !== id,
  );

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated),
  );
};

export const retryPendingPrints = async (
  onPrinted?: (job: PrintJob) => void,
) => {
  const existing = await AsyncStorage.getItem(
    STORAGE_KEY,
  );

  const jobs: PrintJob[] = existing
    ? JSON.parse(existing)
    : [];

  for (const job of jobs) {
    try {
      const printed = await printToPrinter(
        job.printerMac,
        job.receiptText,
      );

      if (printed) {
        await removePrintJob(job.id);

        onPrinted?.(job);

        console.log(
          'Recovered print successful',
        );
      }
    } catch (err) {
      console.log(
        'Recovered print failed',
        err,
      );
    }
  }
};