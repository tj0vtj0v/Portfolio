// Run with the development server at http://127.0.0.1:4232. All API reads are mocked.
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const output = path.resolve('docs/design/reference/loading-review');
fs.mkdirSync(output, {recursive: true});
const port = 9800 + Math.floor(Math.random() * 100);
const chrome = spawn(process.env.CHROME_BIN || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--disable-gpu-compositing', '--disable-software-rasterizer',
    '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.resolve('.angular/loading-review', String(process.pid))}`, 'about:blank'
], {windowsHide: true, stdio: 'ignore'});
let socket;
(async () => {
    let pages;
    for (let i = 0; i < 40; i++) {
        try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await delay(250); }
    }
    assert.ok(pages, 'Chrome did not start');
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));
    let id = 0;
    const pending = new Map();
    const requests = [];
    const errors = [];
    const call = (method, params = {}) => new Promise((resolve, reject) => {
        pending.set(++id, {resolve, reject});
        socket.send(JSON.stringify({id, method, params}));
    });
    let holdAuth = true;
    const respond = (request, body) => call('Fetch.fulfillRequest', {
        requestId: request.requestId, responseCode: 200,
        responseHeaders: [{name: 'Content-Type', value: 'application/json'}],
        body: Buffer.from(JSON.stringify(body)).toString('base64')
    });
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id) {
            const task = pending.get(message.id);
            pending.delete(message.id);
            message.error ? task.reject(message.error) : task.resolve(message.result);
        }
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
        if (message.method === 'Fetch.requestPaused') {
            const request = message.params;
            if (request.request.url.endsWith('/users/me') && !holdAuth) {
                void respond(request, {username: 'fixture', email: 'fixture@example.test', role: {name: 'User'}});
            } else requests.push(request);
        }
    });
    const evaluate = async expression => {
        const result = await call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
        assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    const until = async expression => {
        for (let i = 0; i < 160; i++) { if (await evaluate(expression)) return; await delay(100); }
        throw new Error(`Timed out: ${expression}`);
    };
    const capture = async name => {
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow: ${name}`);
        const shot = await call('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
        fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(shot.data, 'base64'));
    };
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Fetch.enable', {patterns: [{urlPattern: '*://127.0.0.1:4232/api/*'}]});
    await call('Page.navigate', {url: 'http://127.0.0.1:4232/home'});
    await until("!!document.querySelector('app-header')");
    await evaluate("localStorage.setItem('token','fixture'); localStorage.setItem('token-type','Bearer'); document.querySelector('a[href=\"/accounting\"]').click()");
    await until("!!document.querySelector('main app-ui-skeleton')");
    assert.equal(await evaluate("!!document.querySelector('app-dashboard')"), false, 'No dashboard before authorization');
    assert.equal(await evaluate("!!document.querySelector('app-header')"), true, 'Existing header remains');
    holdAuth = false;
    for (const request of requests.splice(0)) await respond(request, {username: 'fixture', role: {name: 'User'}});
    await until("!!document.querySelector('app-dashboard app-ui-skeleton')");
    for (const theme of ['light', 'dark']) for (const width of [1280, 360]) {
        await evaluate(`document.documentElement.dataset.theme = '${theme}'`);
        await call('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: false});
        await capture(`accounting-${theme}-${width}`);
    }
    for (const request of requests.splice(0)) await respond(request, []);
    await until("!!document.querySelector('app-dashboard') && !document.querySelector('app-dashboard app-ui-skeleton')");
    await evaluate("document.querySelector('a[href=\"/accounting/expenses\"]').click()");
    await until("!!document.querySelector('app-expense app-ui-skeleton')");
    await capture('expenses-dark-360');
    assert.deepEqual(errors, []);
    console.log('Passed: guard placeholder, data handoff, responsive light/dark dashboard and list; no runtime errors.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { socket?.close(); chrome.kill(); });
