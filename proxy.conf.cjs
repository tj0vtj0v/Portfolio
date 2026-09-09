module.exports = {
    '/api': {
        target: 'http://localhost:8000',
        secure: false,
        changeOrigin: true,
        pathRewrite: {'^/api': ''},
        configure(proxy) {
            const emit = proxy.emit;
            // Vite adds its own error listener after configure; handle expected outages
            // before dispatch so they do not also produce Vite's generic stack trace.
            proxy.emit = function (event, ...args) {
                const [error, request, response] = args;
                const refused = error?.code === 'ECONNREFUSED' ||
                    (error?.errors?.length > 0 && error.errors.every(item => item.code === 'ECONNREFUSED'));
                if (event !== 'error' || !refused || !response?.writeHead || response.headersSent || response.writableEnded) {
                    return emit.call(this, event, ...args);
                }
                console.warn(`[api] Backend offline at http://localhost:8000; ${request.method} ${request.url} returned 503.`);
                response.writeHead(503, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({detail: 'The backend is unavailable. Please try again shortly.'}));
                return true;
            };
        }
    }
};
