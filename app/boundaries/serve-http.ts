import * as http from 'http';

async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => resolve(body));
    req.on('error', error => reject(error));
  })
}

// Start listening for http requests
export function start() {
  const server = http.createServer(requestRouter);
  server.listen(process.env.PORT, () => console.log('...'));
}

// Send a request to its corresponding handler function
function requestRouter(req, res) {
  logRequest(req);
  if (req.url == '/') {
    return handleRootRequest(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
}

function logRequest(req) {
  console.log(req.method, req.url);
}

async function handleRootRequest(req, res) {
  try {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));

  } catch (e) { // Failure
    res.writeHead(500);
    res.end();
  }
}
