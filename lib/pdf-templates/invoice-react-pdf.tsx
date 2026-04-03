import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
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
}

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 130, // Space for fixed header
    paddingBottom: 330, // Space for fixed footer with totals, banking details, and service images
    paddingHorizontal: 35,
  },
  // Fixed Header - appears on every page
  headerFixed: {
    position: 'absolute',
    top: 20,
    left: 35,
    right: 35,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    width: 130,
    height: 52,
    marginBottom: 6,
  },
  companyInfo: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.4,
  },
  headerRight: {
    alignItems: 'flex-end',
    width: 170,
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 6,
  },
  invoiceDetails: {
    fontSize: 10,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  invoiceLabel: {
    fontWeight: 600,
    color: colors.black,
  },
  // Bill To
  billToSection: {
    marginTop: 5,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.dark,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
    marginBottom: 6,
  },
  clientName: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 2,
  },
  clientInfo: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.4,
  },
  // Service Description Banner
  serviceBanner: {
    backgroundColor: colors.dark,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  serviceBannerText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  // Table
  table: {
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
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
    paddingVertical: 2,
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
  balanceDueLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
  },
  balanceDueValue: {
    fontSize: 10,
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
    left: 35,
    right: 35,
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
    height: 145,
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
    fontWeight: 600,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 1,
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
  const minimumVisibleRows = 11
  const fillerRows = Array.from({
    length: Math.max(0, minimumVisibleRows - data.items.length),
  })
  const bankingDetails = [
    { label: 'Bank', value: 'First Global Bank' },
    { label: 'Branch', value: 'Ocho Rios' },
    { label: 'Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.' },
    { label: 'Branch Code', value: '99094' },
    { label: 'Account Number', value: '99094 0006 439' },
    { label: 'Account Type', value: 'Savings' },
  ]
  const formatCurrency = (amount: number) => `JMD ${amount.toLocaleString()}`

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
              <View style={styles.companyInfo}>
                <Text>Kingston: 71 First Street, Newport Blvd.</Text>
                <Text>Tel: 876-514-4020 / 876-476-1748</Text>
                <Text>Email: admin@arkmaintenance.com</Text>
                <Text>www.arkmaintenance.com</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.invoiceDetails}>
                <Text>
                  <Text style={styles.invoiceLabel}>Invoice: </Text>
                  {data.invoice_number}
                </Text>
                <Text>
                  <Text style={styles.invoiceLabel}>Date: </Text>
                  {data.date}
                </Text>
                <Text>
                  <Text style={styles.invoiceLabel}>Payment Terms: </Text>
                  {data.payment_terms}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content - flows and wraps to next pages */}
        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionTitle}>BILL TO</Text>
          <Text style={styles.clientName}>{data.client.name}</Text>
          <Text style={styles.clientInfo}>{data.client.company}</Text>
          <Text style={styles.clientInfo}>{data.client.address}</Text>
          <Text style={styles.clientInfo}>{data.client.city}</Text>
          <Text style={styles.clientInfo}>{data.client.parish}</Text>
        </View>

        {/* Service Description Banner */}
        <View style={styles.serviceBanner}>
          <Text style={styles.serviceBannerText}>{data.service_description}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, styles.colNumber]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
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
              <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amount)}</Text>
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
                <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
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
          <Text style={styles.footerTitle}>OUR PROFESSIONAL SERVICES</Text>
          <Text style={styles.footerText}>
            AIR COND./REFRIGERATION: SALES + SERVICE + REPAIR + INSTALLATION | KITCHEN EXHAUST: FABRICATION + MAINTENANCE + REPAIRS
          </Text>
          <Text style={styles.footerText}>
            KITCHEN EQUIPMENT: CLEANING + REPAIRS + SALES | DEEP CLEANING: DE-GREASING + DE-SCALING
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
