import { UserRole } from "../../../types";

export const drawerConfig: Record<UserRole, { label: string; icon: string; screen: string }[]> = {
  superAdmin: [
    { label: "Dashboard", icon: "stats-chart", screen: "Dashboard" },
    { label: "Parcel Intake", icon: "cube-outline", screen: "Parcel Intake" },
    { label: "On Receiving", icon: "qr-code-outline", screen: "On Receiving" },
    { label: "Delivery", icon: "car-outline", screen: "Delivery" },
    { label: "Reports", icon: "document-text-outline", screen: "Reports" },
  ],
  staff: [
    { label: "Parcel Intake", icon: "cube-outline", screen: "Parcel Intake" },
    { label: "On Receiving", icon: "qr-code-outline", screen: "On Receiving" },
  ],
  agent: [
    { label: "Delivery", icon: "car-outline", screen: "Delivery" },
  ],
  customer: [
    { label: "My Parcels", icon: "cube-outline", screen: "CustomerParcels" },
    { label: "Track Parcel", icon: "search-outline", screen: "TrackParcel" },
  ],
};
