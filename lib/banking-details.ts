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

export function getBankingDetails(companyName?: string | null): BankingDetail[] {
  const normalizedCompanyName = (companyName || '').trim().toLowerCase()

  if (normalizedCompanyName.includes('british high commission')) {
    return BHC_BANKING_DETAILS
  }

  return DEFAULT_BANKING_DETAILS
}
