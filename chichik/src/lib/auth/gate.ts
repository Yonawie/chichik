/** Lightweight cookie so proxy can skip a profiles round-trip on every navigation. */

export const GATE_COOKIE = "chichik_gate";

export type GateInfo = {
  onboardingCompleted: boolean;
  role: "student" | "admin";
};

export function encodeGate(onboardingCompleted: boolean, role: "student" | "admin"): string {
  return `${onboardingCompleted ? "1" : "0"}:${role === "admin" ? "a" : "s"}`;
}

export function parseGate(value: string | undefined): GateInfo | null {
  if (!value) return null;
  const [o, r] = value.split(":");
  if (o !== "0" && o !== "1") return null;
  if (r !== "a" && r !== "s") return null;
  return {
    onboardingCompleted: o === "1",
    role: r === "a" ? "admin" : "student",
  };
}

export const GATE_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30,
};
