export const MOBILE_NUMBER_PATTERN = "^[6-9][0-9]{9}$";
export const MOBILE_NUMBER_REGEX = /^[6-9][0-9]{9}$/;
export const MOBILE_NUMBER_ERROR = "Enter a valid 10-digit mobile number.";

export const digitsOnly = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

export const mobileInputProps = {
  type: "tel",
  inputMode: "numeric",
  maxLength: 10,
  pattern: MOBILE_NUMBER_PATTERN,
  autoComplete: "tel"
};
