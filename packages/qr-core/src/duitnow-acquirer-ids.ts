/**
 * PayNet DuitNow Acquirer ID to Bank/E-Wallet name mapping.
 * Source: PayNet Acquirer ID (ID "01"), scraped 12 Nov 2026.
 * https://docs.paynet.my/docs/duitnow-qr/merchant-presented-qr/qr-data-object#acquirer-id-id-01
 */
export const ACQUIRER_ID_TO_BANK: Record<string, string> = {
  "420709": "Bank Simpanan Nasional",
  "432134": "Al Rajhi Banking & Investment Corporation (Malaysia) Berhad",
  "432310": "MBSB Bank Berhad",
  "501664": "Affin Bank Berhad",
  "501854": "CIMB Bank Berhad",
  "504324": "OCBC Bank Berhad",
  "504374": "Alliance Bank Malaysia Berhad",
  "519469": "United Overseas Bank Berhad",
  "539981": "Standard Chartered Bank Malaysia Berhad",
  "564160": "RHB Bank Berhad",
  "564162": "Public Bank Berhad",
  "564167": "Bank Muamalat Malaysia Berhad",
  "564169": "Ambank Malaysia Berhad",
  "588734": "Maybank Berhad",
  "588830": "Hong Leong Bank Berhad",
  "589170": "Citibank Berhad",
  "589267": "Bank Kerjasama Rakyat Malaysia Berhad",
  "589373": "Bank Pertanian Malaysia Berhad (Agrobank)",
  "589836": "HSBC Bank Malaysia Berhad",
  "603346": "Bank Islam Malaysia Berhad",
  "629152": "Bank of China (M) Berhad",
  "629188": "Bank of America (M) Berhad",
  "629196": "MUFG Bank (Malaysia) Berhad",
  "629204": "BNP Paribas Malaysia Berhad",
  "629212": "JP Morgan Chase Bank Berhad",
  "629220": "Mizuho Bank (Malaysia) Berhad",
  "629238": "Sumitomo Mitsui Banking Corporation (M) Berhad",
  "629246": "Deutsche Bank (Malaysia) Berhad",
  "629253": "Industrial and Commercial Bank of China (M) Berhad",
  "629261": "China Construction Bank (Malaysia) Berhad",
  "629279": "GX Bank Berhad (GXBank)",
  "629287": "YTL Digital Bank Berhad (Ryt Bank)",
  "629295": "AEON Bank (M) Berhad",
  "629303": "Boost Bank Berhad",
  "629311": "KAF Digital Bank Berhad",
  "639406": "Kuwait Finance House (Malaysia) Berhad",
  "890004": "ShopeePay Malaysia Sdn. Bhd.",
  "890012": "BigPay Malaysia Sdn Bhd",
  "890020": "Fave Asia Technologies Sdn Bhd",
  "890038": "Finexus Cards Sdn Bhd",
  "890046": "GPay Network (M) Sdn Bhd",
  "890053": "TNG Digital Sdn Bhd",
  "890061": "Axiata Digital eCode Sdn Bhd",
  "890079": "iPay88 (M) Sdn Bhd",
  "890087": "Razer Merchant Services Sdn Bhd",
  "890095": "Revenue Solution Sdn Bhd",
  "890103": "GHL Cardpay Sdn Bhd",
  "890111": "Merchantrade Asia Sdn Bhd",
  "890129": "Setel Pay Sdn Bhd (formerly known as Setel Ventures Sdn Bhd)",
  "890145": "Fass Payment Solutions Sdn Bhd",
  "890160": "Razorpay Curlec Sdn Bhd",
  "890178": "Instapay Technologies Sdn. Bhd",
  "890194": "Payex PLT",
  "890202": "SiliconNet Technologies Sdn Bhd",
  "890210": "MobilityOne Sdn Bhd",
  "890228": "Koperasi Co-opbank Pertama Malaysia Berhad",
  "890236": "Beez Fintech Sdn Bhd",
  "890244": "Boost Connect Sdn Bhd",
  "890251": "UniPin (M) Sdn Bhd",
  "890269": "Paydibs Sdn Bhd",
  "890285": "2C2P System Sdn Bhd",
  "890293": "Ampersand Pay Sdn Bhd",
  "890301": "ManagePay Systems Sdn Bhd",
  "890319": "Wannapay Sdn Bhd",
  "890327": "MRuncit Commerce Sdn Bhd",
  "890335": "Bangkok Bank Berhad",
  "890350": "Wise Payments Malaysia Sdn Bhd",
  "890368": "Cardbiz Payment Services Sdn Bhd",
  "890376": "Gkash Sdn Bhd",
  "898989": "JomPAY",
};

const ACQUIRER_ID_REGEX = /^\d{4,6}$/;

/**
 * Returns bank/e-wallet name for a given Acquirer ID.
 * Only returns whitelisted names from PayNet Table 9; never returns raw input.
 */
export function getBankNameByAcquirerId(id: string): string | null {
  if (!ACQUIRER_ID_REGEX.test(id)) return null;
  return ACQUIRER_ID_TO_BANK[id] ?? null;
}
