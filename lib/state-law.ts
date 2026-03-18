import { STATE_LAW_MAP, UNKNOWN_STATE_LAW } from "@/data/state-law-map";
import { resolveStateCodeFromPincode } from "@/lib/pincode";
import type { StateLawConfig } from "@/types/agreement";

export function getStateLawConfig(
  pincode?: string | null,
  explicitState?: string | null,
): StateLawConfig {
  const code = pincode ? resolveStateCodeFromPincode(pincode) : null;

  if (code && STATE_LAW_MAP[code]) {
    return STATE_LAW_MAP[code];
  }

  if (explicitState) {
    const matched = Object.values(STATE_LAW_MAP).find(
      (entry) => entry.name.toLowerCase() === explicitState.toLowerCase().trim(),
    );

    if (matched) return matched;

    return {
      code: "UN",
      name: explicitState,
      governingLaw: `This agreement shall be governed by the applicable rent, tenancy, leave and license, or related laws in force in the State of ${explicitState}, along with other applicable laws of India.`,
    };
  }

  return UNKNOWN_STATE_LAW;
}
