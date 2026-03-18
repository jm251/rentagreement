import type { StateLawConfig } from "@/types/agreement";

const genericLaw = (state: string) =>
  `This agreement shall be governed by the applicable rent, tenancy, leave and license, or related laws in force in the State of ${state}, along with other applicable laws of India.`;

export const STATE_LAW_MAP: Record<string, StateLawConfig> = {
  AN: { code: "AN", name: "Andaman and Nicobar Islands", governingLaw: genericLaw("Andaman and Nicobar Islands") },
  AP: { code: "AP", name: "Andhra Pradesh", governingLaw: genericLaw("Andhra Pradesh") },
  AR: { code: "AR", name: "Arunachal Pradesh", governingLaw: genericLaw("Arunachal Pradesh") },
  AS: { code: "AS", name: "Assam", governingLaw: genericLaw("Assam") },
  BR: { code: "BR", name: "Bihar", governingLaw: genericLaw("Bihar") },
  CH: { code: "CH", name: "Chandigarh", governingLaw: genericLaw("Chandigarh") },
  CG: { code: "CG", name: "Chhattisgarh", governingLaw: genericLaw("Chhattisgarh") },
  DN: { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", governingLaw: genericLaw("Dadra and Nagar Haveli and Daman and Diu") },
  DL: { code: "DL", name: "Delhi", governingLaw: genericLaw("Delhi") },
  GA: { code: "GA", name: "Goa", governingLaw: genericLaw("Goa") },
  GJ: { code: "GJ", name: "Gujarat", governingLaw: genericLaw("Gujarat") },
  HR: { code: "HR", name: "Haryana", governingLaw: genericLaw("Haryana") },
  HP: { code: "HP", name: "Himachal Pradesh", governingLaw: genericLaw("Himachal Pradesh") },
  JK: { code: "JK", name: "Jammu and Kashmir", governingLaw: genericLaw("Jammu and Kashmir") },
  JH: { code: "JH", name: "Jharkhand", governingLaw: genericLaw("Jharkhand") },
  KA: { code: "KA", name: "Karnataka", governingLaw: genericLaw("Karnataka") },
  KL: { code: "KL", name: "Kerala", governingLaw: genericLaw("Kerala") },
  LA: { code: "LA", name: "Ladakh", governingLaw: genericLaw("Ladakh") },
  LD: { code: "LD", name: "Lakshadweep", governingLaw: genericLaw("Lakshadweep") },
  MP: { code: "MP", name: "Madhya Pradesh", governingLaw: genericLaw("Madhya Pradesh") },
  MH: { code: "MH", name: "Maharashtra", governingLaw: genericLaw("Maharashtra"), agreementHeading: "LEAVE AND LICENSE AGREEMENT" },
  MN: { code: "MN", name: "Manipur", governingLaw: genericLaw("Manipur") },
  ML: { code: "ML", name: "Meghalaya", governingLaw: genericLaw("Meghalaya") },
  MZ: { code: "MZ", name: "Mizoram", governingLaw: genericLaw("Mizoram") },
  NL: { code: "NL", name: "Nagaland", governingLaw: genericLaw("Nagaland") },
  OD: { code: "OD", name: "Odisha", governingLaw: genericLaw("Odisha") },
  PY: { code: "PY", name: "Puducherry", governingLaw: genericLaw("Puducherry") },
  PB: { code: "PB", name: "Punjab", governingLaw: genericLaw("Punjab") },
  RJ: { code: "RJ", name: "Rajasthan", governingLaw: genericLaw("Rajasthan") },
  SK: { code: "SK", name: "Sikkim", governingLaw: genericLaw("Sikkim") },
  TN: { code: "TN", name: "Tamil Nadu", governingLaw: genericLaw("Tamil Nadu") },
  TS: { code: "TS", name: "Telangana", governingLaw: genericLaw("Telangana") },
  TR: { code: "TR", name: "Tripura", governingLaw: genericLaw("Tripura") },
  UP: { code: "UP", name: "Uttar Pradesh", governingLaw: genericLaw("Uttar Pradesh") },
  UK: { code: "UK", name: "Uttarakhand", governingLaw: genericLaw("Uttarakhand") },
  WB: { code: "WB", name: "West Bengal", governingLaw: genericLaw("West Bengal") },
};

export const UNKNOWN_STATE_LAW: StateLawConfig = {
  code: "UN",
  name: "Unknown",
  governingLaw:
    "This agreement shall be governed by the applicable rent, tenancy, leave and license, or related laws in force in the relevant State or Union Territory, along with other applicable laws of India.",
};
