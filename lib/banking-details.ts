export interface BankingDetail {
  label: string
  value: string
}

const DEFAULT_BANKING_DETAILS: BankingDetail[] = [
  { label: 'Account Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd' },
  { label: 'Account Number', value: '99094 0006 439' },
  { label: 'Name of Bank', value: 'First Global Bank' },
  { label: 'Branch', value: 'Ocho Rios' },
  { label: 'Branch Code', value: '99094' },
  { label: 'Account Type', value: 'Savings' },
]

const BHC_BANKING_DETAILS: BankingDetail[] = [
  { label: 'Account Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd' },
  { label: 'Account Number', value: '9909 4000 6439 (Savings)' },
  { label: 'Name of Bank', value: 'First Global Bank' },
  { label: 'Address of Bank', value: '28-48 Barbados Avenue, Kingston 5' },
  { label: 'Sort Code', value: '99094' },
  { label: 'Swift', value: 'FILBJMKN' },
]

const BHC_COMPANY_PATTERNS = [
  /\bbritish\s+high\s+commission\b/,
  /\bbritish\s+high\s+commision\b/,
  /\bbritish\s+high\s+comission\b/,
]

export function isBritishHighCommissionClient(companyName?: string | null) {
  const normalizedCompanyName = (companyName || '').trim().toLowerCase()

  return BHC_COMPANY_PATTERNS.some((pattern) => pattern.test(normalizedCompanyName))
}

export function getBankingDetails(companyName?: string | null): BankingDetail[] {
  return isBritishHighCommissionClient(companyName) ? BHC_BANKING_DETAILS : DEFAULT_BANKING_DETAILS
}
