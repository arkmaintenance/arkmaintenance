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
import {
  buildClientReportDocumentPages,
  CLIENT_REPORT_COLORS,
  CLIENT_REPORT_LAYOUT,
  CLIENT_REPORT_META_LABEL_DATE,
  CLIENT_REPORT_META_LABEL_PREPARED_FOR,
  CLIENT_REPORT_PAGE_HEIGHT,
  CLIENT_REPORT_PAGE_WIDTH,
  CLIENT_REPORT_THANK_YOU,
  type ClientReportContentPage,
  type ClientReportPdfData,
} from '@/lib/client-reports'

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    width: CLIENT_REPORT_PAGE_WIDTH,
    height: CLIENT_REPORT_PAGE_HEIGHT,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CLIENT_REPORT_PAGE_WIDTH,
    height: CLIENT_REPORT_PAGE_HEIGHT,
  },
  titleTextBlock: {
    position: 'absolute',
    left: CLIENT_REPORT_LAYOUT.titleTextLeft,
    width: CLIENT_REPORT_LAYOUT.titleTextWidth,
  },
  titleLine: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: 700,
    lineHeight: 1.16,
    letterSpacing: 0.12,
  },
  metaCard: {
    position: 'absolute',
    left: CLIENT_REPORT_LAYOUT.metaCardLeft,
    width: CLIENT_REPORT_LAYOUT.metaCardWidth,
    borderRadius: CLIENT_REPORT_LAYOUT.metaCardRadius,
    borderWidth: CLIENT_REPORT_LAYOUT.metaCardBorderWidth,
    borderColor: CLIENT_REPORT_COLORS.metaCardBorder,
    backgroundColor: CLIENT_REPORT_COLORS.metaCardBackground,
  },
  metaCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
    paddingTop: CLIENT_REPORT_LAYOUT.metaPaddingTop,
    paddingRight: CLIENT_REPORT_LAYOUT.metaPaddingRight,
    paddingBottom: CLIENT_REPORT_LAYOUT.metaPaddingBottom,
    paddingLeft: CLIENT_REPORT_LAYOUT.metaPaddingLeft,
  },
  metaLeftColumn: {
    width: CLIENT_REPORT_LAYOUT.metaContentLeftWidth,
  },
  metaRightColumn: {
    width: CLIENT_REPORT_LAYOUT.metaContentRightWidth,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 6.75,
    fontWeight: 700,
    letterSpacing: 0.7,
    color: CLIENT_REPORT_COLORS.label,
  },
  metaValueGroup: {
    marginTop: CLIENT_REPORT_LAYOUT.metaLabelToValueGap,
  },
  metaText: {
    color: CLIENT_REPORT_COLORS.body,
  },
  contactName: {
    fontSize: 9.75,
    fontWeight: 700,
    lineHeight: 1,
  },
  clientName: {
    fontSize: 9,
    lineHeight: 1,
  },
  clientNameGroup: {
    marginTop: CLIENT_REPORT_LAYOUT.metaContactToClientGap,
  },
  addressGroup: {
    marginTop: CLIENT_REPORT_LAYOUT.metaClientToAddressGap,
  },
  addressLine: {
    color: CLIENT_REPORT_COLORS.muted,
    fontSize: 8.25,
    lineHeight: 1.18,
  },
  noBottomGap: {
    marginBottom: 0,
  },
  dateValue: {
    fontSize: 9.75,
    fontWeight: 700,
    lineHeight: 1,
    color: CLIENT_REPORT_COLORS.body,
    textAlign: 'right',
  },
  bodyOverlay: {
    position: 'absolute',
    left: CLIENT_REPORT_LAYOUT.bodyLeft,
    width: CLIENT_REPORT_LAYOUT.titleBoxWidth,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: CLIENT_REPORT_LAYOUT.sectionGap,
  },
  sectionHeading: {
    color: CLIENT_REPORT_COLORS.heading,
    fontSize: CLIENT_REPORT_LAYOUT.sectionHeadingFontSize,
    fontWeight: 700,
    lineHeight: CLIENT_REPORT_LAYOUT.sectionHeadingLineHeight,
  },
  sectionUnderline: {
    marginTop: CLIENT_REPORT_LAYOUT.sectionUnderlineGap,
    width: '100%',
    height: CLIENT_REPORT_LAYOUT.sectionUnderlineHeight,
    backgroundColor: CLIENT_REPORT_COLORS.underline,
  },
  paragraphs: {
    marginTop: 9,
    marginLeft: CLIENT_REPORT_LAYOUT.bulletIndent,
  },
  paragraph: {
    marginBottom: CLIENT_REPORT_LAYOUT.pointGap,
  },
  paragraphLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletCell: {
    width: CLIENT_REPORT_LAYOUT.bulletTextOffset,
    color: CLIENT_REPORT_COLORS.body,
    fontSize: CLIENT_REPORT_LAYOUT.pointFontSize,
    lineHeight: CLIENT_REPORT_LAYOUT.pointLineHeight,
  },
  paragraphLine: {
    color: CLIENT_REPORT_COLORS.body,
    fontSize: CLIENT_REPORT_LAYOUT.pointFontSize,
    lineHeight: CLIENT_REPORT_LAYOUT.pointLineHeight,
    flexGrow: 1,
  },
})

interface ClientReportPdfDocumentProps {
  data: ClientReportPdfData
}

function ClientReportContentPdfPage({
  page,
  data,
  showThankYou,
}: {
  page: ClientReportContentPage
  data: ClientReportPdfData
  showThankYou: boolean
}) {
  return (
    <Page size="A4" style={styles.page}>
      {data.assets?.content_page_background ? (
        <Image fixed src={data.assets.content_page_background} style={styles.background} />
      ) : null}

      <View
        style={{
          position: 'absolute',
          top: CLIENT_REPORT_LAYOUT.titleMaskTop,
          left: CLIENT_REPORT_LAYOUT.titleMaskLeft,
          width: CLIENT_REPORT_LAYOUT.titleMaskWidth,
          height: page.layout.headerMaskHeight,
          backgroundColor: '#ffffff',
        }}
      />

      <Svg
        style={{
          position: 'absolute',
          top: CLIENT_REPORT_LAYOUT.titleBoxTop,
          left: CLIENT_REPORT_LAYOUT.titleBoxLeft,
          width: CLIENT_REPORT_LAYOUT.titleBoxWidth,
          height: page.layout.titleBoxHeight,
        }}
      >
        <Defs>
          <LinearGradient id="clientReportTitleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={CLIENT_REPORT_COLORS.titleStart} />
            <Stop offset="100%" stopColor={CLIENT_REPORT_COLORS.titleEnd} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={CLIENT_REPORT_LAYOUT.titleBoxWidth}
          height={page.layout.titleBoxHeight}
          rx={CLIENT_REPORT_LAYOUT.titleBoxRadius}
          ry={CLIENT_REPORT_LAYOUT.titleBoxRadius}
          fill="url(#clientReportTitleGradient)"
        />
      </Svg>

      <View style={[styles.titleTextBlock, { top: page.layout.titleTextTop }]}>
        {page.titleLines.map((line, index) => (
          <Text key={`${page.key}-title-${index}`} style={styles.titleLine}>
            {line}
          </Text>
        ))}
      </View>

      <View
        style={[
          styles.metaCard,
          {
            top: page.layout.metaCardTop,
            height: page.layout.metaCardHeight,
          },
        ]}
      >
        <View style={styles.metaCardContent}>
          <View style={styles.metaLeftColumn}>
            <Text style={styles.label}>{CLIENT_REPORT_META_LABEL_PREPARED_FOR}</Text>

            <View style={styles.metaValueGroup}>
              {page.layout.contactPersonLines.map((line, index) => (
                <Text key={`${page.key}-contact-${index}`} style={[styles.metaText, styles.contactName]}>
                  {line}
                </Text>
              ))}

              <View style={styles.clientNameGroup}>
                {page.layout.clientNameLines.map((line, index) => (
                  <Text key={`${page.key}-client-${index}`} style={[styles.metaText, styles.clientName]}>
                    {line}
                  </Text>
                ))}
              </View>

              <View style={styles.addressGroup}>
                {page.layout.addressLines.map((line, index) => (
                  <Text
                    key={`${page.key}-address-${index}`}
                    style={[styles.addressLine, index === page.layout.addressLines.length - 1 ? styles.noBottomGap : {}]}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.metaRightColumn}>
            <Text style={styles.label}>{CLIENT_REPORT_META_LABEL_DATE}</Text>

            <View style={styles.metaValueGroup}>
              <Text style={styles.dateValue}>{data.report_date}</Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.bodyOverlay,
          {
            top: page.layout.bodyTop,
            height: page.layout.bodyHeight,
          },
        ]}
      >
        <View style={{ paddingTop: page.layout.bodyContentTopPadding }}>
          {page.sections.map((section, sectionIndex) => (
            <View
              key={section.key}
              style={[styles.section, sectionIndex === page.sections.length - 1 ? styles.noBottomGap : {}]}
            >
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              <View style={styles.sectionUnderline} />

              <View style={styles.paragraphs}>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <View
                    key={`${section.key}-paragraph-${paragraphIndex}`}
                    style={[
                      styles.paragraph,
                      paragraphIndex === section.paragraphs.length - 1 ? styles.noBottomGap : {},
                    ]}
                  >
                    {paragraph.lines.map((line, lineIndex) => (
                      <View key={`${section.key}-line-${paragraphIndex}-${lineIndex}`} style={styles.paragraphLineRow}>
                        <Text style={styles.bulletCell}>{lineIndex === 0 ? '\u2022' : ''}</Text>
                        <Text style={styles.paragraphLine}>{line || ' '}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {showThankYou ? (
        <Text
          style={{
            position: 'absolute',
            top: CLIENT_REPORT_LAYOUT.footerThankYouTop,
            left: CLIENT_REPORT_LAYOUT.footerThankYouLeft,
            width: CLIENT_REPORT_LAYOUT.footerThankYouWidth,
            fontSize: CLIENT_REPORT_LAYOUT.footerThankYouFontSize,
            lineHeight: 1,
            textAlign: 'center',
            color: CLIENT_REPORT_COLORS.thankYou,
          }}
        >
          {CLIENT_REPORT_THANK_YOU}
        </Text>
      ) : null}
    </Page>
  )
}

export function ClientReportPdfDocument({ data }: ClientReportPdfDocumentProps) {
  const pages = buildClientReportDocumentPages(data)

  return (
    <Document>
      {pages.map((page, index) => {
        return (
          <ClientReportContentPdfPage
            key={page.key}
            page={page}
            data={data}
            showThankYou={index === 0}
          />
        )
      })}
    </Document>
  )
}
