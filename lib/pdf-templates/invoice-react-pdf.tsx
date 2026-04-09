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

// Colors
const colors = {
  primary: '#FF6B00',
  secondary: '#00BFFF',
  dark: '#1a1a2e',
  gray: '#666666',
  lightGray: '#f5f5f5',
  white: '#ffffff',
  black: '#000000',
  orangeTint: '#fff7ed',
}

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 94, // Space for fixed top logo/contact row
    paddingBottom: 310, // Space for fixed footer with totals, banking details, and service images
    paddingHorizontal: 12,
  },
  // Fixed Header - appears on every page
  headerFixed: {
    position: 'absolute',
    top: 18,
    left: 12,
    right: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  headerLeft: {
    width: '46%',
  },
  logo: {
    width: 172,
    height: 70,
  },
  companyInfo: {
    width: '40%',
    fontSize: 8.4,
    color: colors.gray,
    lineHeight: 1.18,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 8,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billToWrap: {
    width: '46%',
  },
  billToTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.dark,
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  billToBox: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: colors.orangeTint,
    minHeight: 58,
  },
  invoiceMetaWrap: {
    width: '42%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 25,
    fontWeight: 800,
    color: colors.primary,
    marginBottom: 3,
  },
  invoiceDetails: {
    fontSize: 8.6,
    textAlign: 'right',
    lineHeight: 1.14,
    color: colors.black,
  },
  invoiceDetailLabel: {
    color: '#9ca3af',
  },
  invoiceDetailValue: {
    fontWeight: 700,
    color: colors.black,
  },
  // Bill To
  billToSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 10.5,
    fontWeight: 700,
    color: colors.black,
    marginBottom: 1,
  },
  clientInfo: {
    fontSize: 8.7,
    color: colors.primary,
    lineHeight: 1.08,
  },
  // Service Description Banner
  serviceBanner: {
    backgroundColor: colors.dark,
    paddingVertical: 3,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  serviceBannerText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  // Table
  table: {
    marginBottom: 6,
  },
  tableHeaderWrap: {
    position: 'relative',
    height: 24,
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
    height: 24,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3.8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableRowEven: {
    backgroundColor: colors.lightGray,
  },
  tableCell: {
    fontSize: 9,
    color: colors.black,
  },
  amountCell: {
    color: colors.primary,
    fontWeight: 700,
  },
  // Column widths
  colNumber: { width: '6%' },
  colDescription: { width: '46%' },
  colQty: { width: '12%', textAlign: 'center' },
  colPrice: { width: '18%', textAlign: 'right' },
  colAmount: { width: '18%', textAlign: 'right' },
  // Totals
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  totalsBox: {
    width: 170,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  totalRowLast: {
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.black,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.black,
  },
  invoiceTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
  },
  invoiceTotalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
  },
  balanceDueLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
  },
  balanceDueValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
  },
  // Banking Details
  bankingSection: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingTop: 7,
    paddingRight: 8,
    paddingBottom: 6,
    paddingLeft: 8,
    marginBottom: 4,
  },
  bankingTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#A14C1F',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 1.6,
  },
  bankingDivider: {
    height: 1,
    backgroundColor: colors.primary,
    marginBottom: 3,
  },
  bankingRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  bankingLabel: {
    width: 106,
    fontSize: 8.4,
    fontWeight: 700,
    color: '#A14C1F',
    lineHeight: 1.1,
  },
  bankingValue: {
    fontSize: 8.4,
    color: '#334155',
    flex: 1,
    lineHeight: 1.1,
  },
  // Fixed Footer - appears at bottom of every page
  footerFixed: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
  },
  gradientBar: {
    height: 4,
    flexDirection: 'row',
    marginBottom: 6,
  },
  gradientBlue: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  gradientYellow: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  gradientOrange: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  footerImageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  footerImageCard: {
    flex: 1,
    height: 125,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  footerImageCardLeft: {
    marginRight: 6,
  },
  footerServiceImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  footerText: {
    fontSize: 5.2,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 0.5,
    lineHeight: 1,
  },
  footerTitle: {
    fontSize: 6.2,
    fontWeight: 700,
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 1,
    letterSpacing: 1.3,
  },
  footerLabelOrange: {
    color: colors.primary,
    fontWeight: 700,
  },
  footerLabelBlue: {
    color: '#2563EB',
    fontWeight: 700,
  },
  thankYou: {
    fontSize: 5.2,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 1,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.gray,
    textAlign: 'right',
    marginTop: 4,
  },
})

interface InvoiceItem {
  description: string
  qty: number
  unit_price: number
  amount: number
}

interface InvoiceData {
  invoice_number: string
  date: string
  payment_terms: string
  payment_method?: string
  service_description: string
  client: {
    name: string
    company: string
    address: string
    city: string
    parish: string
  }
  items: InvoiceItem[]
  subtotal: number
  total: number
  balance_due: number
  assets?: {
    logo?: string
    footerLeft?: string
    footerRight?: string
  }
}

interface InvoicePdfDocumentProps {
  data: InvoiceData
}

export const InvoicePdfDocument = ({ data }: InvoicePdfDocumentProps) => {
  const minimumVisibleRows = 14
  const fillerRows = Array.from({
    length: Math.max(0, minimumVisibleRows - data.items.length),
  })
  const isBHC = data.client.company?.toLowerCase().includes('british high commission')
  const bankingDetails = isBHC
    ? [
        { label: 'Account Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd' },
        { label: 'Account Number', value: '9909 4000 6439 (Savings)' },
        { label: 'Name of Bank', value: 'First Global Bank' },
        { label: 'Address of Bank', value: '28-48 Barbados Avenue, Kingston 5' },
        { label: 'Sort Code', value: '99094' },
        { label: 'Swift', value: 'FILBJMKN' },
      ]
    : [
        { label: 'Branch', value: 'Ocho Rios' },
        { label: 'Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.' },
        { label: 'Branch Code', value: '99094' },
        { label: 'Account Number', value: '99094 0006 439' },
        { label: 'Account Type', value: 'Savings' },
      ]
  const formatCurrency = (amount: number) => `JMD ${amount.toLocaleString()}`
  const calculateLineTotal = (item: InvoiceItem) => Number(item.qty || 0) * Number(item.unit_price || 0)
  const calculatedSubtotal = data.items.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  const calculatedTotal = calculatedSubtotal

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Fixed Header - appears on every page */}
        <View style={styles.headerFixed} fixed>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {data.assets?.logo ? (
                <Image
                  src={data.assets.logo}
                  style={styles.logo}
                />
              ) : null}
            </View>
            <View style={styles.companyInfo}>
              <Text>Kingston: 71 First Street, Newport Blvd.</Text>
              <Text>Tel: 876-514-4020 / 876-476-1748</Text>
              <Text>Email: admin@arkmaintenance.com</Text>
              <Text>www.arkmaintenance.com</Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>

        {/* Main Content - flows and wraps to next pages */}
        {/* Bill To + Invoice Header */}
        <View style={styles.billToSection}>
          <View style={styles.headerBottom}>
            <View style={styles.billToWrap}>
              <Text style={styles.billToTitle}>BILL TO</Text>
              <View style={styles.billToBox}>
                <Text style={styles.clientName}>{data.client.name}</Text>
                {data.client.company ? <Text style={styles.clientInfo}>{data.client.company}</Text> : null}
                {data.client.address ? <Text style={styles.clientInfo}>{data.client.address}</Text> : null}
                {data.client.city ? <Text style={styles.clientInfo}>{data.client.city}</Text> : null}
                {data.client.parish ? <Text style={styles.clientInfo}>{data.client.parish}</Text> : null}
              </View>
            </View>
            <View style={styles.invoiceMetaWrap}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.invoiceDetails}>
                <Text>
                  <Text style={styles.invoiceDetailLabel}>Invoice: </Text>
                  <Text style={styles.invoiceDetailValue}>{data.invoice_number}</Text>
                </Text>
                <Text>
                  <Text style={styles.invoiceDetailLabel}>Date: </Text>
                  <Text style={styles.invoiceDetailValue}>{data.date}</Text>
                </Text>
                <Text>
                  <Text style={styles.invoiceDetailLabel}>Payment Terms: </Text>
                  <Text style={styles.invoiceDetailValue}>{data.payment_terms}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Description Banner */}
        <View style={styles.serviceBanner}>
          <Text style={styles.serviceBannerText}>{data.service_description}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeaderWrap} fixed>
            <Svg style={styles.tableHeaderGradient} viewBox="0 0 100 24" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="invoiceTableHeaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#22B8FF" />
                  <Stop offset="44%" stopColor="#B99587" />
                  <Stop offset="100%" stopColor="#FF6B00" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100" height="24" fill="url(#invoiceTableHeaderGradient)" />
            </Svg>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNumber]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>
          </View>
          {/* Table Rows */}
          {data.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
              wrap={false}
            >
              <Text style={[styles.tableCell, styles.colNumber]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unit_price)}</Text>
              <Text style={[styles.tableCell, styles.colAmount, styles.amountCell]}>{formatCurrency(calculateLineTotal(item))}</Text>
            </View>
          ))}
          {fillerRows.map((_, index) => {
            const rowIndex = data.items.length + index

            return (
              <View
                key={`filler-${index}`}
                style={[styles.tableRow, rowIndex % 2 === 0 ? styles.tableRowEven : {}]}
                wrap={false}
              >
                <Text style={[styles.tableCell, styles.colNumber]}> </Text>
                <Text style={[styles.tableCell, styles.colDescription]}> </Text>
                <Text style={[styles.tableCell, styles.colQty]}> </Text>
                <Text style={[styles.tableCell, styles.colPrice]}> </Text>
                <Text style={[styles.tableCell, styles.colAmount]}> </Text>
              </View>
            )
          })}
        </View>

        {/* Fixed Footer - appears at bottom of every page */}
        <View style={styles.footerFixed} fixed>
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculatedSubtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.invoiceTotalLabel}>Total:</Text>
                <Text style={styles.invoiceTotalValue}>{formatCurrency(calculatedTotal)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowLast]}>
                <Text style={styles.balanceDueLabel}>Balance Due:</Text>
                <Text style={styles.balanceDueValue}>{formatCurrency(data.balance_due)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.bankingSection}>
            <Text style={styles.bankingTitle}>Banking Details</Text>
            <View style={styles.bankingDivider} />
            {bankingDetails.map((detail) => (
              <View key={detail.label} style={styles.bankingRow}>
                <Text style={styles.bankingLabel}>{detail.label}:</Text>
                <Text style={styles.bankingValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.gradientBar}>
            <View style={styles.gradientBlue} />
            <View style={styles.gradientYellow} />
            <View style={styles.gradientOrange} />
          </View>
          <View style={styles.footerImageRow}>
            <View style={[styles.footerImageCard, styles.footerImageCardLeft]}>
              {data.assets?.footerLeft ? (
                <Image
                  src={data.assets.footerLeft}
                  style={styles.footerServiceImage}
                />
              ) : null}
            </View>
            <View style={styles.footerImageCard}>
              {data.assets?.footerRight ? (
                <Image
                  src={data.assets.footerRight}
                  style={styles.footerServiceImage}
                />
              ) : null}
            </View>
          </View>
          <Text style={styles.footerTitle}>+ OUR PROFESSIONAL SERVICES +</Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerLabelOrange}>AIR COND./REFRIGERATION:</Text>
            <Text> SALES + SERVICE + REPAIR + INSTALLATION | </Text>
            <Text style={styles.footerLabelBlue}>KITCHEN EXHAUST:</Text>
            <Text> FABRICATION + MAINTENANCE + REPAIRS</Text>
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerLabelOrange}>KITCHEN EQUIPMENT:</Text>
            <Text> CLEANING + REPAIRS + SALES | </Text>
            <Text style={styles.footerLabelBlue}>DEEP CLEANING:</Text>
            <Text> DE-GREASING + DE-SCALING</Text>
          </Text>
          <Text style={styles.thankYou}>
            Thank you for choosing ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd | www.arkmaintenance.com
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  )
}
