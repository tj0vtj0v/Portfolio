const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const baseUrl = process.argv.find(arg => arg.startsWith('--url='))?.slice(6) || process.env.APP_URL || 'http://127.0.0.1:4228';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const out = path.resolve(process.argv.includes('--ui-repairs') ? 'docs/design/reference/workspace-repairs' : 'docs/design/reference/repair-review');
const profileRoot = path.resolve('.angular/repair-review');
fs.mkdirSync(profileRoot, {recursive: true});
const debugPort = 9700 + Math.floor(Math.random() * 200);
fs.mkdirSync(out, {recursive: true});
const chrome = spawn(process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--disable-gpu-compositing', '--disable-software-rasterizer',
    '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${path.join(profileRoot, `browser-${process.pid}`)}`, 'about:blank'
], {windowsHide: true, stdio: 'ignore'});
let socket;
let currentRoute = '';
let failReads = false;
let writeStatus = 200;
let emptyReads = false;

(async () => {
    let pages;
    for (let attempt = 0; attempt < 40; attempt++) {
        try { pages = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json(); break; } catch { await delay(250); }
    }
    if (!pages) throw new Error('Chrome did not start');
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));
    let id = 0;
    const pending = new Map();
    const errors = [];
    const call = (method, params = {}) => new Promise((resolve, reject) => {
        const key = ++id;
        pending.set(key, {resolve, reject});
        socket.send(JSON.stringify({id: key, method, params}));
    });
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id) {
            const request = pending.get(message.id);
            pending.delete(message.id);
            message.error ? request.reject(message.error) : request.resolve(message.result);
        }
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
        if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
            errors.push(message.params.args.map(arg => arg.description || arg.value || arg.type).join(' '));
        }
        if (message.method === 'Fetch.requestPaused') {
            const url = message.params.request.url;
            const writing = !['GET','HEAD'].includes(message.params.request.method);
            const responseCode = writing ? writeStatus : failReads && url.includes('/accounting/') ? 503 : 200;
            let body = [];
            if (url.endsWith('/users/me')) body = {username: 'fixture', email: 'fixture@example.test', role: {name: 'User'}};
            else if (url.endsWith('/accounting/accounts')) body = [{id: 1, name: 'Everyday account with a long label', balance: 1200}, {id: 2, name: 'Savings', balance: 800}];
            else if (url.endsWith('/accounting/expenses')) body = [{id: 11, date: '2026-09-08', reason: 'Groceries <safe>', amount: 50, account: {id: 1, name: 'Everyday account with a long label', balance: 1200}, category: {id: 1, name: 'Household and groceries'}}];
            else if (url.endsWith('/accounting/incomes')) body = [{id: 12, date: '2026-09-08', reason: 'Salary', amount: 300, account: {id: 1, name: 'Everyday account with a long label', balance: 1200}}];
            else if (url.endsWith('/accounting/transfers')) body = [{id: 13, date: '2026-09-08', amount: 75, source: {id: 1, name: 'Everyday account with a long label', balance: 1200}, target: {id: 2, name: 'Savings', balance: 800}}];
            else if (url.endsWith('/accounting/categories')) body = [{id: 1, name: 'Household and groceries'}];
            else if (url.includes('/accounting/') && url.includes('/history')) body = [{date: '2026-08-31', balance: 1000}, {date: '2026-09-08', balance: 1200}];
            else if (url.endsWith('/banking/history/me')) body = [{id: 1, date: '2026-09-08', amount: 1234.56, account: {id: 1, name: 'Long everyday banking account reference'}}];
            else if (url.endsWith('/banking/transactions/me')) body = [{id: 1, date: '2026-09-08', amount: -42.5, currencycode: 'EUR', peer: 'Example merchant', reasonforpayment: 'A long but safe payment reference', account: {id: 1, name: 'Long everyday banking account reference'}}];
            else if (url.endsWith('/fuel/types')) body = [{id: 1, name: 'Super unleaded'}];
            else if (url.endsWith('/fuel/cars')) body = [{id: 1, name: 'Vehicle with an unusually long descriptive name', usage_start: '2025-01-01'}];
            else if (url.endsWith('/fuel/refuels')) body = [1, 2, 3].map((item, index) => ({id: item, date: `2026-09-0${index + 1}`, distance: 500 + index * 10, consumption: 35 + index, cost: 65 + index, car: {id: 1, name: 'Vehicle with an unusually long descriptive name'}, fuel_type: {id: 1, name: 'Super unleaded'}}));
            void call('Fetch.fulfillRequest', {requestId: message.params.requestId, responseCode, responseHeaders: [{name: 'Content-Type', value: 'application/json'}], body: Buffer.from(JSON.stringify(responseCode !== 200 ? {detail: 'Fixture unavailable'} : emptyReads && url.includes('/accounting/') && !url.endsWith('/users/me') ? [] : body)).toString('base64')});
        }
    });
    const evaluate = async expression => {
        const result = await call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
        if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    const size = async width => {
        await call('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: false});
        await delay(500);
        const dimensions = await evaluate("({page:document.documentElement.scrollWidth,viewport:innerWidth,nodes:Array.from(document.querySelectorAll('body *')).filter(node=>node.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(node=>({tag:node.tagName,cls:typeof node.className==='string'?node.className:'',left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right,width:node.getBoundingClientRect().width}))})");
        assert.ok(dimensions.page <= dimensions.viewport, `Page overflow on ${currentRoute} at ${width}px: ${JSON.stringify(dimensions)}`);
    };
    const navigate = async route => {
        currentRoute = route;
        const pathname = route.split('?')[0];
        await call('Page.navigate', {url: `${baseUrl}${route}`});
        for (let attempt = 0; attempt < 100; attempt++) {
            if (await evaluate(`location.pathname === ${JSON.stringify(pathname)} && (document.querySelector('h1') || document.querySelector('.preview'))`)) break;
            await delay(50);
        }
        await delay(500);
        assert.ok(await evaluate("!!document.querySelector('main, .preview')"), `Missing content for ${route}: ${errors.join('\n')}; ${await evaluate('document.body.innerText.slice(0, 500)')}`);
        const duplicates = await evaluate("Array.from(document.querySelectorAll('[id]')).map(node=>node.id).filter((value,index,all)=>all.indexOf(value)!==index)");
        assert.deepEqual(duplicates, [], `Duplicate IDs on ${route}`);
    };
    const setTheme = async theme => {
        await evaluate(`if(document.documentElement.dataset.theme !== ${JSON.stringify(theme)}) document.querySelector('.theme-toggle')?.click()`);
        await delay(80);
    };
    const capture = async name => {
        const shot = await call('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
        fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(shot.data, 'base64'));
    };

    await call('Page.enable');
    await call('Runtime.enable');
    await call('Fetch.enable', {patterns: [{urlPattern: `${baseUrl}/api/*`}]});
    await navigate('/login');
    await evaluate("localStorage.setItem('token','fixture'); localStorage.setItem('token-type','Bearer')");

    if (process.argv.includes('--ui-repairs')) {
        await navigate('/accounting');
        assert.equal(await evaluate("document.querySelector('#dashboard-period').value"), '1: year');
        await evaluate("document.querySelector('.view-switch a:last-child').click()");
        await delay(300);
        assert.equal(await evaluate('location.pathname'), '/accounting');
        assert.equal(await evaluate("new URLSearchParams(location.search).get('period')"), 'year');
        for (const theme of ['light', 'dark']) {
            await setTheme(theme);
            for (const width of [360, 1280, 2560]) {
                await size(width);
                const geometry = await evaluate("(()=>{const footer=document.querySelector('app-footer').getBoundingClientRect();const main=document.querySelector('main').getBoundingClientRect();const sidebar=document.querySelector('.project-sidebar').getBoundingClientRect();return {footerLeft:footer.left,footerWidth:footer.width,viewport:document.documentElement.clientWidth,footerTop:footer.top,mainBottom:main.bottom,sidebarLeft:sidebar.left}})()");
                assert.equal(geometry.footerLeft, 0);
                assert.ok(Math.abs(geometry.footerWidth - geometry.viewport) <= 1);
                assert.ok(geometry.footerTop >= geometry.mainBottom - 1, 'Footer overlaps long content');
                if (width > 800) assert.equal(geometry.sidebarLeft, 0, 'Sidebar is inset on wide screens');
                await capture(`accounting-${theme}-${width}`);
            }
        }
        await evaluate("document.querySelector('.account-menu button').click()");
        await delay(500);
        assert.equal(await evaluate('location.pathname'), '/login');
        assert.ok(await evaluate("!!document.querySelector('input[type=password]')"), 'Logout left the page blank');
        for (const width of [360, 1280, 2560]) {
            await size(width);
            const bottom = await evaluate("document.querySelector('app-footer').getBoundingClientRect().bottom + scrollY");
            assert.ok(Math.abs(bottom - await evaluate('Math.max(innerHeight, document.documentElement.scrollHeight)')) <= 2, 'Footer not at page bottom');
            await capture(`logout-${width}`);
        }
        assert.deepEqual(errors, []);
        console.log('PASS: current year, Workspace query navigation, logout renders login, full-width footer at page bottom and wide-screen sidebar.');
        await call('Browser.close');
        return;
    }

    // Active product scope: Accounting and Fuel only.
    {
        for (const route of ['/accounting', '/fuel', '/fuel/refuels', '/fuel/cars', '/accounting/categories']) {
            await navigate(route);
            const selector = ['/accounting', '/fuel'].includes(route) ? 'app-chart-card canvas' : 'ag-grid-angular .ag-row';
            for (let attempt = 0; attempt < 100; attempt++) {
                if (await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)) break;
                await delay(100);
            }
            assert.ok(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), `Missing populated widget: ${route}; errors: ${errors.join(', ')}`);
        }
        const projects = await evaluate("Array.from(document.querySelectorAll('select[aria-label=\"Workspace project\"] option')).map(option => option.textContent.trim())");
        assert.ok(projects.includes('Accounting') && projects.includes('Fuel'));
        assert.ok(!projects.includes('Banking') && !projects.includes('Proximity'));
        for (const route of ['/banking', '/proximity', '/design-preview', '/ui-kit']) {
            await navigate(route);
            assert.ok(await evaluate("document.body.innerText.includes('Page not found')"), `Unavailable route remained active: ${route}`);
        }
        assert.deepEqual(errors, []);
        console.log('PASS: populated charts and AG Grids on five active routes; no runtime exceptions.');
        await call('Browser.close');
        return;
    }

})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { if (socket) socket.close(); chrome.kill(); });
