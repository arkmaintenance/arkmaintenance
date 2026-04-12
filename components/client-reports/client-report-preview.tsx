import type { CSSProperties } from 'react'
import {
  buildClientReportDocumentPages,
  buildClientReportPdfData,
  CLIENT_REPORT_COLORS,
  CLIENT_REPORT_LAYOUT,
  CLIENT_REPORT_META_LABEL_DATE,
  CLIENT_REPORT_META_LABEL_PREPARED_FOR,
  CLIENT_REPORT_PREVIEW_PAGE_HEIGHT,
  CLIENT_REPORT_PREVIEW_PAGE_WIDTH,
  CLIENT_REPORT_TEMPLATE_PAGE_1,
  CLIENT_REPORT_THANK_YOU,
  type ClientReportContentPage,
  type ClientReportDraft,
} from '@/lib/client-reports'
import { cn } from '@/lib/utils'

interface ClientReportPreviewProps {
  data: ClientReportDraft
  className?: string
}

const pageStyle: CSSProperties = {
  width: CLIENT_REPORT_PREVIEW_PAGE_WIDTH,
  minHeight: CLIENT_REPORT_PREVIEW_PAGE_HEIGHT,
  backgroundColor: '#ffffff',
  color: CLIENT_REPORT_COLORS.body,
  fontFamily: 'Arial, Helvetica, sans-serif',
}

function ClientReportContentPreviewPage({
  page,
  reportDate,
  showThankYou,
}: {
  page: ClientReportContentPage
  reportDate: string
  showThankYou: boolean
}) {
  return (
    <article
      className="relative overflow-hidden border border-slate-300 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]"
      style={pageStyle}
    >
      <img
        src={CLIENT_REPORT_TEMPLATE_PAGE_1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />

      <div
        className="absolute bg-white"
        style={{
          top: `${CLIENT_REPORT_LAYOUT.titleMaskTop}pt`,
          left: `${CLIENT_REPORT_LAYOUT.titleMaskLeft}pt`,
          width: `${CLIENT_REPORT_LAYOUT.titleMaskWidth}pt`,
          height: `${page.layout.headerMaskHeight}pt`,
        }}
      />

      <div
        className="absolute"
        style={{
          top: `${CLIENT_REPORT_LAYOUT.titleBoxTop}pt`,
          left: `${CLIENT_REPORT_LAYOUT.titleBoxLeft}pt`,
          width: `${CLIENT_REPORT_LAYOUT.titleBoxWidth}pt`,
          height: `${page.layout.titleBoxHeight}pt`,
          borderRadius: `${CLIENT_REPORT_LAYOUT.titleBoxRadius}pt`,
          background: `linear-gradient(90deg, ${CLIENT_REPORT_COLORS.titleStart} 0%, ${CLIENT_REPORT_COLORS.titleEnd} 100%)`,
        }}
      />

      <div
        className="absolute text-white"
        style={{
          top: `${page.layout.titleTextTop}pt`,
          left: `${CLIENT_REPORT_LAYOUT.titleTextLeft}pt`,
          width: `${CLIENT_REPORT_LAYOUT.titleTextWidth}pt`,
          fontSize: '13.5pt',
          lineHeight: 1.16,
          letterSpacing: '0.01em',
        }}
      >
        {page.titleLines.map((line, index) => (
          <p key={`${page.key}-title-${index}`} className="font-bold uppercase">
            {line}
          </p>
        ))}
      </div>

      <div
        className="absolute"
        style={{
          top: `${page.layout.metaCardTop}pt`,
          left: `${CLIENT_REPORT_LAYOUT.metaCardLeft}pt`,
          width: `${CLIENT_REPORT_LAYOUT.metaCardWidth}pt`,
          height: `${page.layout.metaCardHeight}pt`,
          boxSizing: 'border-box',
          borderRadius: `${CLIENT_REPORT_LAYOUT.metaCardRadius}pt`,
          border: `${CLIENT_REPORT_LAYOUT.metaCardBorderWidth}pt solid ${CLIENT_REPORT_COLORS.metaCardBorder}`,
          backgroundColor: CLIENT_REPORT_COLORS.metaCardBackground,
          padding: `${CLIENT_REPORT_LAYOUT.metaPaddingTop}pt ${CLIENT_REPORT_LAYOUT.metaPaddingRight}pt ${CLIENT_REPORT_LAYOUT.metaPaddingBottom}pt ${CLIENT_REPORT_LAYOUT.metaPaddingLeft}pt`,
        }}
      >
        <div className="flex h-full justify-between gap-6">
          <div style={{ width: `${CLIENT_REPORT_LAYOUT.metaContentLeftWidth}pt` }}>
            <p
              className="font-bold tracking-[0.12em]"
              style={{
                fontSize: '6.75pt',
                color: CLIENT_REPORT_COLORS.label,
              }}
            >
              {CLIENT_REPORT_META_LABEL_PREPARED_FOR}
            </p>

            <div style={{ marginTop: `${CLIENT_REPORT_LAYOUT.metaLabelToValueGap}pt` }}>
              {page.layout.contactPersonLines.map((line, index) => (
                <p
                  key={`${page.key}-contact-${index}`}
                  className="font-bold"
                  style={{
                    fontSize: '9.75pt',
                    lineHeight: 1,
                    color: CLIENT_REPORT_COLORS.body,
                  }}
                >
                  {line}
                </p>
              ))}

              <div style={{ marginTop: `${CLIENT_REPORT_LAYOUT.metaContactToClientGap}pt` }}>
                {page.layout.clientNameLines.map((line, index) => (
                  <p
                    key={`${page.key}-client-${index}`}
                    style={{
                      fontSize: '9pt',
                      lineHeight: 1,
                      color: CLIENT_REPORT_COLORS.body,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div style={{ marginTop: `${CLIENT_REPORT_LAYOUT.metaClientToAddressGap}pt` }}>
                {page.layout.addressLines.map((line, index) => (
                  <p
                    key={`${page.key}-address-${index}`}
                    style={{
                      fontSize: '8.25pt',
                      lineHeight: 1.18,
                      color: CLIENT_REPORT_COLORS.muted,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex flex-col items-end text-right"
            style={{ width: `${CLIENT_REPORT_LAYOUT.metaContentRightWidth}pt` }}
          >
            <p
              className="font-bold tracking-[0.12em]"
              style={{
                fontSize: '6.75pt',
                color: CLIENT_REPORT_COLORS.label,
              }}
            >
              {CLIENT_REPORT_META_LABEL_DATE}
            </p>

            <div style={{ marginTop: `${CLIENT_REPORT_LAYOUT.metaLabelToValueGap}pt` }}>
              <p
                className="font-bold"
                style={{
                  fontSize: '9.75pt',
                  lineHeight: 1,
                  color: CLIENT_REPORT_COLORS.body,
                }}
              >
                {reportDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bg-white"
        style={{
          top: `${page.layout.bodyTop}pt`,
          left: `${CLIENT_REPORT_LAYOUT.bodyLeft}pt`,
          width: `${CLIENT_REPORT_LAYOUT.titleBoxWidth}pt`,
          height: `${page.layout.bodyHeight}pt`,
        }}
      >
        <div style={{ paddingTop: `${page.layout.bodyContentTopPadding}pt` }}>
          {page.sections.map((section, sectionIndex) => (
            <section
              key={section.key}
              style={{
                marginBottom:
                  sectionIndex === page.sections.length - 1
                    ? 0
                    : `${CLIENT_REPORT_LAYOUT.sectionGap}pt`,
              }}
            >
              <h2
                className="font-bold"
                style={{
                  fontSize: `${CLIENT_REPORT_LAYOUT.sectionHeadingFontSize}pt`,
                  lineHeight: CLIENT_REPORT_LAYOUT.sectionHeadingLineHeight,
                  color: CLIENT_REPORT_COLORS.heading,
                }}
              >
                {section.heading}
              </h2>

              <div
                className="w-full"
                style={{
                  marginTop: `${CLIENT_REPORT_LAYOUT.sectionUnderlineGap}pt`,
                  height: `${CLIENT_REPORT_LAYOUT.sectionUnderlineHeight}pt`,
                  backgroundColor: CLIENT_REPORT_COLORS.underline,
                }}
              />

              <div
                style={{
                  marginTop: '9pt',
                  marginLeft: `${CLIENT_REPORT_LAYOUT.bulletIndent}pt`,
                }}
              >
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <div
                    key={`${section.key}-paragraph-${paragraphIndex}`}
                    style={{
                      marginBottom:
                        paragraphIndex === section.paragraphs.length - 1
                          ? 0
                          : `${CLIENT_REPORT_LAYOUT.pointGap}pt`,
                    }}
                  >
                    {paragraph.lines.map((line, lineIndex) => (
                      <div
                        key={`${section.key}-line-${paragraphIndex}-${lineIndex}`}
                        className="flex"
                        style={{
                          fontSize: `${CLIENT_REPORT_LAYOUT.pointFontSize}pt`,
                          lineHeight: CLIENT_REPORT_LAYOUT.pointLineHeight,
                          color: CLIENT_REPORT_COLORS.body,
                        }}
                      >
                        <span
                          className="shrink-0"
                          style={{ width: `${CLIENT_REPORT_LAYOUT.bulletTextOffset}pt` }}
                        >
                          {lineIndex === 0 ? '\u2022' : ''}
                        </span>
                        <span>{line || '\u00A0'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {showThankYou ? (
        <p
          className="absolute whitespace-nowrap text-center"
          style={{
            top: `${CLIENT_REPORT_LAYOUT.footerThankYouTop}pt`,
            left: `${CLIENT_REPORT_LAYOUT.footerThankYouLeft}pt`,
            width: `${CLIENT_REPORT_LAYOUT.footerThankYouWidth}pt`,
            fontSize: `${CLIENT_REPORT_LAYOUT.footerThankYouFontSize}pt`,
            lineHeight: 1,
            color: CLIENT_REPORT_COLORS.thankYou,
          }}
        >
          {CLIENT_REPORT_THANK_YOU}
        </p>
      ) : null}
    </article>
  )
}

export function ClientReportPreview({ data, className }: ClientReportPreviewProps) {
  const preview = buildClientReportPdfData(data)
  const pages = buildClientReportDocumentPages(preview)

  return (
    <div className={cn('mx-auto flex w-fit max-w-full flex-col gap-6', className)}>
      {pages.map((page, index) => {
        return (
          <ClientReportContentPreviewPage
            key={page.key}
            page={page}
            reportDate={preview.report_date}
            showThankYou={index === 0}
          />
        )
      })}
    </div>
  )
}
