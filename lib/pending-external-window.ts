function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildLoadingHtml(label: string) {
  const safeLabel = escapeHtml(label)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeLabel}</title>
    <style>
      :root {
        color-scheme: light;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f7f4ef;
        color: #0f172a;
        font-family: Arial, Helvetica, sans-serif;
      }

      .panel {
        width: min(420px, calc(100vw - 40px));
        padding: 28px 24px;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        text-align: center;
      }

      .spinner {
        width: 36px;
        height: 36px;
        margin: 0 auto 18px;
        border-radius: 999px;
        border: 3px solid #dbeafe;
        border-top-color: #22c55e;
        animation: spin 0.9s linear infinite;
      }

      h1 {
        margin: 0 0 10px;
        font-size: 20px;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: #475569;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="panel">
      <div class="spinner"></div>
      <h1>${safeLabel}</h1>
      <p>Your document is being prepared. This tab will continue to WhatsApp automatically.</p>
    </div>
  </body>
</html>`
}

export function openPendingExternalWindow(label = 'Opening WhatsApp') {
  if (typeof window === 'undefined') return null

  const pendingWindow = window.open('', '_blank')
  if (!pendingWindow) return null

  try {
    pendingWindow.document.open()
    pendingWindow.document.write(buildLoadingHtml(label))
    pendingWindow.document.close()
  } catch {
    // Ignore cross-browser document write issues and keep the window reference.
  }

  return pendingWindow
}

export function closePendingExternalWindow(pendingWindow: Window | null) {
  if (pendingWindow && !pendingWindow.closed) {
    pendingWindow.close()
  }
}

export function redirectPendingExternalWindow(pendingWindow: Window | null, url: string) {
  if (pendingWindow && !pendingWindow.closed) {
    pendingWindow.location.replace(url)
    return true
  }

  return !!window.open(url, '_blank', 'noopener,noreferrer')
}
