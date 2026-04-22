export function getShortCode(location:string) {
  switch (location) {
    case "Kitale(Hindu Temple)":
      return "KTL(HT)";
    case "Kitale(Museum Point)":
      return "KTL(MP)";
    case "Eldoret(Kiteleele Stop)":
      return "ELD(KS)";
    case "Nairobi(Museum Point)":
      return "NRB(MP)";
    case "Nairobi(Gikomba)":
      return "NRB(GK)";
    case "Nairobi(Eastleigh)":
      return "NRB(EL)";
    default:
      return "";
  }
}