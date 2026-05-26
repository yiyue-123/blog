(function () {
  const GATEWAY_CONTENTS_MARKER = "/github/contents/";
  const POST_INDEX_PATTERN = /^content\/posts\/[^/]+\/index\.md$/;
  const PDF_IMPORT_MEDIA_ROOT = "static/images/pdf-imports";
  const DEFAULT_BRANCH = "main";
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function mediaCleanupFetch(input, init) {
    const requestInfo = await readRequestInfo(input, init);
    const target = getPostIndexTarget(requestInfo.url, requestInfo.method);

    if (!target) {
      return originalFetch(input, init);
    }

    const body = safeJsonParse(requestInfo.bodyText);
    const branch = body?.branch || DEFAULT_BRANCH;
    const authHeader = requestInfo.headers.get("authorization");
    const oldContent = authHeader
      ? await readGatewayTextFile(target.apiRoot, target.encodedPath, branch, authHeader).catch(() => null)
      : null;

    const response = await originalFetch(input, init);

    if (!response.ok || !authHeader || !oldContent) {
      return response;
    }

    const cleanup = requestInfo.method === "DELETE"
      ? cleanupDeletedPost({ target, branch, authHeader, oldContent })
      : cleanupUpdatedPost({ target, branch, authHeader, oldContent, newBase64Content: body?.content });

    cleanup.catch((error) => {
      console.warn("Failed to cleanup unused media files.", error);
    });

    return response;
  };

  async function readRequestInfo(input, init = {}) {
    const request = input instanceof Request ? input : null;
    const headers = new Headers(request?.headers || {});
    new Headers(init?.headers || {}).forEach((value, key) => headers.set(key, value));

    return {
      url: request?.url || String(input),
      method: (init?.method || request?.method || "GET").toUpperCase(),
      headers,
      bodyText: await readBodyText(input, init),
    };
  }

  async function readBodyText(input, init = {}) {
    if (typeof init?.body === "string") {
      return init.body;
    }

    if (init?.body instanceof URLSearchParams) {
      return init.body.toString();
    }

    if (input instanceof Request) {
      return input.clone().text().catch(() => "");
    }

    return "";
  }

  function getPostIndexTarget(url, method) {
    if (method !== "PUT" && method !== "DELETE") {
      return null;
    }

    const markerIndex = url.indexOf(GATEWAY_CONTENTS_MARKER);
    if (markerIndex < 0) {
      return null;
    }

    const apiRoot = url.slice(0, markerIndex + "/github".length);
    const encodedPathWithQuery = url.slice(markerIndex + GATEWAY_CONTENTS_MARKER.length);
    const encodedPath = encodedPathWithQuery.split("?")[0];
    const path = decodeURIComponent(encodedPath);

    if (!POST_INDEX_PATTERN.test(path)) {
      return null;
    }

    return {
      apiRoot,
      encodedPath,
      path,
      postFolder: path.split("/")[2],
    };
  }

  async function cleanupUpdatedPost({ target, branch, authHeader, oldContent, newBase64Content }) {
    if (!newBase64Content) {
      return;
    }

    const newContent = decodeBase64Text(newBase64Content);
    const oldRefs = extractStaticMediaPaths(oldContent);
    const newRefs = extractStaticMediaPaths(newContent);
    const staleRefs = [...oldRefs].filter((path) => !newRefs.has(path));

    await deleteGatewayFiles(target.apiRoot, branch, authHeader, staleRefs);
  }

  async function cleanupDeletedPost({ target, branch, authHeader, oldContent }) {
    const paths = new Set(extractStaticMediaPaths(oldContent));
    const importDir = `${PDF_IMPORT_MEDIA_ROOT}/${target.postFolder}`;
    const dirFiles = await listGatewayFiles(target.apiRoot, importDir, branch, authHeader).catch(() => []);

    dirFiles.forEach((path) => paths.add(path));
    await deleteGatewayFiles(target.apiRoot, branch, authHeader, [...paths]);
  }

  function extractStaticMediaPaths(markdown) {
    const paths = new Set();
    const markdownImagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    const htmlImagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g;

    collectMediaPaths(markdown, markdownImagePattern, paths);
    collectMediaPaths(markdown, htmlImagePattern, paths);
    return paths;
  }

  function collectMediaPaths(content, pattern, paths) {
    for (const match of content.matchAll(pattern)) {
      const normalized = normalizeStaticMediaPath(match[1]);
      if (normalized) {
        paths.add(normalized);
      }
    }
  }

  function normalizeStaticMediaPath(value) {
    const cleanValue = decodeURI(String(value).split(/[?#]/)[0]).replace(/\\/g, "/");

    if (cleanValue.startsWith("/images/pdf-imports/")) {
      return `static${cleanValue}`;
    }

    if (cleanValue.startsWith("images/pdf-imports/")) {
      return `static/${cleanValue}`;
    }

    if (cleanValue.startsWith("static/images/pdf-imports/")) {
      return cleanValue;
    }

    return null;
  }

  async function readGatewayTextFile(apiRoot, encodedPath, branch, authHeader) {
    const file = await gatewayFetch(`${apiRoot}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`, authHeader);
    return decodeBase64Text(file.content || "");
  }

  async function listGatewayFiles(apiRoot, path, branch, authHeader) {
    const encodedPath = encodeRepoPath(path);
    const items = await gatewayFetch(`${apiRoot}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`, authHeader);

    if (!Array.isArray(items)) {
      return [];
    }

    const files = [];
    for (const item of items) {
      if (item.type === "file" && item.path) {
        files.push(item.path);
      } else if (item.type === "dir" && item.path) {
        files.push(...await listGatewayFiles(apiRoot, item.path, branch, authHeader));
      }
    }

    return files;
  }

  async function deleteGatewayFiles(apiRoot, branch, authHeader, paths) {
    for (const path of paths) {
      const encodedPath = encodeRepoPath(path);
      const file = await gatewayFetch(`${apiRoot}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`, authHeader)
        .catch((error) => error.status === 404 ? null : Promise.reject(error));

      if (!file?.sha) {
        continue;
      }

      await gatewayFetch(`${apiRoot}/contents/${encodedPath}`, authHeader, {
        method: "DELETE",
        body: JSON.stringify({
          branch,
          sha: file.sha,
          message: `Delete unused media "${path}"`,
        }),
      });
    }
  }

  async function gatewayFetch(url, authHeader, options = {}) {
    const response = await originalFetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const data = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const error = new Error(data?.message || text || `Git Gateway request failed: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data;
  }

  function encodeRepoPath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function decodeBase64Text(value) {
    const binary = atob(String(value).replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
})();
