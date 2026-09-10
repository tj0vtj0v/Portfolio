const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const baseUrl = process.env.APP_URL || 'http://127.0.0.1:4230';
const out = path.resolve('docs/design/reference/portfolio-pages');
const profile = path.resolve('.angular/portfolio-browser', String(process.pid));
const port = 9900 + Math.floor(Math.random() * 100);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
fs.mkdirSync(out, {recursive: true});
fs.mkdirSync(profile, {recursive: true});
const chrome = spawn(process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--disable-gpu-compositing', '--disable-software-rasterizer',
    '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, 'about:blank'
], {windowsHide: true, stdio: 'ignore'});
let socket;
(async () => {
    let pages;
    for (let i = 0; i < 40; i++) {
        try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await delay(250); }
    }
    assert.ok(pages, 'Chrome must start');
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));
    let id = 0;
    const pending = new Map();
    const errors = [];
    const apiCalls = [];
    const call = (method, params = {}) => new Promise((resolve, reject) => {
        const requestId = ++id;
        const timeout = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)); }, 15000);
        pending.set(requestId, {resolve, reject, timeout});
        socket.send(JSON.stringify({id: requestId, method, params}));
    });
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id) {
            const entry = pending.get(message.id);
            if (!entry) return;
            clearTimeout(entry.timeout);
            pending.delete(message.id);
            message.error ? entry.reject(message.error) : entry.resolve(message.result);
        }
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
        if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.description || arg.value).join(' '));
        if (message.method === 'Network.requestWillBeSent' && message.params.request.url.includes('/api/')) apiCalls.push(message.params.request.url);
    });
    const evaluate = async expression => {
        const result = await call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
        if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    const waitFor = async expression => {
        for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await delay(100); }
        throw new Error(`Not ready: ${expression}`);
    };
    const navigate = async route => {
        await call('Page.navigate', {url: baseUrl + route});
        await waitFor(`document.querySelector('app-${route.split(/[?#]/)[0].slice(1)}') && !document.querySelector('main app-ui-skeleton')`);
        await evaluate("Promise.all(Array.from(document.images).map(img => {img.loading='eager';return img.decode().catch(()=>{})}))");
        await delay(150);
    };
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    await call('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
    for (const route of ['/home', '/about', '/projects', '/contact']) {
        await navigate(route);
        for (const theme of ['light', 'dark']) {
            await evaluate(`if(document.documentElement.dataset.theme !== '${theme}') document.querySelector('.theme-toggle').click()`);
            for (const width of [360, 768, 1280]) {
                await call('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: false});
                await delay(150);
                const geometry = await evaluate(`({width: innerWidth, content: document.documentElement.scrollWidth, headings: document.querySelectorAll('h1').length, broken: [...document.images].filter(i=>!i.complete || i.naturalWidth===0).map(i=>i.src), active: document.querySelector('.portfolio-nav a.active')?.getAttribute('href')})`);
                assert.ok(geometry.content <= width + 1, `${route} ${theme} ${width}: overflow ${geometry.content}`);
                assert.equal(geometry.headings, 1);
                assert.deepEqual(geometry.broken, []);
                assert.equal(geometry.active, route);
                if (width !== 768) {
                    const metrics = await call('Page.getLayoutMetrics');
                    const shot = await call('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true, clip: {x: 0, y: 0, width, height: metrics.cssContentSize.height, scale: 1}});
                    fs.writeFileSync(path.join(out, `${route.slice(1)}-${theme}-${width}.png`), Buffer.from(shot.data, 'base64'));
                }
            }
        }
        console.log(`PASS ${route}: both themes at 360, 768, 1280px; images, navigation, overflow`);
    }
    assert.deepEqual(apiCalls, [], 'Public pages must not load private API records');
    await navigate('/home');
    await evaluate("document.querySelector('[aria-label=\"Next project\"]').click()");
    await waitFor("document.querySelector('.selection').textContent.includes('Graph SLAM')");
    await evaluate("document.querySelector('.gallery-item.selected a').click()");
    await waitFor("location.hash === '#mapping' && document.querySelector('#mapping')");
    await delay(300);
    assert.ok(await evaluate("Math.abs(document.querySelector('#mapping').getBoundingClientRect().top) < 100"), 'Gallery link scrolls to the selected section');
    await evaluate("document.querySelector('.view-switch a:last-child').click()");
    await waitFor("location.pathname === '/login'");
    assert.equal(await evaluate("new URLSearchParams(location.search).get('returnUrl')"), '/accounting');
    await evaluate("document.querySelector('.view-switch a:first-child').click()");
    await waitFor("location.pathname === '/projects' && location.hash === '#mapping'");
    await navigate('/about');
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.skills-track')).animationName"), 'none');
    await call('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'no-preference'}]});
    await evaluate("document.querySelector('.motion-control').click()");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.skills-track')).animationPlayState"), 'paused');
    assert.deepEqual(errors, []);
    console.log('PASS gallery, anchors, anonymous Workspace guard, remembered Portfolio target, reduced motion, pause, no runtime errors');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { socket?.close(); chrome.kill(); });
