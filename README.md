# PassLimit

A Cloudflare Worker for Bypassing Rate Limits with Customizable Requests

## Overview

**PassLimit** is a Cloudflare Worker designed to bypass rate limits by proxying requests with customizable HTTP methods, headers, and bodies. It extends the functionality of [dewebdes's project](https://github.com/dewebdes) to support various HTTP methods and dynamic request modifications, enabling advanced operations such as fuzzing and automated testing against target URLs.

## Features

- **Multiple HTTP Methods:** Supports GET, POST, PUT, PATCH, DELETE, and more.
- **Custom Headers:** Add or modify request headers dynamically.
- **Custom Body:** Send custom payloads with your requests.
- **Easy Deployment:** Deploy effortlessly using Cloudflare Workers.
- **CORS Support:** Handles cross-origin requests appropriately.

## Usage

Construct your request URL with the following query parameters to customize the proxied request:

- **`dieuri`** (required): The target URL to proxy the request to.
- **`Method`** (optional): The HTTP method to use (e.g., GET, POST). Defaults to GET if not specified.
- **`HEADER1`, `HEADER2`, ...** (optional): Custom headers to include in the proxied request. Format as `Header-Name: Header-Value` and URL-encoded.
- **`Body`** (optional): The request body for methods that support it (e.g., POST). Must be URL-encoded.

### Example

Send a POST request with custom headers and a JSON body:

```bash
https://YOUR-WORKER.workers.dev/?dieuri=https://example.com&Method=POST&HEADER1=Content-Type:+application/json&Body=%7B%22ClientId%22%3A%223ck15a1ov4f0d3o97vs3tbjb52%22%2C%22Username%22%3A%22gmail%40gmail.com%22%7D
```

- **`dieuri`**: `https://example.com`  
  The target URL to proxy the request to.

- **`Method`**: `POST`  
  Specifies the HTTP method.

- **`HEADER1`**: `Content-Type: application/json`  
  Sets the `Content-Type` header.

- **`Body`**: `{"ClientId":"3ck15a1ov4f0d3o97vs3tbjb52","Username":"gmail@gmail.com"}`  
  The JSON payload for the POST request, URL-encoded.

## Deployment

1. **Set Up Cloudflare Workers:**
   - Sign in to your [Cloudflare account](https://dash.cloudflare.com/).
   - Navigate to the **Workers** section.
   - Create a new Worker and paste the PassLimit script.

2. **Deploy the Worker:**
   - Save and deploy your Worker.
   - Note the Worker URL provided by Cloudflare (e.g., `https://your-worker.workers.dev`).

## Example with Fuzzing

Use PassLimit to fuzz endpoints by varying path parameters:

```bash
ffuf -u https://YOUR-WORKER.workers.dev/?dieuri=https://example.com/FUZZ&Method=GET -w wordlist.txt
```

Replace `FUZZ` dynamically to test various endpoints under `https://example.com`.

## Acknowledgments

- Inspired by [dewebdes](https://github.com/dewebdes) for the original Cloudflare Worker script.
- Thanks to [Cloudflare](https://www.cloudflare.com/) for providing the robust Workers platform.
