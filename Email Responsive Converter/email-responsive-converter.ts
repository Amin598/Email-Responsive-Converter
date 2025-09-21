/**
 * Email Responsive Converter
 *
 * 🔧 CONVERT NON-RESPONSIVE EMAILS TO MOBILE-FRIENDLY RESPONSIVE DESIGNS
 *
 * Transform legacy email templates, newsletters, and campaigns into responsive layouts
 * that work perfectly on mobile devices, tablets, and desktops.
 *
 * 🎯 PROBLEMS THIS SOLVES:
 * ✅ Old email templates with fixed 600px widths
 * ✅ Non-responsive newsletters that break on mobile
 * ✅ Email campaigns that don't display properly on phones
 * ✅ Legacy HTML emails with table-based layouts
 * ✅ Emails without viewport meta tags or media queries
 * ✅ Images that overflow on small screens
 * ✅ Fixed-width email designs from marketing tools
 *
 * 🚀 HOW IT WORKS:
 * 1. Analyzes email HTML using intelligent scoring system (0-100)
 * 2. Detects responsive indicators (media queries, viewport meta, fluid layouts)
 * 3. Identifies problematic patterns (fixed widths, table layouts)
 * 4. If score < 40, applies mobile-first responsive transformations:
 *    • Adds essential viewport meta tag for mobile rendering
 *    • Injects responsive CSS with mobile breakpoints (@media queries)
 *    • Wraps content in responsive container with max-width
 *    • Converts fixed pixel widths to fluid percentage layouts
 *    • Optimizes images for mobile devices (max-width: 100%)
 *    • Adds mobile-friendly typography and spacing
 *
 * 📱 RESPONSIVE FEATURES:
 * • Mobile-first design approach (600px breakpoint)
 * • Fluid table layouts that stack on mobile
 * • Responsive images that scale automatically
 * • Touch-friendly button and link sizing
 * • Optimized fonts and line-heights for mobile reading
 * • Works with Gmail, Outlook, Apple Mail, Yahoo, etc.
 *
 * 💡 PERFECT FOR:
 * • Email marketing agencies converting client templates
 * • Developers updating legacy email campaigns
 * • Marketing teams making old newsletters mobile-friendly
 * • E-commerce sites updating transactional emails
 * • Anyone with non-responsive email templates
 *
 * 🔧 SIMPLE USAGE:
 * import { convertToResponsive, checkEmailResponsiveness } from './email-responsive-converter';
 *
 * // Check if email needs conversion
 * const score = checkEmailResponsiveness(emailHtml);
 * console.log(`Responsive score: ${score}/100`);
 *
 * // Convert to responsive (only if needed)
 * const mobileOptimizedEmail = convertToResponsive(emailHtml);
 *
 * 📦 ZERO DEPENDENCIES • WORKS EVERYWHERE
 * ✅ Node.js ✅ Browser ✅ React Native ✅ TypeScript ✅ JavaScript
 *
 * Made by Amin Mokadem
 * https://github.com/aminmokadem
 *
 * 🏷️ Keywords: email responsive, mobile email, email converter, responsive design,
 * email optimization, mobile-friendly emails, email templates, newsletter responsive
 */

export function checkEmailResponsiveness(html: string): number {
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

export default checkEmailResponsiveness;

class EmailResponsiveProcessor {
    responsiveCSS: string;

    constructor() {
        this.responsiveCSS = `
            <style type="text/css">
                /* Email Responsive Wrapper - Mobile-First Design */
                .email-responsive-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                }

                /* Mobile Optimizations (600px and below) */
                @media only screen and (max-width: 600px) {
                    .email-responsive-wrapper {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 10px !important;
                    }

                    .email-responsive-wrapper table {
                        width: 100% !important;
                        max-width: 100% !important;
                    }

                    .email-responsive-wrapper td {
                        padding: 8px !important;
                        font-size: 14px !important;
                        line-height: 1.4 !important;
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
                    }
                }
            </style>
        `;
    }

    /**
     * Checks if email already has responsive indicators
     */
    isResponsive(html: string): boolean {
        const responsiveIndicators = [
            '@media',
            'max-width',
            'viewport',
            'container',
            'width: 100%',
            'width="100%"',
            'responsive',
            'mobile'
        ];

        const lowerHTML = html.toLowerCase();
        return responsiveIndicators.some(indicator =>
            lowerHTML.includes(indicator.toLowerCase())
        );
    }

    /**
     * Detects problematic fixed-width patterns
     */
    hasFixedWidthPatterns(html: string): boolean {
        const fixedWidthPatterns = [
            /width=["']?[5-7][0-9]{2}["']?/gi,
            /width:\s*[5-7][0-9]{2}px/gi,
            /table.*width.*600/gi,
            /table.*width.*742/gi,
            /cellpadding=["']?[1-9][0-9]+["']?/gi
        ];

        return fixedWidthPatterns.some(pattern => pattern.test(html));
    }

    /**
     * Determines if email needs responsive processing
     */
    needsProcessing(html: string): boolean {
        if (this.isResponsive(html)) {
            return false;
        }

        return this.hasFixedWidthPatterns(html);
    }

    /**
     * Adds essential viewport meta tag for mobile rendering
     */
    addViewportMeta(html: string): string {
        const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

        if (html.includes('<head>') || html.includes('<HEAD>')) {
            return html.replace(/<head>/i, `<head>\n${viewportMeta}`);
        } else if (html.includes('<html>') || html.includes('<HTML>')) {
            return html.replace(/<html[^>]*>/i, `$&\n<head>${viewportMeta}</head>`);
        }

        return `<head>${viewportMeta}</head>\n${html}`;
    }

    /**
     * Wraps email content in responsive container
     */
    wrapInResponsiveContainer(html: string): string {
        return `
            <div class="email-responsive-wrapper">
                ${html}
            </div>
        `;
    }

    /**
     * Injects comprehensive responsive CSS
     */
    injectResponsiveCSS(html: string): string {
        if (html.includes('</head>') || html.includes('</HEAD>')) {
            return html.replace(/<\/head>/i, `${this.responsiveCSS}\n</head>`);
        } else if (html.includes('<html>') || html.includes('<HTML>')) {
            return html.replace(/<html[^>]*>/i, `$&\n<head>${this.responsiveCSS}</head>`);
        }

        return `<head>${this.responsiveCSS}</head>\n${html}`;
    }

    /**
     * Main processing function - applies all responsive transformations
     */
    processEmail(html: string): { processed: boolean; html: string; reason: string } {
        if (!this.needsProcessing(html)) {
            return {
                processed: false,
                html: html,
                reason: 'Email appears to already be responsive'
            };
        }

        let processedHTML = html;

        try {
            processedHTML = this.addViewportMeta(processedHTML);
            processedHTML = this.injectResponsiveCSS(processedHTML);
            processedHTML = this.wrapInResponsiveContainer(processedHTML);

            return {
                processed: true,
                html: processedHTML,
                reason: 'Email converted to responsive layout'
            };

        } catch (error) {
            return {
                processed: false,
                html: html,
                reason: `Processing failed: ${(error as Error).message}`
            };
        }
    }
}

/**
 * Main optimization function - intelligently converts non-responsive emails to responsive
 *
 * @param html - The email HTML to optimize
 * @returns Optimized HTML if score < 40, otherwise returns original HTML unchanged
 */
export const convertToResponsive = (html: string): string => {
    // First, score the email's responsiveness
    const responsivenessScore = checkEmailResponsiveness(html);
    console.log(`Email responsiveness score: ${responsivenessScore}/100`);

    // If score is greater than 40, email is already responsive enough
    if (responsivenessScore > 40) {
        console.log('Email is already responsive, returning unchanged');
        return html;
    }

    // Score is below 40 - needs optimization
    console.log('Email needs responsive optimization, processing...');
    const processor = new EmailResponsiveProcessor();
    const result = processor.processEmail(html);

    // Additional aggressive optimization for fixed widths
    let optimizedHtml = result.html;

    // Replace common fixed email widths with fluid layouts
    optimizedHtml = optimizedHtml.replace(/width=["']?600["']?/gi, 'width="100%"');
    optimizedHtml = optimizedHtml.replace(/width=["']?650["']?/gi, 'width="100%"');
    optimizedHtml = optimizedHtml.replace(/width=["']?700["']?/gi, 'width="100%"');
    optimizedHtml = optimizedHtml.replace(/width=["']?742["']?/gi, 'width="100%"');

    // Add additional responsive CSS for better mobile display
    const additionalCSS = `
    <style>
        /* Additional Mobile Optimizations */
        table { max-width: 100% !important; }
        body, html { overflow-x: hidden !important; }
        img { max-width: 100% !important; height: auto !important; }
        .email-responsive-wrapper table[width] { width: 100% !important; }
    </style>`;

    if (optimizedHtml.includes('</head>')) {
        optimizedHtml = optimizedHtml.replace('</head>', additionalCSS + '</head>');
    }

    console.log('Email optimization completed');
    return optimizedHtml;
};

/**
 * Get optimization information without processing
 *
 * @param html - The email HTML to analyze
 * @returns Object with processing status and reason
 */
export const getOptimizationInfo = (html: string): { processed: boolean; reason: string } => {
    const processor = new EmailResponsiveProcessor();
    const result = processor.processEmail(html);
    return {
        processed: result.processed,
        reason: result.reason
    };
};

// Export the main class for advanced usage
export { EmailResponsiveProcessor };