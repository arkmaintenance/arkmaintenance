import {
  Defs,
  Document,
  Image,
  LinearGradient,
  Page,
  Rect,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer'

const colors = {
  primary: '#FF6B00',
  secondary: '#00BFFF',
  dark: '#1a1a2e',
  gray: '#666666',
  lightGray: '#f5f5f5',
  white: '#ffffff',
  black: '#000000',
  orangeTint: '#fff7ed',
  greenTint: '#f0fdf4',
  greenText: '#15803d',
  blueText: '#2563EB',
  slateText: '#334155',
  border: '#e5e7eb',
}

const SCOPE_TEMPLATES: Record<string, { title: string; intro: string; points: string[] }> = {
  ac_servicing: {
    title: '16 Point Air Conditioning Servicing Checklist',
    intro: 'Our 16 Point Servicing Method Includes but is not limited to:',
    points: [
      'Cleaning of Evaporator, Evaporator Coils and Evaporator Fan Motor.',
      'Cleaning of Condensor Fan Motor, Condensor Coils, Fan Blades and Motor.',
      'Cleaning and Treating of Drain Pan and Drain Line.',
      'Cleaning and Treating of Air Filters.',
      'Straightening of Evaporator and Condensor Coil Fins.',
      'Checking Refrigerant (Freon) levels for adequate cooling.',
      'Checking Superheat and Subcooling.',
      'Checking the Compressor Amp draw.',
      'Checking the Indoor & Outdoor Fan Motor Amp draw.',
      'Checking Electrical Components.',
      'Checking Thermostat for Proper Operation.',
      'Checking for Refrigerant Leaks.',
      'Checking & Testing the Capacitor.',
      'Checking the Contactor.',
      'Inspecting Overall Operation of Unit.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
  refrigeration: {
    title: '16 Point Refrigeration Servicing Checklist',
    intro: 'Our 16 Point Refrigeration Servicing Method Includes but is not limited to:',
    points: [
      'Cleaning of Evaporator Coils and Evaporator Fan Motor.',
      'Cleaning of Condenser Coils, Fan Blades and Condenser Fan Motor.',
      'Cleaning and Treating of Drain Pan and Drain Line.',
      'Cleaning and Treating of Air Filters and Door Gaskets.',
      'Straightening of Evaporator and Condenser Coil Fins.',
      'Checking Refrigerant (Freon) levels for adequate cooling.',
      'Checking Superheat and Subcooling.',
      'Checking the Compressor Amp draw.',
      'Checking the Condenser Fan Motor Amp draw.',
      'Checking all Electrical Components and Wiring.',
      'Checking Thermostat / Temperature Controller for Proper Operation.',
      'Checking for Refrigerant Leaks throughout the system.',
      'Checking & Testing the Start and Run Capacitors.',
      'Checking the Contactor and Relay.',
      'Inspecting Overall Operation of the Refrigeration Unit.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
  exhaust: {
    title: 'Kitchen Exhaust System Servicing Checklist',
    intro: 'Our Kitchen Exhaust System Service Includes but is not limited to:',
    points: [
      'De-greasing and cleaning of exhaust hood interior surfaces.',
      'Cleaning of exhaust hood filters and grease traps.',
      'Inspection and cleaning of exhaust ductwork.',
      'Cleaning and inspection of exhaust fan blades and housing.',
      'Checking exhaust fan motor for proper operation and amp draw.',
      'Lubricating exhaust fan motor bearings and moving parts.',
      'Checking and tightening all electrical connections.',
      'Inspection of make-up air system (if applicable).',
      'Checking belt tension and condition (belt-drive systems).',
      'Testing exhaust fan speed and airflow.',
      'Inspection of fire suppression system nozzles and coverage.',
      'Checking grease collection containers and replacing if necessary.',
      'Inspection of hood baffle filters for damage or excessive grease.',
      'Checking all access panels and seals for integrity.',
      'Testing overall system operation and airflow balance.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
  ice_machine: {
    title: '16 Point Ice Machine Servicing Checklist',
    intro: 'Our 16 Point Ice Machine Servicing Method Includes but is not limited to:',
    points: [
      'Cleaning and sanitising the ice machine interior and bin.',
      'Cleaning of Evaporator Coils and Evaporator Fan Motor.',
      'Cleaning of Condenser Coils and Condenser Fan Motor.',
      'Descaling the water distribution system and spray nozzles.',
      'Replacing the water filter (where applicable).',
      'Cleaning and inspecting the water pump and float valve.',
      'Checking Refrigerant (Freon) levels for proper ice production.',
      'Checking Superheat and Subcooling.',
      'Checking the Compressor Amp draw.',
      'Checking all Electrical Components and Wiring.',
      'Checking Thermostat and Ice Thickness Control.',
      'Checking for Refrigerant Leaks throughout the system.',
      'Checking & Testing the Capacitor.',
      'Checking water inlet valve and drain valve for proper operation.',
      'Inspecting Overall Operation and ice production rate.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 120,
  },
  container: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  logo: {
    width: 146,
    height: 58,
  },
  companyInfo: {
    fontSize: 7.7,
    color: colors.gray,
    lineHeight: 1.18,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 6,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  preparedForWrap: {
    width: '46%',
  },
  preparedForTitle: {
    fontSize: 7.8,
    fontWeight: 700,
    color: colors.dark,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  preparedForBox: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: colors.orangeTint,
    minHeight: 56,
  },
  clientName: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.black,
    marginBottom: 1,
  },
  clientInfo: {
    fontSize: 8.6,
    color: colors.primary,
    lineHeight: 1.08,
  },
  quoteHeaderRight: {
    width: '42%',
    alignItems: 'flex-end',
  },
  quotationTitle: {
    fontSize: 23,
    fontWeight: 800,
    color: colors.primary,
    marginBottom: 2,
  },
  quotationDetails: {
    fontSize: 8.3,
    lineHeight: 1.08,
    textAlign: 'right',
    color: colors.black,
  },
  quotationDetailLabel: {
    color: '#9ca3af',
  },
  quotationDetailValue: {
    fontWeight: 700,
    color: colors.black,
  },
  serviceBanner: {
    backgroundColor: colors.dark,
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  serviceBannerText: {
    color: colors.white,
    fontSize: 9.8,
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  table: {
    marginBottom: 3,
  },
  tableHeaderWrap: {
    position: 'relative',
    height: 25,
  },
  tableHeaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 25,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.white,
  },
  colNumber: {
    width: '7%',
  },
  colDescriptionNoDiscount: {
    width: '51%',
  },
  colDescriptionWithDiscount: {
    width: '43%',
  },
  colQty: {
    width: '11%',
    textAlign: 'center',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colDiscount: {
    width: '12%',
    textAlign: 'right',
  },
  colAmountNoDiscount: {
    width: '16%',
    textAlign: 'right',
  },
  colAmountWithDiscount: {
    width: '12%',
    textAlign: 'right',
  },
  sectionRow: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: colors.orangeTint,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5.8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowFiller: {
    flexDirection: 'row',
    paddingVertical: 3.2,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 9.25,
    color: colors.black,
  },
  tableCellDescription: {
    fontWeight: 700,
  },
  tableCellAmount: {
    fontWeight: 700,
    color: colors.primary,
  },
  tableCellDiscount: {
    color: '#ef4444',
  },
  totalsWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
    marginBottom: 3,
  },
  totalsBox: {
    width: 185,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalLabel: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.black,
  },
  totalValue: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.black,
  },
  grandTotalLabel: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.primary,
  },
  grandTotalValue: {
    fontSize: 12.5,
    fontWeight: 800,
    color: colors.primary,
  },
  bottomStack: {
    paddingTop: 3,
  },
  boxesGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  box: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDark: {
    backgroundColor: colors.dark,
  },
  boxOrange: {
    backgroundColor: colors.orangeTint,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d1d5db',
  },
  boxGreen: {
    backgroundColor: colors.greenTint,
  },
  boxLabel: {
    fontSize: 6.1,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 0.5,
    color: '#6b7280',
  },
  boxLabelDark: {
    color: '#9ca3af',
  },
  boxValue: {
    fontSize: 9,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  boxValueDark: {
    color: colors.white,
  },
  boxValueOrange: {
    color: colors.primary,
  },
  boxValueGreen: {
    color: colors.greenText,
  },
  scopeSection: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginBottom: 4,
  },
  scopeTitle: {
    fontSize: 7.9,
    fontWeight: 800,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
    marginBottom: 3,
  },
  scopeIntro: {
    fontSize: 7.8,
    fontWeight: 800,
    color: colors.primary,
    marginBottom: 3,
  },
  scopeGrid: {
    flexDirection: 'row',
  },
  scopeColumn: {
    flex: 1,
  },
  scopeColumnLeft: {
    marginRight: 4,
  },
  scopeColumnRight: {
    marginLeft: 4,
  },
  scopeItem: {
    fontSize: 7.2,
    color: colors.slateText,
    lineHeight: 1.08,
    marginBottom: 1,
  },
  bankingSection: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingTop: 4,
    paddingRight: 6,
    paddingBottom: 4,
    paddingLeft: 6,
    marginTop: 0,
    marginBottom: 0,
  },
  bankingTitle: {
    fontSize: 9.4,
    fontWeight: 800,
    color: '#A14C1F',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.35,
    marginBottom: 2,
  },
  bankingDivider: {
    height: 1,
    backgroundColor: colors.primary,
    marginBottom: 2,
  },
  bankingRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  bankingLabel: {
    width: 108,
    fontSize: 7.5,
    fontWeight: 800,
    color: '#A14C1F',
    lineHeight: 1,
  },
  bankingValue: {
    flex: 1,
    fontSize: 7.5,
    color: colors.slateText,
    lineHeight: 1,
  },
  footerFixed: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 6,
  },
  gradientBar: {
    height: 3,
    flexDirection: 'row',
    marginBottom: 2,
  },
  gradientBlue: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  gradientYellow: {
    flex: 1,
    backgroundColor: '#facc15',
  },
  gradientOrange: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  footerImageRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  footerImageCard: {
    flex: 1,
    height: 84,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  footerImageCardLeft: {
    marginRight: 5,
  },
  footerServiceImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  footerHeading: {
    fontSize: 5.9,
    fontWeight: 800,
    color: colors.blueText,
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 0.8,
  },
  footerLine: {
    fontSize: 5.3,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 1,
    marginBottom: 0.25,
  },
  footerLabelOrange: {
    color: colors.primary,
    fontWeight: 800,
  },
  footerLabelBlue: {
    color: colors.blueText,
    fontWeight: 800,
  },
  footerThanks: {
    fontSize: 5.1,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 1,
  },
})

interface QuotationItem {
  description: string
  qty: number
  unit_price: number
  discount?: number
  amount: number
  section?: string
}

interface QuotationData {
  quote_number: string
  date: string
  payment_terms: string
  service_description: string
  timeline?: string
  isServiceContract?: boolean
  recurringSchedule?: string
  scopeTemplate?: string
  scopeOfWork?: string
  scopeOfWorkPoints?: string[]
  client: {
    name: string
    company: string
    address: string
    city: string
  }
  items: QuotationItem[]
  subtotal: number
  total: number
  assets?: {
    logo?: string
    footerLeft?: string
    footerRight?: string
  }
}

interface QuotationPdfDocumentProps {
  data: QuotationData
}

const bankingDetails = [
  { label: 'Bank', value: 'First Global Bank' },
  { label: 'Branch', value: 'Ocho Rios' },
  { label: 'Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.' },
  { label: 'Branch Code', value: '99094' },
  { label: 'Account Number', value: '99094 0006 439' },
  { label: 'Account Type', value: 'Savings' },
]

function formatCurrency(amount: number) {
  return `JMD ${amount.toLocaleString()}`
}

function calculateLineTotal(item: QuotationItem) {
  return (Number(item.qty) || 1) * (Number(item.unit_price) || 0) - (Number(item.discount) || 0)
}

function capitalizeScheduleLabel(value?: string) {
  if (!value) return 'One-time'

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`.replace('-', ' ')
}

export const QuotationPdfDocument = ({ data }: QuotationPdfDocumentProps) => {
  const hasDiscountColumn = data.items.some((item) => item.discount && !item.section)
  const lineItems = data.items.filter((item) => item.section === undefined)
  const scopeDef = data.scopeTemplate ? SCOPE_TEMPLATES[data.scopeTemplate] : null
  const fallbackScopePoints = data.scopeOfWorkPoints || []
  const scopePointCount = scopeDef ? scopeDef.points.length : fallbackScopePoints.length
  const calculatedSubtotal = data.items.reduce(
    (sum, item) => sum + (item.section ? 0 : calculateLineTotal(item)),
    0
  )
  const calculatedTotal = calculatedSubtotal
  const contractType = data.isServiceContract ? 'SERVICE CONTRACT' : 'STANDARD QUOTATION'
  const scheduleLabel = capitalizeScheduleLabel(data.recurringSchedule)
  const hasScopeSection = Boolean(scopeDef || data.scopeOfWork)
  const minimumVisibleRows = hasScopeSection
    ? (scopePointCount > 0 ? (scopePointCount <= 12 ? 14 : 12) : 14)
    : 20
  const fillerRows = Array.from({ length: Math.max(0, minimumVisibleRows - lineItems.length) })
  const leftScopePoints = (scopeDef ? scopeDef.points : fallbackScopePoints).slice(
    0,
    Math.ceil((scopeDef ? scopeDef.points : fallbackScopePoints).length / 2)
  )
  const rightScopePoints = (scopeDef ? scopeDef.points : fallbackScopePoints).slice(
    Math.ceil((scopeDef ? scopeDef.points : fallbackScopePoints).length / 2)
  )
  let visibleItemNumber = 0

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.container}>
          <View style={styles.headerTop}>
            <View>
              {data.assets?.logo ? <Image src={data.assets.logo} style={styles.logo} /> : null}
            </View>
            <View style={styles.companyInfo}>
              <Text>Kingston: 71 First Street, Newport Blvd.</Text>
              <Text>Tel: 876-514-4020 / 876-476-1748</Text>
              <Text>Email: admin@arkmaintenance.com</Text>
              <Text>www.arkmaintenance.com</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.headerBottom}>
            <View style={styles.preparedForWrap}>
              <Text style={styles.preparedForTitle}>PREPARED FOR</Text>
              <View style={styles.preparedForBox}>
                <Text style={styles.clientName}>{data.client.name}</Text>
                {data.client.company ? <Text style={styles.clientInfo}>{data.client.company}</Text> : null}
                {data.client.address ? <Text style={styles.clientInfo}>{data.client.address}</Text> : null}
                {data.client.city ? <Text style={styles.clientInfo}>{data.client.city}</Text> : null}
              </View>
            </View>

            <View style={styles.quoteHeaderRight}>
              <Text style={styles.quotationTitle}>QUOTATION</Text>
              <View style={styles.quotationDetails}>
                <Text>
                  <Text style={styles.quotationDetailLabel}>Quotation: </Text>
                  <Text style={styles.quotationDetailValue}>{data.quote_number}</Text>
                </Text>
                <Text>
                  <Text style={styles.quotationDetailLabel}>Date: </Text>
                  <Text style={styles.quotationDetailValue}>{data.date}</Text>
                </Text>
                <Text>
                  <Text style={styles.quotationDetailLabel}>Payment Terms: </Text>
                  <Text style={styles.quotationDetailValue}>{data.payment_terms}</Text>
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.serviceBanner}>
            <Text style={styles.serviceBannerText}>{data.service_description}</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderWrap}>
              <Svg style={styles.tableHeaderGradient} viewBox="0 0 100 25" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="quotationTableHeaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#00BFFF" />
                    <Stop offset="50%" stopColor="#809580" />
                    <Stop offset="100%" stopColor="#FF6B00" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100" height="25" fill="url(#quotationTableHeaderGradient)" />
              </Svg>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colNumber]}>#</Text>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    hasDiscountColumn ? styles.colDescriptionWithDiscount : styles.colDescriptionNoDiscount,
                  ]}
                >
                  Description
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
                {hasDiscountColumn ? (
                  <Text style={[styles.tableHeaderCell, styles.colDiscount]}>Discount</Text>
                ) : null}
                <Text
                  style={[
                    styles.tableHeaderCell,
                    hasDiscountColumn ? styles.colAmountWithDiscount : styles.colAmountNoDiscount,
                  ]}
                >
                  Amount
                </Text>
              </View>
            </View>

            {data.items.map((item, index) => {
              if (item.section !== undefined) {
                return (
                  <View key={`section-${index}`} style={styles.sectionRow} wrap={false}>
                    <Text style={styles.sectionText}>{item.section}</Text>
                  </View>
                )
              }

              visibleItemNumber += 1
              const amount = calculateLineTotal(item)

              return (
                <View
                  key={`item-${index}`}
                  style={visibleItemNumber % 2 === 1 ? [styles.tableRow, styles.tableRowEven] : styles.tableRow}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.colNumber]}>{visibleItemNumber}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellDescription,
                      hasDiscountColumn ? styles.colDescriptionWithDiscount : styles.colDescriptionNoDiscount,
                    ]}
                  >
                    {item.description}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{item.qty}</Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>
                    JMD {Number(item.unit_price || 0).toLocaleString()}
                  </Text>
                  {hasDiscountColumn ? (
                    <Text style={[styles.tableCell, styles.tableCellDiscount, styles.colDiscount]}>
                      {item.discount ? `JMD ${Number(item.discount).toLocaleString()}` : ''}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellAmount,
                      hasDiscountColumn ? styles.colAmountWithDiscount : styles.colAmountNoDiscount,
                    ]}
                  >
                    JMD {amount.toLocaleString()}
                  </Text>
                </View>
              )
            })}

            {fillerRows.map((_, index) => {
              const rowNumber = data.items.length + index + 1

              return (
                <View
                  key={`filler-${index}`}
                  style={rowNumber % 2 === 1 ? [styles.tableRowFiller, styles.tableRowEven] : styles.tableRowFiller}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.colNumber]}> </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      hasDiscountColumn ? styles.colDescriptionWithDiscount : styles.colDescriptionNoDiscount,
                    ]}
                  >
                    {' '}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQty]}> </Text>
                  <Text style={[styles.tableCell, styles.colPrice]}> </Text>
                  {hasDiscountColumn ? <Text style={[styles.tableCell, styles.colDiscount]}> </Text> : null}
                  <Text
                    style={[
                      styles.tableCell,
                      hasDiscountColumn ? styles.colAmountWithDiscount : styles.colAmountNoDiscount,
                    ]}
                  >
                    {' '}
                  </Text>
                </View>
              )
            })}
          </View>

          <View style={styles.totalsWrap} wrap={false}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculatedSubtotal)}</Text>
              </View>
              <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(calculatedTotal)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.bottomStack}>
            <View style={styles.boxesGrid} wrap={false}>
              <View style={[styles.box, styles.boxDark]}>
                <Text style={[styles.boxLabel, styles.boxLabelDark]}>Contract Type</Text>
                <Text style={[styles.boxValue, styles.boxValueDark]}>{contractType}</Text>
              </View>
              <View style={[styles.box, styles.boxOrange]}>
                <Text style={styles.boxLabel}>Schedule</Text>
                <Text style={[styles.boxValue, styles.boxValueOrange]}>{scheduleLabel}</Text>
              </View>
              <View style={[styles.box, styles.boxGreen]}>
                <Text style={styles.boxLabel}>Timeline</Text>
                <Text style={[styles.boxValue, styles.boxValueGreen]}>{data.timeline || '3-5 Days'}</Text>
              </View>
            </View>

            {(scopeDef || data.scopeOfWork) ? (
              <View style={styles.scopeSection} wrap={false}>
                <Text style={styles.scopeTitle}>Scope of Work</Text>
                {scopeDef ? (
                  <>
                    <Text style={styles.scopeIntro}>{scopeDef.intro}</Text>
                    <View style={styles.scopeGrid}>
                      <View style={[styles.scopeColumn, styles.scopeColumnLeft]}>
                        {leftScopePoints.map((point, index) => (
                          <Text key={`left-${index}`} style={styles.scopeItem}>
                            {index + 1}. {point}
                          </Text>
                        ))}
                      </View>
                      <View style={[styles.scopeColumn, styles.scopeColumnRight]}>
                        {rightScopePoints.map((point, index) => (
                          <Text key={`right-${index}`} style={styles.scopeItem}>
                            {index + leftScopePoints.length + 1}. {point}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </>
                ) : data.scopeOfWorkPoints && data.scopeOfWorkPoints.length > 0 ? (
                  <>
                    <Text style={styles.scopeIntro}>
                      Our {data.scopeOfWorkPoints.length} Point Servicing Method Includes But Is Not Limited To:
                    </Text>
                    <View style={styles.scopeGrid}>
                      <View style={[styles.scopeColumn, styles.scopeColumnLeft]}>
                        {leftScopePoints.map((point, index) => (
                          <Text key={`custom-left-${index}`} style={styles.scopeItem}>
                            {index + 1}. {point}
                          </Text>
                        ))}
                      </View>
                      <View style={[styles.scopeColumn, styles.scopeColumnRight]}>
                        {rightScopePoints.map((point, index) => (
                          <Text key={`custom-right-${index}`} style={styles.scopeItem}>
                            {index + leftScopePoints.length + 1}. {point}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.scopeItem}>{data.scopeOfWork}</Text>
                )}
              </View>
            ) : null}

            <View style={styles.bankingSection} wrap={false}>
              <Text style={styles.bankingTitle}>Banking Details</Text>
              <View style={styles.bankingDivider} />
              {bankingDetails.map((detail) => (
                <View key={detail.label} style={styles.bankingRow}>
                  <Text style={styles.bankingLabel}>{detail.label}:</Text>
                  <Text style={styles.bankingValue}>{detail.value}</Text>
                </View>
              ))}
            </View>

          </View>
        </View>

        <View style={styles.footerFixed} fixed>
          <View style={styles.gradientBar}>
            <View style={styles.gradientBlue} />
            <View style={styles.gradientYellow} />
            <View style={styles.gradientOrange} />
          </View>

          <View style={styles.footerImageRow}>
            <View style={[styles.footerImageCard, styles.footerImageCardLeft]}>
              {data.assets?.footerLeft ? <Image src={data.assets.footerLeft} style={styles.footerServiceImage} /> : null}
            </View>
            <View style={styles.footerImageCard}>
              {data.assets?.footerRight ? <Image src={data.assets.footerRight} style={styles.footerServiceImage} /> : null}
            </View>
          </View>

          <Text style={styles.footerHeading}>+ OUR PROFESSIONAL SERVICES +</Text>
          <Text style={styles.footerLine}>
            <Text style={styles.footerLabelOrange}>AIR COND./REFRIGERATION:</Text>
            <Text> SALES + SERVICE + REPAIR + INSTALLATION | </Text>
            <Text style={styles.footerLabelBlue}>KITCHEN EXHAUST:</Text>
            <Text> FABRICATION + MAINTENANCE + REPAIRS</Text>
          </Text>
          <Text style={styles.footerLine}>
            <Text style={styles.footerLabelOrange}>KITCHEN EQUIPMENT:</Text>
            <Text> CLEANING + REPAIRS + SALES | </Text>
            <Text style={styles.footerLabelBlue}>DEEP CLEANING:</Text>
            <Text> DE-GREASING + DE-SCALING</Text>
          </Text>
          <Text style={styles.footerThanks}>
            Thank you for choosing Ark Air Conditioning, Refrigeration & Kitchen Maintenance Ltd. | www.arkmaintenance.com
          </Text>
        </View>
      </Page>
    </Document>
  )
}
