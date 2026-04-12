import {
  Canvas,
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from '@react-pdf/renderer'
import { INCIDENT_REPORT_COLORS, type IncidentReportPdfData } from '../incident-reports'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 8,
    color: INCIDENT_REPORT_COLORS.muted,
    textAlign: 'right',
    lineHeight: 1.2,
  },
  tagline: {
    fontSize: 7.5,
    color: INCIDENT_REPORT_COLORS.muted,
    fontStyle: 'italic',
    marginTop: -5,
    marginBottom: 5,
  },
  dividerBlue: {
    height: 2,
    backgroundColor: INCIDENT_REPORT_COLORS.blue,
    marginBottom: 15,
  },
  titleContainer: {
    height: 60,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  titleSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    zIndex: 1,
  },
  metaSection: {
    backgroundColor: INCIDENT_REPORT_COLORS.lightBlue,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: INCIDENT_REPORT_COLORS.orange,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: INCIDENT_REPORT_COLORS.text,
  },
  metaSubValue: {
    fontSize: 9,
    color: INCIDENT_REPORT_COLORS.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 8,
    borderBottom: 2,
    borderBottomColor: INCIDENT_REPORT_COLORS.orange,
    paddingBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: INCIDENT_REPORT_COLORS.blue,
  },
  pointRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  pointText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: INCIDENT_REPORT_COLORS.text,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 10,
  },
  footerServiceBlocks: {
    marginBottom: 15,
    alignItems: 'center',
  },
  footerServiceRow: {
    flexDirection: 'row',
    fontSize: 6,
    marginBottom: 4,
  },
  footerLabelOrange: {
    color: INCIDENT_REPORT_COLORS.orange,
    fontWeight: 'bold',
  },
  footerLabelBlue: {
    color: INCIDENT_REPORT_COLORS.blue,
    fontWeight: 'bold',
  },
  footerValue: {
    color: INCIDENT_REPORT_COLORS.muted,
    marginLeft: 2,
  },
  footerSeparator: {
    color: '#d1d5db',
    marginHorizontal: 8,
  },
  footerImages: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  footerImage: {
    flex: 1,
    height: 100,
    borderRadius: 4,
  },
  footerBottomLine: {
    height: 2,
    backgroundColor: INCIDENT_REPORT_COLORS.blue,
    marginBottom: 10,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 10,
  },
  footerLink: {
    fontSize: 8,
    fontWeight: 'bold',
    color: INCIDENT_REPORT_COLORS.orange,
  },
  footerTagline: {
    fontSize: 7,
    color: '#10b981',
    textAlign: 'center',
  },
})

interface IncidentReportPdfProps {
  data: IncidentReportPdfData
  assets?: {
    logo?: string
    footerLeft?: string
    footerRight?: string
  }
}

export function IncidentReportPdf({ data, assets }: IncidentReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {assets?.logo && <Image src={assets.logo} style={styles.logo} />}
            <Text style={styles.tagline}>Professional HVAC & Kitchen Maintenance Services</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>Kingston: 71 First Street, Newport Blvd.</Text>
            <Text>Tel: 876-514-4020 / 876-476-1748</Text>
            <Text>Email: admin@arkmaintenance.com</Text>
            <Text>www.arkmaintenance.com</Text>
          </View>
        </View>

        <View style={styles.dividerBlue} />

        {/* Title Bar */}
        <View style={styles.titleContainer}>
          <Svg style={styles.titleSvg} viewBox="0 0 540 60" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={INCIDENT_REPORT_COLORS.titleGradientStart} />
                <Stop offset="1" stopColor={INCIDENT_REPORT_COLORS.titleGradientEnd} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="540" height="60" fill="url(#titleGrad)" />
          </Svg>
          <Text style={styles.titleText}>INCIDENT REPORT: {data.title}</Text>
        </View>

        {/* Meta Section */}
        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>PREPARED FOR</Text>
            <Text style={styles.metaValue}>{data.contact_person}</Text>
            <Text style={styles.metaSubValue}>{data.client_name}</Text>
            <Text style={styles.metaSubValue}>{data.address}</Text>
          </View>
          <View style={[styles.metaItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{data.report_date}</Text>
          </View>
        </View>

        {/* Content Sections */}
        {data.sections.map((section, idx) => (
          <View key={idx} style={styles.section} wrap={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.heading}</Text>
            </View>
            {section.points.map((point, pIdx) => (
              <View key={pIdx} style={styles.pointRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerServiceBlocks}>
            <View style={styles.footerServiceRow}>
              <Text style={styles.footerLabelOrange}>AIR COND./REFRIGERATION:</Text>
              <Text style={styles.footerValue}>SALES + SERVICE + REPAIR + INSTALLATION</Text>
              <Text style={styles.footerSeparator}>|</Text>
              <Text style={styles.footerLabelBlue}>KITCHEN EXHAUST:</Text>
              <Text style={styles.footerValue}>FABRICATION + MAINTENANCE + REPAIRS</Text>
            </View>
            <View style={styles.footerServiceRow}>
              <Text style={styles.footerLabelOrange}>KITCHEN EQUIPMENT:</Text>
              <Text style={styles.footerValue}>CLEANING + REPAIRS + SALES</Text>
              <Text style={styles.footerSeparator}>|</Text>
              <Text style={styles.footerLabelBlue}>DEEP CLEANING:</Text>
              <Text style={styles.footerValue}>DE-GREASING + DE-SCALING</Text>
            </View>
          </View>

          <View style={styles.footerImages}>
            {assets?.footerLeft && <Image src={assets.footerLeft} style={styles.footerImage} />}
            {assets?.footerRight && <Image src={assets.footerRight} style={styles.footerImage} />}
          </View>
          <View style={styles.footerBottomLine} />
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>New Air Conditioners</Text>
            <Text style={[styles.footerLink, { color: INCIDENT_REPORT_COLORS.blue }]}>AC Maintenance</Text>
            <Text style={styles.footerLink}>Kitchen Exhaust/Duct Systems</Text>
            <Text style={[styles.footerLink, { color: INCIDENT_REPORT_COLORS.blue }]}>Kitchen Equipment Deep Cleaning</Text>
          </View>
          <Text style={styles.footerTagline}>
            Thank you for choosing Ark Air Conditioning, Refrigeration & Kitchen Maintenance Ltd • www.arkmaintenance.com
          </Text>
        </View>
      </Page>
    </Document>
  )
}
