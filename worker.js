export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request);
    } catch (err) {
      return makeRes('Cloudflare Worker Error:\n' + err.stack, 502);
    }
  }
}

/**
 * Handles incoming requests and proxies them based on query parameters.
 *
 * @param {Request} request - The incoming request.
 * @returns {Promise<Response>} - The response from the proxied request.
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  // Extract and validate the target URL
  const dieuri = params['dieuri'];
  if (!dieuri) {
    return makeRes('Missing "dieuri" parameter.', 400);
  }

  let targetUrl;
  try {
    targetUrl = new URL(decodeURIComponent(dieuri));
  } catch (e) {
    return makeRes('Invalid "dieuri" URL.', 400);
  }

  // Determine the HTTP method
  const method = params['Method'] ? params['Method'].toUpperCase() : 'GET';
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  if (!allowedMethods.includes(method)) {
    return makeRes(`Unsupported HTTP method: ${method}`, 400);
  }

  // Construct headers from HEADER1, HEADER2, etc.
  const headers = new Headers();
  Object.keys(params)
    .filter(key => key.startsWith('HEADER'))
    .sort() // Ensure order (HEADER1, HEADER2, ...)
    .forEach(key => {
      const headerValue = decodeURIComponent(params[key]);
      const separatorIndex = headerValue.indexOf(':');
      if (separatorIndex !== -1) {
        const headerKey = headerValue.slice(0, separatorIndex).trim();
        const headerVal = headerValue.slice(separatorIndex + 1).trim();
        if (headerKey && headerVal) {
          // Note: Some headers like 'Host' are controlled by Cloudflare and cannot be overridden.
          headers.set(headerKey, headerVal);
        }
      }
    });

  // Handle the request body for applicable methods
  let body = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (params['Body']) {
      try {
        body = decodeURIComponent(params['Body']);
      } catch (e) {
        return makeRes('Invalid "Body" parameter encoding.', 400);
      }
    } else {
      // Attempt to clone and read the original request body
      try {
        body = await request.clone().text();
      } catch (e) {
        return makeRes('Failed to read the request body.', 400);
      }
    }
  }

  // Prepare fetch options
  const fetchOptions = {
    method,
    headers,
    body,
    redirect: 'follow', // You can change this based on your requirements
  };

  try {
    const response = await fetch(targetUrl.href, fetchOptions);

    // Clone response headers
    const responseHeaders = new Headers(response.headers);

    // Handle CORS by setting appropriate headers
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set('access-control-expose-headers', '*');
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('content-security-policy-report-only');
    responseHeaders.delete('clear-site-data');

    // Modify response status if it's a redirect
    let status = response.status;
    if ([301, 302, 303, 307, 308].includes(status)) {
      status += 10; // Example modification: 301 -> 311
    }

    // Create a new response to return
    const modifiedResponse = new Response(response.body, {
      status,
      headers: responseHeaders,
    });

    return modifiedResponse;
  } catch (err) {
    return makeRes('Error fetching the target URL:\n' + err.message, 502);
  }
}

/**
 * Creates a standardized Response object.
 *
 * @param {string | BodyInit} body - The response body.
 * @param {number} status - The HTTP status code.
 * @param {Object<string, string>} headers - Additional headers.
 * @returns {Response} - The constructed Response object.
 */
function makeRes(body, status = 200, headers = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('access-control-allow-origin', '*');
  return new Response(body, { status, headers: responseHeaders });
}
