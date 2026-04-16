import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { getBankingDetails } from '@/lib/banking-details'
import type { ServiceContractPdfData } from '@/lib/service-contracts/pdf-data'

const colors = {
  orange: '#ff6b00',
  orangeDark: '#a64b1c',
  blue: '#2f64dd',
  blueDark: '#223f6b',
  purple: '#90709b',
  text: '#344054',
  muted: '#6b7280',
  softBorder: '#f4b56a',
  paleOrange: '#fff7ee',
  paleBlue: '#eef5ff',
  paleGreen: '#edfff1',
  line: '#d7dde8',
  white: '#ffffff',
  green: '#15803d',
}

const FOOTER_CONTACT_TEXT =
  '71 First Street, Newport Boulevard, Newport West, Kingston 11  •  Email: admin@arkmaintenance.com  •  Tel: 876-514-4020 / 876-476-1748  •  www.arkmaintenance.com'

const BENEFITS_TEXT =
  'This Service Contract entitles the customer to up to 25% discounts on repair parts and labour, as well as same day / next day emergency response at no additional cost.'

const PAGE_ONE_DEFINITION_ITEMS = (customerName: string) => [
  { term: '"Company"', meaning: 'means ARK Air Conditioning, Refrigeration & Kitchen Maintenance Limited' },
  { term: '"Customer"', meaning: `means ${customerName || 'the Customer'}` },
  { term: '"Equipment"', meaning: 'means air conditioner equipment or spare parts' },
  { term: '"Maintenance"', meaning: 'means periodical service of the equipment' },
  { term: '"Conditions"', meaning: 'means the terms and conditions of this Service and Maintenance Agreement' },
  { term: '"Fee"', meaning: 'means the monies payable for our Services' },
  {
    term: '"Services"',
    meaning: 'means any Service (equipment cleaning or repairs) that is offered, to improve functionality of equipment',
  },
]

const PAGE_TWO_SECTIONS = [
  {
    title: '2.2',
    text: 'Without prejudice to the foregoing, the Company shall at all times have sole and absolute discretion over the manner in which the service shall be carried out, notwithstanding any instruction or direction which the Customer may at any time have given.',
  },
  {
    heading: '3. Service Hours',
    title: '3.1',
    text: 'Maintenance will be performed during our regular working hours, Monday through Saturday, between 8:30 am and 6pm.',
  },
  {
    heading: '4. Exclusion & Additional Services',
    items: [
      'This Agreement does not cover parts or labour for repairs needed, and will be quoted separately.',
      'Obligation to furnish replacement parts is subject to availability of parts from normal sources of supply. If parts are unavailable or obsolete, then equipment replacement will be recommended.',
      'Since manufacturers of electrical parts provide no guarantee regarding how long parts will work, and since factors like voltage irregularities can cause an electrical part to stop working, we will not be responsible for any additional issues that might develop, after repair parts are installed, and air conditioner is confirmed to be working.',
    ],
  },
  {
    heading: "5. Customer's Responsibilities",
    title: '5.1',
    text: "The customer shall ensure that the company's personnel have full and safe access to the equipment at all times, and reserves the right to postpone services due to unsafe or unsanitary conditions. Customer is to keep equipment accessible and free from any obstructions that deters proper servicing of equipment.",
  },
  {
    heading: '6. Company Responsibilities',
    title: '6.1',
    text: "Company's work shall be free from defects in workmanship, for a period of 6 months from the date work was performed.",
  },
  {
    heading: '7. Warranties',
    items: [
      "Only the manufacturer's warranty is provided on any non-electrical part or material provided in connection with the work performed. Manufacturer's warranty ranges from 30 days to 2 years, depending on the parts purchased.",
      "Company shall not be held liable for any consequential, special, incidental or contingent damages or expense arising directly or indirectly from any defect in the parts installed, repaired, furnished in repair work. It is understood that Company is not the manufacturer of items supplied, and our clients rely solely on the warranty of the manufacturer.",
      'Company will use care when performing any service, but shall not be liable for failure to discover conditions necessitating repairs or replacements, since not all issues and defects will be immediately visible.',
    ],
  },
]

const PAGE_THREE_SECTIONS = [
  {
    heading: '8. Exclusivity',
    title: '8.1',
    text: "Company reserves the right to terminate agreement without notice or refund, if customer permits any person other than an employee or authorised representative of company, to perform service/repair on customer's equipment.",
  },
  {
    heading: '9. Non Solicitation of Services',
    paragraphs: [
      'No Employee or Contractor or Representative of the Company should solicit the Client to offer services that competes directly or indirectly with the services of the company.',
      'Client should not solicit any Employee or Contractor or Representative of the Company, to offer services that competes directly or indirectly with the services of the Company. It is best to negotiate rates directly with company, in order to guarantee desired results.',
    ],
  },
  {
    heading: '10. Termination',
    title: '10.1',
    text: 'Both the Company and the Customer can initiate termination of this maintenance contract, by giving 30 days notice in writing.',
  },
  {
    heading: '11. General',
    title: '11.1',
    text: 'These Conditions bind the Company, Customer and their respective successors and assigns.',
  },
  {
    heading: '12. Duration',
    title: '12.1',
    text: 'Agreement is effective on the date stated at the bottom of this contract, and remains in force for one (1) year, and is self renewing.',
  },
  {
    heading: '13. Payment, Charges and Fee',
    title: '13.1',
    text: 'Customer is to pay the full amount of invoices within the days negotiated. Company reserves the right to withhold service if invoices are unpaid for over 30 days.',
  },
]

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    color: colors.text,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  pageOne: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  pageInner: {
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  pageFour: {
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 205,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLogoLarge: {
    width: 128,
    height: 44,
  },
  headerLogoSmall: {
    width: 96,
    height: 33,
  },
  companyInfoLarge: {
    fontSize: 8.8,
    color: colors.muted,
    lineHeight: 1.45,
    textAlign: 'right',
  },
  companyInfoSmall: {
    fontSize: 7.9,
    color: colors.muted,
    lineHeight: 1.45,
    textAlign: 'right',
  },
  topDivider: {
    height: 1,
    backgroundColor: '#e4e7ec',
    marginTop: 16,
    marginBottom: 16,
  },
  pageHeaderFixed: {
    position: 'absolute',
    top: 16,
    left: 22,
    right: 22,
  },
  footerFixed: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 12,
    alignItems: 'center',
  },
  footerRule: {
    flexDirection: 'row',
    width: '100%',
    height: 1.5,
    marginBottom: 6,
  },
  footerRuleOrange: {
    flex: 1,
    backgroundColor: colors.orange,
  },
  footerRuleBlue: {
    flex: 1,
    backgroundColor: colors.blue,
  },
  footerContact: {
    fontSize: 7.2,
    color: '#98a2b3',
    textAlign: 'center',
  },
  footerPageNumber: {
    fontSize: 7,
    color: '#98a2b3',
    marginBottom: 3,
  },
  preparedContractRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  preparedColumn: {
    width: 190,
  },
  preparedLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.blue,
    letterSpacing: 3,
    marginBottom: 6,
  },
  preparedBox: {
    borderWidth: 1,
    borderColor: colors.softBorder,
    borderRadius: 5,
    backgroundColor: colors.paleOrange,
    paddingTop: 10,
    paddingRight: 14,
    paddingBottom: 10,
    paddingLeft: 14,
  },
  preparedName: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 3,
  },
  preparedLine: {
    fontSize: 10.9,
    color: colors.orange,
    lineHeight: 1.35,
  },
  contractColumn: {
    width: 310,
    alignItems: 'flex-end',
  },
  contractTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.orange,
    letterSpacing: 1,
    marginBottom: 10,
  },
  contractMeta: {
    fontSize: 10.8,
    color: '#98a2b3',
    lineHeight: 1.35,
    textAlign: 'right',
  },
  contractMetaValue: {
    color: '#1f2937',
    fontWeight: 700,
  },
  heroBox: {
    borderWidth: 1,
    borderColor: colors.softBorder,
    borderRadius: 5,
    backgroundColor: colors.paleOrange,
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 12,
    paddingLeft: 16,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 12.1,
    fontWeight: 700,
    color: colors.orange,
    textAlign: 'center',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  heroDivider: {
    height: 2,
    backgroundColor: colors.orange,
    marginBottom: 6,
  },
  heroAddress: {
    fontSize: 10.6,
    fontWeight: 700,
    color: colors.orange,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  introText: {
    fontSize: 10.1,
    lineHeight: 1.55,
    color: colors.text,
    marginBottom: 14,
  },
  benefitsWrap: {
    flexDirection: 'row',
    marginBottom: 14,
    borderRadius: 8,
    overflow: 'hidden',
  },
  benefitsAccent: {
    width: 7,
    backgroundColor: colors.orange,
  },
  benefitsBody: {
    flex: 1,
    backgroundColor: '#2f5bb0',
    paddingTop: 14,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 16,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 10.2,
    fontWeight: 700,
    color: '#ffe177',
    lineHeight: 1.55,
  },
  gradientBarWrap: {
    position: 'relative',
    height: 26,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  gradientBarSegments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  barOrange: {
    flex: 1.1,
    backgroundColor: colors.orange,
  },
  barPurple: {
    flex: 1.2,
    backgroundColor: colors.purple,
  },
  barBlue: {
    flex: 1.5,
    backgroundColor: colors.blue,
  },
  gradientBarLabel: {
    position: 'absolute',
    top: 6,
    left: 12,
    fontSize: 12.5,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: 1.7,
  },
  clauseHeading: {
    fontSize: 12.6,
    fontWeight: 700,
    color: colors.blueDark,
    marginBottom: 3,
  },
  clauseUnderline: {
    width: 104,
    height: 1.8,
    backgroundColor: colors.orange,
    marginBottom: 6,
  },
  clauseNumberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  clauseNumber: {
    width: 26,
    fontSize: 10.2,
    fontWeight: 700,
    color: colors.orange,
    marginTop: 1,
  },
  clauseBodyTextRow: {
    flex: 1,
    fontSize: 8.9,
    color: colors.text,
    lineHeight: 1.45,
  },
  clauseBodyText: {
    fontSize: 8.9,
    color: colors.text,
    lineHeight: 1.45,
  },
  definitionItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 16,
  },
  definitionTerm: {
    fontSize: 8.9,
    fontWeight: 700,
    color: colors.blueDark,
    marginRight: 4,
  },
  definitionText: {
    flex: 1,
    fontSize: 8.9,
    color: colors.text,
    lineHeight: 1.45,
  },
  scopeIntroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scopeColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scopeColumn: {
    width: '47.7%',
  },
  scopePoint: {
    fontSize: 7.7,
    color: colors.text,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  pageSection: {
    marginBottom: 8,
  },
  pageSectionTight: {
    marginBottom: 5,
  },
  tableHeadingWrap: {
    marginTop: 2,
    marginBottom: 8,
  },
  chargesTable: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden',
  },
  tableHeadCell: {
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 9.2,
    fontWeight: 700,
    color: colors.white,
    borderRightWidth: 1,
    borderRightColor: '#ffffff55',
  },
  tableHeadOrange: {
    backgroundColor: '#ea7b30',
  },
  tableHeadPurple: {
    backgroundColor: '#8f719a',
  },
  tableHeadBlue: {
    backgroundColor: colors.blue,
  },
  colIndex: {
    width: '5%',
    textAlign: 'center',
  },
  colDescription: {
    width: '59%',
  },
  colQty: {
    width: '9%',
    textAlign: 'center',
  },
  colUnitPrice: {
    width: '13%',
    textAlign: 'right',
  },
  colAmount: {
    width: '14%',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8.1,
    color: colors.text,
    lineHeight: 1.35,
  },
  tableCellIndex: {
    color: '#667085',
    textAlign: 'center',
  },
  tableCellQty: {
    color: '#1f2937',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCellAmount: {
    color: colors.orange,
    fontWeight: 700,
    textAlign: 'right',
  },
  tableCellUnitPrice: {
    textAlign: 'right',
  },
  totalsWrap: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 8,
  },
  totalsBox: {
    width: 154,
    borderWidth: 1,
    borderColor: '#d8dde6',
    borderRadius: 5,
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingRight: 12,
    paddingBottom: 8,
    paddingLeft: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabelMuted: {
    fontSize: 9.2,
    color: '#98a2b3',
  },
  totalValueMuted: {
    fontSize: 9.2,
    color: '#344054',
  },
  totalLabelStrong: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.orange,
  },
  totalValueStrong: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.orange,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '32.3%',
    borderWidth: 1.2,
    borderRadius: 5,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statCardBlue: {
    borderColor: colors.blue,
    backgroundColor: colors.paleBlue,
  },
  statCardOrange: {
    borderColor: colors.orange,
    backgroundColor: colors.paleOrange,
  },
  statCardGreen: {
    borderColor: '#33b36b',
    backgroundColor: colors.paleGreen,
  },
  statLabel: {
    fontSize: 7,
    color: '#98a2b3',
    letterSpacing: 1.3,
    marginBottom: 2,
  },
  statValueBlue: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.blue,
  },
  statValueOrange: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.orange,
  },
  statValueGreen: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.green,
  },
  totalCostCard: {
    borderWidth: 1.4,
    borderColor: colors.orange,
    borderRadius: 5,
    backgroundColor: colors.paleOrange,
    paddingTop: 10,
    paddingBottom: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  totalCostValue: {
    fontSize: 11.8,
    fontWeight: 700,
    color: colors.orange,
    marginBottom: 4,
  },
  totalCostSchedule: {
    fontSize: 9.2,
    fontWeight: 700,
    color: colors.blueDark,
  },
  scheduleListWrap: {
    marginTop: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  scheduleLabel: {
    fontSize: 10.8,
    fontWeight: 700,
    color: colors.orange,
    marginRight: 6,
  },
  scheduleDate: {
    fontSize: 10.8,
    fontWeight: 700,
    color: colors.blueDark,
  },
  scheduleSummary: {
    fontSize: 10.2,
    fontWeight: 700,
    color: colors.blue,
    marginTop: 6,
  },
  signaturesWrap: {
    marginBottom: 12,
  },
  signatureLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  signatureLabel: {
    fontSize: 8.8,
    color: '#1f2937',
    marginRight: 4,
  },
  signatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#475467',
    marginRight: 4,
  },
  signatureHint: {
    fontSize: 7.8,
    color: '#667085',
  },
  signatureFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureFieldLabel: {
    fontSize: 8.6,
    color: '#1f2937',
    marginRight: 3,
  },
  signatureFieldValue: {
    fontSize: 8.6,
    fontWeight: 700,
    color: '#1f2937',
  },
  signatureFieldLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#475467',
    marginLeft: 4,
  },
  signatureGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  signatureGridItemWide: {
    width: '58%',
  },
  signatureGridItemNarrow: {
    width: '32%',
  },
  bankingBox: {
    borderWidth: 1.5,
    borderColor: colors.orange,
    borderRadius: 6,
    backgroundColor: colors.paleOrange,
    paddingTop: 10,
    paddingRight: 14,
    paddingBottom: 12,
    paddingLeft: 14,
  },
  bankingTitle: {
    fontSize: 11.8,
    fontWeight: 700,
    color: colors.orangeDark,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 6,
  },
  bankingDivider: {
    height: 2,
    backgroundColor: colors.orange,
    marginBottom: 8,
  },
  bankingRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bankingLabel: {
    width: 124,
    fontSize: 8.2,
    fontWeight: 700,
    color: colors.orangeDark,
  },
  bankingValue: {
    flex: 1,
    fontSize: 8.2,
    color: '#1f2937',
  },
  fancyFooter: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 12,
  },
  professionalServicesTitle: {
    fontSize: 10.3,
    fontWeight: 700,
    color: colors.blue,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 4,
  },
  professionalServicesText: {
    fontSize: 6.6,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 1.3,
    marginBottom: 2,
  },
  professionalOrange: {
    color: colors.orange,
    fontWeight: 700,
  },
  professionalBlue: {
    color: colors.blue,
    fontWeight: 700,
  },
  imageFooterRow: {
    flexDirection: 'row',
    marginTop: 8,
    height: 98,
    borderTopWidth: 1.5,
    borderTopColor: '#eceff3',
  },
  footerImage: {
    width: '50%',
    height: '100%',
    objectFit: 'cover',
  },
  thankYouRow: {
    marginTop: 6,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 7.9,
    color: '#16a34a',
  },
})

function formatCurrency(amount: number) {
  return `JMD ${Number(amount || 0).toLocaleString('en-US')}`
}

function uppercase(input: string) {
  return String(input || '').toUpperCase()
}

function renderPreparedAddressLines(data: ServiceContractPdfData) {
  const lines = [
    data.client.company,
    ...(data.client.address_lines.length > 0 ? data.client.address_lines : [data.client.address]),
  ].filter(Boolean)

  return lines.slice(0, 4)
}

function GradientBar({ label, style }: { label: string; style?: any }) {
  return (
    <View style={[styles.gradientBarWrap, style]}>
      <View style={styles.gradientBarSegments}>
        <View style={styles.barOrange} />
        <View style={styles.barPurple} />
        <View style={styles.barBlue} />
      </View>
      <Text style={styles.gradientBarLabel}>{label}</Text>
    </View>
  )
}

function SmallHeader({ data }: { data: ServiceContractPdfData }) {
  return (
    <View style={styles.pageHeaderFixed} fixed>
      <View style={styles.headerRow}>
        <Image src={data.assets?.logo} style={styles.headerLogoSmall} />
        <View style={styles.companyInfoSmall}>
          <Text>Tel: 876-514-4020 / 876-476-1748</Text>
          <Text>admin@arkmaintenance.com</Text>
        </View>
      </View>
    </View>
  )
}

function StandardFooter() {
  return (
    <View style={styles.footerFixed} fixed>
      <Text
        style={styles.footerPageNumber}
        render={({ pageNumber, totalPages }) => `-- ${pageNumber} of ${totalPages} --`}
      />
      <View style={styles.footerRule}>
        <View style={styles.footerRuleOrange} />
        <View style={styles.footerRuleBlue} />
      </View>
      <Text style={styles.footerContact}>{FOOTER_CONTACT_TEXT}</Text>
    </View>
  )
}

function ClauseHeading({ children }: { children: string }) {
  return (
    <View>
      <Text style={styles.clauseHeading}>{children}</Text>
      <View style={styles.clauseUnderline} />
    </View>
  )
}

function NumberedParagraph({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.clauseNumberedRow}>
      <Text style={styles.clauseNumber}>{number}</Text>
      <Text style={styles.clauseBodyTextRow}>{text}</Text>
    </View>
  )
}

export const ServiceContractPdfDocument = ({ data }: { data: ServiceContractPdfData }) => {
  const preparedAddressLines = renderPreparedAddressLines(data)
  const firstHalf = Math.ceil(data.scope_of_work_points.length / 2)
  const leftPoints = data.scope_of_work_points.slice(0, firstHalf)
  const rightPoints = data.scope_of_work_points.slice(firstHalf)
  const bankingDetails = getBankingDetails(data.client.company)

  return (
    <Document>
      <Page size="A4" style={[styles.page, styles.pageOne]}>
        <View style={styles.headerRow}>
          <Image src={data.assets?.logo} style={styles.headerLogoLarge} />
          <View style={styles.companyInfoLarge}>
            <Text>Kingston: 71 First Street, Newport Blvd.</Text>
            <Text>Tel: 876-514-4020 / 876-476-1748</Text>
            <Text>Email: admin@arkmaintenance.com</Text>
            <Text>www.arkmaintenance.com</Text>
          </View>
        </View>
        <View style={styles.topDivider} />

        <View style={styles.preparedContractRow}>
          <View style={styles.preparedColumn}>
            <Text style={styles.preparedLabel}>PREPARED FOR</Text>
            <View style={styles.preparedBox}>
              <Text style={styles.preparedName}>{data.client.name}</Text>
              {preparedAddressLines.map((line) => (
                <Text key={line} style={styles.preparedLine}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.contractColumn}>
            <Text style={styles.contractTitle}>SERVICE CONTRACT</Text>
            <View style={styles.contractMeta}>
              <Text>
                Contract: <Text style={styles.contractMetaValue}>{data.contract_number}</Text>
              </Text>
              <Text>
                Date: <Text style={styles.contractMetaValue}>{data.date}</Text>
              </Text>
              <Text>
                Payment Terms: <Text style={styles.contractMetaValue}>{data.payment_terms}</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>{uppercase(data.service_description)}</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroAddress}>{uppercase(data.client.address)}</Text>
        </View>

        <Text style={styles.introText}>
          This Predictive Maintenance Service Contract is designed to ensure your Air Conditioning equipment runs efficiently and effectively,
          while prolonging its lifespan and reducing repair costs.
        </Text>

        <View style={styles.benefitsWrap}>
          <View style={styles.benefitsAccent} />
          <View style={styles.benefitsBody}>
            <Text style={styles.benefitsTitle}>CONTRACT BENEFITS</Text>
            <Text style={styles.benefitsText}>{BENEFITS_TEXT}</Text>
          </View>
        </View>

        <GradientBar label="TERMS & CONDITIONS" />

        <View style={styles.pageSection}>
          <ClauseHeading>1. Definition and Interpretation</ClauseHeading>
          <NumberedParagraph
            number="1.1"
            text="In this Agreement, the following words and expressions shall have the following meaning, except where the context otherwise requires:"
          />
          {PAGE_ONE_DEFINITION_ITEMS(data.client.company).map((item) => (
            <View key={item.term} style={styles.definitionItem}>
              <Text style={styles.definitionTerm}>{item.term}</Text>
              <Text style={styles.definitionText}>{item.meaning}</Text>
            </View>
          ))}
        </View>

        <StandardFooter />
      </Page>

      <Page size="A4" style={[styles.page, styles.pageInner]}>
        <SmallHeader data={data} />

        <View style={styles.pageSection}>
          <ClauseHeading>2. Scope of Service</ClauseHeading>
          <View style={styles.scopeIntroRow}>
            <Text style={styles.clauseNumber}>2.1</Text>
            <Text style={styles.clauseBodyText}>
              {`Our ${data.scope_of_work_points.length} Point Servicing Method Includes but is not limited to:`}
            </Text>
          </View>

          <View style={styles.scopeColumns}>
            <View style={styles.scopeColumn}>
              {leftPoints.map((point, index) => (
                <Text key={`left-${index}`} style={styles.scopePoint}>
                  {`${String.fromCharCode(97 + index)}. ${point}`}
                </Text>
              ))}
            </View>
            <View style={styles.scopeColumn}>
              {rightPoints.map((point, index) => (
                <Text key={`right-${index}`} style={styles.scopePoint}>
                  {`${String.fromCharCode(97 + leftPoints.length + index)}. ${point}`}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {PAGE_TWO_SECTIONS.map((section) => (
          <View
            key={section.heading || section.title}
            style={section.heading === '7. Warranties' ? styles.pageSectionTight : styles.pageSection}
          >
            {section.heading ? <ClauseHeading>{section.heading}</ClauseHeading> : null}
            {'text' in section && section.title ? (
              <NumberedParagraph number={section.title} text={section.text} />
            ) : null}
            {'items' in section
              ? section.items?.map((item, index) => (
                  <NumberedParagraph
                    key={`${section.heading}-${index}`}
                    number={`${section.heading?.split('.')[0]}.${index + 1}`}
                    text={item}
                  />
                ))
              : null}
          </View>
        ))}

        <StandardFooter />
      </Page>

      <Page size="A4" style={[styles.page, styles.pageInner]}>
        <SmallHeader data={data} />

        {PAGE_THREE_SECTIONS.map((section) => (
          <View key={section.heading} style={styles.pageSection}>
            <ClauseHeading>{section.heading}</ClauseHeading>
            {section.text && section.title ? <NumberedParagraph number={section.title} text={section.text} /> : null}
            {section.paragraphs
              ? section.paragraphs.map((paragraph, index) => (
                  <Text key={`${section.heading}-${index}`} style={[styles.clauseBodyText, { marginBottom: 6 }]}>
                    {paragraph}
                  </Text>
                ))
              : null}
          </View>
        ))}

        <View style={styles.tableHeadingWrap}>
          <GradientBar label="CHARGES FOR GENERAL SERVICING" style={{ marginBottom: 8 }} />
        </View>

        <View style={styles.chargesTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadCell, styles.tableHeadOrange, styles.colIndex]}>#</Text>
            <Text style={[styles.tableHeadCell, styles.tableHeadOrange, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeadCell, styles.tableHeadPurple, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeadCell, styles.tableHeadBlue, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeadCell, styles.tableHeadBlue, styles.colAmount, { borderRightWidth: 0 }]}>
              Amount
            </Text>
          </View>

          {data.items.map((item, index) => (
            <View key={`${item.description}-${index}`} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colIndex, styles.tableCellIndex]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty, styles.tableCellQty]}>{item.qty}</Text>
              <Text style={[styles.tableCell, styles.colUnitPrice, styles.tableCellUnitPrice]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.tableCell, styles.colAmount, styles.tableCellAmount]}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelMuted}>Subtotal:</Text>
              <Text style={styles.totalValueMuted}>{formatCurrency(data.subtotal)}</Text>
            </View>
            <View style={[styles.totalRow, { marginBottom: 0 }]}>
              <Text style={styles.totalLabelStrong}>Total:</Text>
              <Text style={styles.totalValueStrong}>{formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow} wrap={false}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statLabel}>CONTRACT TYPE</Text>
            <Text style={styles.statValueBlue}>{data.contract_type}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statLabel}>SCHEDULE</Text>
            <Text style={styles.statValueOrange}>{data.schedule_short_label}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statLabel}>TIMELINE</Text>
            <Text style={styles.statValueGreen}>{data.timeline}</Text>
          </View>
        </View>

        <View style={styles.totalCostCard} wrap={false}>
          <Text style={styles.totalCostValue}>{`Total Cost Per Servicing: ${formatCurrency(data.total)}`}</Text>
          <Text style={styles.totalCostSchedule}>{data.schedule_long_label}</Text>
        </View>

        <StandardFooter />
      </Page>

      <Page size="A4" style={[styles.page, styles.pageFour]}>
        <SmallHeader data={data} />

        <GradientBar label="SERVICE SCHEDULE" />
        <View style={styles.scheduleListWrap}>
          {data.service_schedule.map((schedule) => (
            <View key={schedule.label} style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>{`${schedule.label}:`}</Text>
              <Text style={styles.scheduleDate}>{schedule.date}</Text>
            </View>
          ))}
          <Text style={styles.scheduleSummary}>{data.schedule_long_label}</Text>
        </View>

        <GradientBar label="AGREEMENT SIGNATURES" />
        <View style={styles.signaturesWrap}>
          <View style={styles.signatureLineRow}>
            <Text style={styles.signatureLabel}>Signed By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>{`Representative of ${data.client.company || 'the Customer'}`}</Text>
          </View>

          <View style={styles.signatureGridRow}>
            <View style={styles.signatureGridItemWide}>
              <View style={styles.signatureFieldRow}>
                <Text style={styles.signatureFieldLabel}>Name of Representative:</Text>
                {data.customer_representative ? <Text style={styles.signatureFieldValue}>{data.customer_representative}</Text> : null}
                <View style={styles.signatureFieldLine} />
              </View>
            </View>
            <View style={styles.signatureGridItemNarrow}>
              <View style={styles.signatureFieldRow}>
                <Text style={styles.signatureFieldLabel}>Position:</Text>
                {data.customer_position ? <Text style={styles.signatureFieldValue}>{data.customer_position}</Text> : null}
                <View style={styles.signatureFieldLine} />
              </View>
            </View>
          </View>

          <View style={[styles.signatureFieldRow, { width: '42%', marginBottom: 18 }]}>
            <Text style={styles.signatureFieldLabel}>Date of Agreement:</Text>
            <View style={styles.signatureFieldLine} />
          </View>

          <View style={styles.signatureLineRow}>
            <Text style={styles.signatureLabel}>Signed By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>(Rep. of ARK Air Conditioning, Refrigeration & Kitchen Maint. Ltd)</Text>
          </View>

          <View style={styles.signatureGridRow}>
            <View style={styles.signatureGridItemWide}>
              <View style={styles.signatureFieldRow}>
                <Text style={styles.signatureFieldLabel}>Name of Representative:</Text>
                <Text style={styles.signatureFieldValue}>{data.ark_representative}</Text>
                <View style={styles.signatureFieldLine} />
              </View>
            </View>
            <View style={styles.signatureGridItemNarrow}>
              <View style={styles.signatureFieldRow}>
                <Text style={styles.signatureFieldLabel}>Position:</Text>
                <Text style={styles.signatureFieldValue}>{data.ark_position}</Text>
                <View style={styles.signatureFieldLine} />
              </View>
            </View>
          </View>

          <View style={[styles.signatureFieldRow, { width: '42%', marginBottom: 0 }]}>
            <Text style={styles.signatureFieldLabel}>Date of Agreement:</Text>
            <Text style={styles.signatureFieldValue}>{data.agreement_date}</Text>
            <View style={styles.signatureFieldLine} />
          </View>
        </View>

        <View style={styles.bankingBox} wrap={false}>
          <Text style={styles.bankingTitle}>BANKING DETAILS</Text>
          <View style={styles.bankingDivider} />
          {bankingDetails.map((detail) => (
            <View key={detail.label} style={styles.bankingRow}>
              <Text style={styles.bankingLabel}>{`${detail.label}:`}</Text>
              <Text style={styles.bankingValue}>{detail.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.fancyFooter} fixed>
          <Text style={styles.professionalServicesTitle}>OUR PROFESSIONAL SERVICES</Text>
          <Text style={styles.professionalServicesText}>
            <Text style={styles.professionalOrange}>AIR COND./REFRIGERATION:</Text>
            <Text> SALES + SERVICE + REPAIR + INSTALLATION  |  </Text>
            <Text style={styles.professionalBlue}>KITCHEN EXHAUST:</Text>
            <Text> FABRICATION + MAINTENANCE + REPAIRS</Text>
          </Text>
          <Text style={styles.professionalServicesText}>
            <Text style={styles.professionalOrange}>KITCHEN EQUIPMENT:</Text>
            <Text> CLEANING + REPAIRS + SALES  |  </Text>
            <Text style={styles.professionalBlue}>DEEP CLEANING:</Text>
            <Text> DE-GREASING + DE-SCALING</Text>
          </Text>
          <View style={styles.imageFooterRow}>
            <Image src={data.assets?.footerLeft} style={styles.footerImage} />
            <Image src={data.assets?.footerRight} style={styles.footerImage} />
          </View>
          <View style={styles.thankYouRow}>
            <Text style={styles.thankYouText}>
              Thank you for choosing Ark Air Conditioning, Refrigeration & Kitchen Maintenance Ltd · www.arkmaintenance.com
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
