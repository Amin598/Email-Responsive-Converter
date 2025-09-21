// Returns a single integer score 0..100 for "responsiveness"
export function scoreEmailResponsiveness(html: string): number {
  const patterns: Record<string, { regex: RegExp; weight: number }> = {
    // Positive indicators (added once if at least one match exists)
    mediaQueries:      { regex: /@media\s+(?:only\s+)?screen\s+and\s*\([^)]*(?:max-width|min-width)[^)]*\)/gi, weight: 40 },
    viewport:          { regex: /<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/gi, weight: 25 },
    fluidTables:       { regex: /width\s*[:=]\s*["']?100%["']?/gi, weight: 15 },
    mobileClasses:     { regex: /\.(mobile|mob|hide|show)\d*\w*\s*\{[^}]*\}/gi, weight: 20 },
    outlookConditional:{ regex: /<!--\[if\s+(?:gte\s+)?mso\s*\d*\]>[\s\S]*?<!\[endif\]-->/gi, weight: 10 },
    responsiveFonts:   { regex: /font-size\s*:\s*\d+(?:\.\d+)?(?:em|rem|vw|vh|%)\s*[;!]/gi, weight: 8  },
    displayProperties: { regex: /display\s*:\s*(?:none|block|inline-block)\s*!important/gi, weight: 12 },
    maxWidth:          { regex: /max-width\s*[:=]\s*["']?\d+(?:px|em|rem|%)["']?/gi, weight: 15 },
    flexbox:           { regex: /display\s*:\s*(?:flex|inline-flex)|flex-(?:direction|wrap|basis)/gi, weight: 18 },
    grid:              { regex: /display\s*:\s*(?:grid|inline-grid)|grid-(?:template|area|column|row)/gi, weight: 18 },
  };

  const antiPatterns: Record<string, { regex: RegExp; weight: number }> = {
    fixedWidths: { regex: /width\s*[:=]\s*["']?\d{3,}px["']?/gi, weight: -15 },
    fixedTables: { regex: /table-layout\s*:\s*fixed/gi, weight: -5  },
  };

  let totalScore = 0;
  let maxPossible = 0;

  // Positive indicators: add weight once if any match exists
  for (const key in patterns) {
    const { regex, weight } = patterns[key];
    maxPossible += weight;
    if (regex.test(html)) totalScore += weight;
  }

  // Negative indicators: subtract once if any match exists
  for (const key in antiPatterns) {
    const { regex, weight } = antiPatterns[key];
    if (regex.test(html)) totalScore += weight;
  }

  // Convert to percentage, clamp 0..100, round
  const pct = Math.max(0, Math.min(100, (totalScore / maxPossible) * 100));
  return Math.round(pct);
}

// Enhanced responsive CSS with block display for tables
const enhancedResponsiveCSS = `
<style type="text/css">
    .email-responsive-wrapper {
        max-width: 600px;
        margin: 0 auto;
        width: 100%;
    }

    @media only screen and (max-width: 600px) {
        .email-responsive-wrapper {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 10px !important;
        }

        .email-responsive-wrapper table {
            width: 100% !important;
            max-width: 100% !important;
            /* THIS IS THE KEY ADDITION */
            display: block !important;
        }

        .email-responsive-wrapper tr {
            display: block !important;
            width: 100% !important;
        }

        .email-responsive-wrapper td {
            display: block !important;
            width: 100% !important;
            padding: 8px !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
            text-align: left !important;
        }

        .email-responsive-wrapper h1 {
            font-size: 24px !important;
            line-height: 1.3 !important;
        }

        .email-responsive-wrapper h2 {
            font-size: 20px !important;
            line-height: 1.3 !important;
        }

        .email-responsive-wrapper img {
            max-width: 100% !important;
            height: auto !important;
        }

        /* Override common fixed width patterns */
        .email-responsive-wrapper table[width="600"],
        .email-responsive-wrapper table[width="650"],
        .email-responsive-wrapper table[width="700"],
        .email-responsive-wrapper table[width="742"] {
            width: 100% !important;
            display: block !important;
        }

        /* Force any nested tables to also be responsive */
        .email-responsive-wrapper table table {
            width: 100% !important;
            display: block !important;
        }
    }
</style>
`;

class EmailResponsiveProcessor {
    public responsiveCSS: string;

    constructor() {
        this.responsiveCSS = enhancedResponsiveCSS;
    }

    // 1) Viewport-Meta einfügen (idempotent: vorhandenes ersetzen statt verdoppeln)
    addViewportMeta(html: string): string {
        const viewportMeta =
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        const hasHead = /<head[^>]*>/i.test(html);
        const hasViewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);

        if (hasViewport) {
            // vorhandenes viewport durch unser gewünschtes ersetzen
            return html.replace(/<meta[^>]+name=["']viewport["'][^>]*>/i, viewportMeta);
        }

        if (hasHead) {
            return html.replace(/<head[^>]*>/i, (m) => `${m}\n${viewportMeta}`);
        }

        if (/<html[^>]*>/i.test(html)) {
            return html.replace(/<html[^>]*>/i, (m) => `${m}\n<head>${viewportMeta}</head>`);
        }

        // Kein <html>/<head>: präfixe schlank ohne führende Leerzeile
        return `<head>${viewportMeta}</head>\n${html}`;
    }

    // 2) CSS injizieren (idempotent: nicht erneut einfügen, falls schon da)
    injectResponsiveCSS(html: string): string {
        const cssMarker = '.email-responsive-wrapper';
        const hasOurCSS = new RegExp(
            `<style[^>]*>[^<]*${cssMarker}[^<]*</style>`,
            'i'
        ).test(html);

        if (hasOurCSS) return html; // schon vorhanden

        const hasHeadClose = /<\/head>/i.test(html);
        const hasHtml = /<html[^>]*>/i.test(html);

        if (hasHeadClose) {
            return html.replace(/<\/head>/i, `${this.responsiveCSS}\n</head>`);
        } else if (hasHtml) {
            return html.replace(/<html[^>]*>/i, (m) => `${m}\n<head>${this.responsiveCSS}</head>`);
        }

        return `<head>${this.responsiveCSS}</head>\n${html}`;
    }

    // 3) In Wrapper einbetten (idempotent + gültiges Nesting)
    wrapInResponsiveContainer(html: string): string {
        // Wenn bereits ein Wrapper existiert: nichts tun
        if (/(class=["'][^"']*email-responsive-wrapper[^"']*["'])/i.test(html)) {
            return html;
        }

        if (/<body[^>]*>/i.test(html)) {
            // in den Body einsetzen (korrektes Nesting)
            let out = html.replace(/<body([^>]*)>/i, `<body$1><div class="email-responsive-wrapper">`);
            out = out.replace(/<\/body>/i, `</div></body>`);
            return out;
        }

        // Kein <body>: fallback wie vorher, aber ohne führenden Zeilenumbruch
        return `<div class="email-responsive-wrapper">${html}</div>`;
    }

    // Immer verarbeiten; Reihenfolge bleibt gleich
    processEmail(html: string): { processed: boolean; html: string; reason: string } {
        try {
            let processedHTML = html;
            processedHTML = this.addViewportMeta(processedHTML);
            processedHTML = this.injectResponsiveCSS(processedHTML);
            processedHTML = this.wrapInResponsiveContainer(processedHTML);

            return {
                processed: true,
                html: processedHTML,
                reason: 'Enhanced responsive wrapping applied with block display for tables'
            };
        } catch (error) {
            return {
                processed: false,
                html,
                reason: `Processing failed: ${(error as Error).message}`
            };
        }
    }
}

// Modified optimizeHtml function with the key fix
export const optimizeHtml = (html: string): string => {
    const responsivenessScore = scoreEmailResponsiveness(html);

    if (responsivenessScore > 80) {
        return html;
    }

    const processor = new EmailResponsiveProcessor();
    // Update the processor to use enhanced CSS
    processor.responsiveCSS = enhancedResponsiveCSS;

    const result = processor.processEmail(html);
    let optimizedHtml = result.html;

    // Your existing width replacements
    optimizedHtml = optimizedHtml.replace(/width=["']?600["']?/gi, 'width="100%"');
    optimizedHtml = optimizedHtml.replace(/width=["']?650["']?/gi, 'width="100%"');
    optimizedHtml = optimizedHtml.replace(/width=["']?700["']?/gi, 'width="100%"');
    optimizedHtml = optimizedHtml.replace(/width=["']?742["']?/gi, 'width="100%"');

    // Enhanced additional CSS - THIS IS THE CRITICAL ADDITION
    const additionalCSS = `
    <style>
        /* Force table elements to behave like blocks on mobile */
        @media only screen and (max-width: 600px) {
            .email-responsive-wrapper table,
            .email-responsive-wrapper tbody,
            .email-responsive-wrapper tr,
            .email-responsive-wrapper td {
                display: block !important;
                width: 100% !important;
            }

            /* Prevent horizontal overflow */
            .email-responsive-wrapper {
                overflow-x: hidden !important;
            }

            /* Make images responsive */
            .email-responsive-wrapper img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
            }
        }

        /* Base styles that work everywhere */
        table { max-width: 100% !important; }
        body, html { overflow-x: hidden !important; }
        img { max-width: 100% !important; height: auto !important; }
    </style>`;

    if (optimizedHtml.includes('</head>')) {
        optimizedHtml = optimizedHtml.replace('</head>', additionalCSS + '</head>');
    }

    return optimizedHtml;
};

export const getOptimizationInfo = (html: string): { processed: boolean; reason: string } => {
    const processor = new EmailResponsiveProcessor();
    const result = processor.processEmail(html);
    return {
        processed: result.processed,
        reason: result.reason
    };
};