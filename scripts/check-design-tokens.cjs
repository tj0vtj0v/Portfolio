const assert = require('node:assert/strict');
const fs = require('node:fs');

const tokens = JSON.parse(fs.readFileSync('docs/design/tokens.json', 'utf8'));
const css = fs.readFileSync('src/styles/tokens.css', 'utf8');
const normalize = value => String(value).replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').trim();
const declaration = (source, variable) => {
    const value = source.match(new RegExp(`${variable}:\\s*([^;]+);`));
    assert.ok(value, `Missing ${variable}`);
    return normalize(value[1]);
};

const themeVariables = {
    background: '--color-background', surface: '--color-surface', surfaceSoft: '--color-surface-soft',
    text: '--color-text', textMuted: '--color-text-muted', primary: '--color-primary', onPrimary: '--color-on-primary',
    border: '--color-border', controlBorder: '--color-control-border', secondaryAccent: '--color-secondary-accent', artBackground: '--color-art-background',
    chartExpense: '--color-chart-expense', chartIncome: '--color-chart-income',
    chartText: '--color-chart-text', chartLegend: '--color-chart-legend',
    chartSecondary: '--color-chart-secondary', featuredBackground: '--color-featured-background',
    featuredText: '--color-featured-text', featuredMuted: '--color-featured-muted', sidebarBackground: '--color-sidebar-background',
    gridLine: '--pointer-grid-line', danger: '--color-danger', success: '--color-success', warning: '--color-warning',
    headingFont: '--font-heading', headingWeight: '--font-heading-weight', radiusControl: '--radius-control', radiusPanel: '--radius-panel'
};

for (const theme of ['light', 'dark']) {
    const block = css.match(new RegExp(`:root\\[data-theme='${theme}'\\] \\{([\\s\\S]*?)\\n\\}`));
    assert.ok(block, `Missing ${theme} theme block`);
    for (const [key, variable] of Object.entries(themeVariables)) {
        assert.equal(declaration(block[1], variable), normalize(tokens.themes[theme][key]), `${theme}.${key}`);
    }
    tokens.themes[theme].chartPalette.forEach((color, index) => {
        assert.equal(declaration(block[1], `--color-chart-${index + 1}`), color, `${theme}.chartPalette[${index}]`);
    });
    assert.equal(declaration(block[1], '--font-size-hero'), normalize(tokens.typography[theme === 'light' ? 'heroLight' : 'heroDark']), `${theme}.hero`);
}

const commonVariables = {
    '--font-body': tokens.typography.bodyFont,
    '--font-mono': tokens.typography.monoFont,
    '--font-size-body': tokens.typography.body,
    '--font-size-reading': tokens.typography.readingBody,
    '--font-size-label': tokens.typography.labelMinimum,
    '--font-size-input': tokens.typography.input,
    '--font-size-table': tokens.typography.table,
    '--font-size-metadata': tokens.typography.metadataMinimum,
    '--font-size-page-heading': tokens.typography.pageHeading,
    '--font-size-panel-heading': tokens.typography.panelHeading,
    '--line-height-body': tokens.typography.lineHeight,
    '--line-height-reading': tokens.typography.readingLineHeight,
    '--layout-portfolio-max': tokens.layout.portfolioMaxWidth,
    '--layout-workspace-max': tokens.layout.workspaceMaxWidth,
    '--layout-sidebar': tokens.layout.sidebarWidth,
    '--layout-sidebar-compact': tokens.layout.sidebarCompactWidth,
    '--layout-topbar-min-height': tokens.layout.topbarMinHeight,
    '--control-min-height': tokens.layout.controlMinHeight,
    '--panel-gap': tokens.layout.panelGap,
    '--mobile-gap': tokens.layout.mobileGap,
    '--mobile-gutter': tokens.layout.mobileGutter,
    '--pointer-grid-cell': `${tokens.pointerGrid.cellSizePx}px`,
    '--pointer-grid-radius': `${tokens.pointerGrid.radiusPx}px`,
    '--pointer-grid-fade': `${tokens.pointerGrid.fadeMs}ms`,
    '--pointer-grid-mask': tokens.pointerGrid.mask
};
for (const [variable, expected] of Object.entries(commonVariables)) {
    assert.equal(declaration(css, variable), normalize(expected), variable);
}

const luminance = value => {
    const channels = value.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255)
        .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)];
    return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
};
for (const [theme, values] of Object.entries(tokens.themes)) {
    for (const [foreground, background] of [
        ['chartText', 'surface'], ['chartLegend', 'surface'], ['text', 'background'], ['text', 'surface'], ['textMuted', 'background'], ['textMuted', 'surface'],
        ['onPrimary', 'primary'], ['danger', 'surface'], ['success', 'surface'], ['warning', 'surface'],
        ['featuredText', 'featuredBackground'], ['featuredMuted', 'featuredBackground']
    ]) {
        assert.ok(contrast(values[foreground], values[background]) >= 4.5, `${theme}.${foreground} on ${background} must reach 4.5:1`);
    }
    assert.equal(new Set(values.chartPalette).size, values.chartPalette.length, `${theme} chart colors must be distinct`);
    for (const color of [...values.chartPalette, values.chartExpense, values.chartIncome]) {
        assert.ok(contrast(color, values.surface) >= 3, `${theme} chart color ${color} must reach 3:1 on surface`);
    }
    for (const background of ['background', 'surface']) {
        assert.ok(contrast(values.controlBorder, values[background]) >= 3, `${theme}.controlBorder on ${background} must reach 3:1`);
    }
}
tokens.spacePx.forEach((value, index) => {
    const names = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20];
    assert.equal(declaration(css, `--space-${names[index]}`), `${value}px`);
});
const mobile = css.match(/@media \(max-width: 580px\) \{([\s\S]+)\}\s*$/);
assert.ok(mobile, 'Missing mobile token overrides');
assert.equal(declaration(mobile[1].match(/:root \{([\s\S]*?)\}/)[1], '--font-size-hero'), tokens.typography.heroMobileLight);
assert.equal(declaration(mobile[1].match(/:root \{([\s\S]*?)\}/)[1], '--font-size-page-heading'), tokens.typography.pageHeadingMobile);
assert.equal(declaration(mobile[1].match(/:root\[data-theme='dark'\] \{([\s\S]*?)\}/)[1], '--font-size-hero'), tokens.typography.heroMobileDark);

console.log('PASS: production CSS matches approved theme, typography, spacing, layout, and pointer-grid tokens.');
