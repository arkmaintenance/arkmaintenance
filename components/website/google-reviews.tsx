'use client'

import { useEffect, useRef } from 'react'

function getPageSizeForWidth(width: number): number {
  if (width < 450) return 1
  if (width < 675) return 2
  if (width < 918) return 3
  if (width < 1144) return 4
  return 5
}

const WIDGET_SRC_BASE =
  'https://www.localmarketingmanager.com/api/reviews/ark-air-conditioning-refrigeration-kitchen-maintenance-ltd-review-widget?pageSize='

export function GoogleReviews() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function setIframeSrc() {
      const iframe = iframeRef.current
      const container = containerRef.current
      if (!iframe || !container) return
      const width = container.offsetWidth
      if (width === 0) {
        setTimeout(setIframeSrc, 50)
        return
      }
      const pageSize = getPageSizeForWidth(width)
      const expectedSrc = WIDGET_SRC_BASE + pageSize
      if (iframe.src !== expectedSrc) {
        iframe.src = expectedSrc
      }
    }

    setIframeSrc()
    const timer = setTimeout(setIframeSrc, 50)
    window.addEventListener('resize', setIframeSrc)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', setIframeSrc)
    }
  }, [])

  return (
    <section className="bg-black py-16 border-t border-white/5">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-[#f97316] text-sm font-semibold uppercase tracking-widest mb-2">Google Reviews</p>
          <h2 className="text-[28px] font-bold text-white">What Clients Are Saying</h2>
        </div>
        <div ref={containerRef} id="reviewsWidgetContainer" className="w-full">
          <iframe
            ref={iframeRef}
            id="reviewsWidget"
            title="Google Reviews Widget"
            style={{ width: '100%', border: 'none', minHeight: '300px' }}
          />
        </div>
      </div>
    </section>
  )
}
