const state = {
  file: null,
  images: [],
  markdown: "",
  postDir: "",
};

const els = {
  file: document.querySelector("#pdf-file"),
  title: document.querySelector("#post-title"),
  slug: document.querySelector("#post-slug"),
  date: document.querySelector("#post-date"),
  categories: document.querySelector("#post-categories"),
  tags: document.querySelector("#post-tags"),
  description: document.querySelector("#post-description"),
  draft: document.querySelector("#post-draft"),
  skipSmallImages: document.querySelector("#skip-small-images"),
  parse: document.querySelector("#parse-pdf"),
  save: document.querySelector("#save-project"),
  download: document.querySelector("#download-zip"),
  status: document.querySelector("#status"),
  preview: document.querySelector("#markdown-preview"),
  outputPath: document.querySelector("#output-path"),
  mediaCount: document.querySelector("#media-count"),
  mediaGrid: document.querySelector("#media-grid"),
};

const PDFJS_VERSION = "4.10.38";
let pdfjsPromise;

init();

function init() {
  els.date.value = toDatetimeLocal(new Date());
  updateOutputPath();

  els.file.addEventListener("change", handleFileChange);
  els.title.addEventListener("input", () => {
    if (!els.slug.dataset.touched) {
      els.slug.value = slugify(els.title.value);
    }
    rebuildMarkdownFromCurrentState();
  });
  els.slug.addEventListener("input", () => {
    els.slug.dataset.touched = "true";
    updateOutputPath();
    rebuildMarkdownFromCurrentState();
  });

  [
    els.date,
    els.categories,
    els.tags,
    els.description,
    els.draft,
  ].forEach((el) => el.addEventListener("input", rebuildMarkdownFromCurrentState));

  els.parse.addEventListener("click", parseSelectedPdf);
  els.save.addEventListener("click", saveToLocalProject);
  els.download.addEventListener("click", downloadZip);
}

function handleFileChange(event) {
  const [file] = event.target.files;
  state.file = file || null;
  clearGeneratedContent();

  if (!file) {
    setStatus("请选择一个 PDF 文件。");
    return;
  }

  const title = stripExtension(file.name).trim();
  els.title.value = title;
  els.slug.value = slugify(title);
  els.slug.dataset.touched = "";
  updateOutputPath();
  setStatus(`已选择 ${file.name}。`);
}

async function parseSelectedPdf() {
  if (!state.file) {
    setStatus("请先选择 PDF 文件。", true);
    return;
  }

  try {
    setBusy(true);
    setStatus("正在载入 PDF 解析器。");

    const pdfjsLib = await loadPdfJs();
    const buffer = await state.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const metadata = await pdf.getMetadata().catch(() => null);
    const pdfTitle = metadata?.info?.Title?.trim();

    if (pdfTitle && !els.title.value.trim()) {
      els.title.value = pdfTitle;
      els.slug.value = slugify(pdfTitle);
    }

    const pages = [];
    const images = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setStatus(`正在解析第 ${pageNumber}/${pdf.numPages} 页。`);
      const page = await pdf.getPage(pageNumber);
      const text = await extractPageText(page);
      const pageImages = await extractPageImages(page, pageNumber, pdfjsLib);
      images.push(...pageImages);
      pages.push({ pageNumber, text, images: pageImages });
    }

    state.images = images;
    state.markdown = buildMarkdown(pages);
    els.preview.value = state.markdown;
    renderMediaGrid();
    updateOutputPath();
    els.save.disabled = false;
    els.download.disabled = false;
    setStatus(`解析完成：${pdf.numPages} 页，${images.length} 张图片。`);
  } catch (error) {
    console.error(error);
    setStatus(error.message || "PDF 解析失败。", true);
  } finally {
    setBusy(false);
  }
}

async function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs`)
      .then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;
        return pdfjsLib;
      });
  }

  return pdfjsPromise;
}

async function extractPageText(page) {
  const textContent = await page.getTextContent();
  const items = textContent.items
    .filter((item) => item.str && item.str.trim())
    .map((item) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
    }))
    .sort((a, b) => Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x);

  const lines = [];

  for (const item of items) {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 3);
    if (line) {
      line.items.push(item);
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  }

  return lines
    .map((line) => line.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(""))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

async function extractPageImages(page, pageNumber, pdfjsLib) {
  const operatorList = await page.getOperatorList();
  const images = [];
  const seen = new Set();
  const imageOps = new Set([
    pdfjsLib.OPS.paintImageXObject,
    pdfjsLib.OPS.paintJpegXObject,
    pdfjsLib.OPS.paintInlineImageXObject,
  ]);

  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
    if (!imageOps.has(operatorList.fnArray[index])) {
      continue;
    }

    const args = operatorList.argsArray[index] || [];
    const imageData = operatorList.fnArray[index] === pdfjsLib.OPS.paintInlineImageXObject
      ? args[0]
      : await getPdfObject(page, args[0]);

    if (!imageData) {
      continue;
    }

    const key = `${pageNumber}-${args[0] || index}-${imageData.width}x${imageData.height}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const image = await pdfImageToPng(imageData);
    if (!image) {
      continue;
    }

    if (els.skipSmallImages.checked && (image.width < 32 || image.height < 32)) {
      continue;
    }

    const pageIndex = String(pageNumber).padStart(3, "0");
    const imageIndex = String(images.length + 1).padStart(2, "0");
    images.push({
      ...image,
      pageNumber,
      name: `pdf-media/page-${pageIndex}-image-${imageIndex}.png`,
    });
  }

  return images;
}

function getPdfObject(page, name) {
  if (!name) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const value = page.objs.get(name);
      if (value) {
        resolve(value);
        return;
      }
    } catch {
      // PDF.js throws before an object is ready; the callback form waits for it.
    }

    try {
      page.objs.get(name, resolve);
    } catch {
      try {
        resolve(page.commonObjs.get(name));
      } catch {
        resolve(null);
      }
    }
  });
}

async function pdfImageToPng(imageData) {
  const canvas = document.createElement("canvas");
  const width = imageData.width || imageData.bitmap?.width || imageData.naturalWidth;
  const height = imageData.height || imageData.bitmap?.height || imageData.naturalHeight;

  if (!width || !height) {
    return null;
  }

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (imageData.bitmap) {
    context.drawImage(imageData.bitmap, 0, 0);
  } else if (imageData instanceof HTMLImageElement || imageData instanceof ImageBitmap) {
    context.drawImage(imageData, 0, 0);
  } else if (imageData.data) {
    context.putImageData(toCanvasImageData(context, imageData, width, height), 0, 0);
  } else {
    return null;
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    return null;
  }

  return {
    blob,
    width,
    height,
    previewUrl: URL.createObjectURL(blob),
  };
}

function toCanvasImageData(context, imageData, width, height) {
  const source = imageData.data;
  const target = context.createImageData(width, height);
  const pixelCount = width * height;

  if (source.length === pixelCount * 4) {
    target.data.set(source);
    return target;
  }

  if (source.length === pixelCount * 3) {
    for (let index = 0; index < pixelCount; index += 1) {
      target.data[index * 4] = source[index * 3];
      target.data[index * 4 + 1] = source[index * 3 + 1];
      target.data[index * 4 + 2] = source[index * 3 + 2];
      target.data[index * 4 + 3] = 255;
    }
    return target;
  }

  if (source.length === pixelCount) {
    for (let index = 0; index < pixelCount; index += 1) {
      target.data[index * 4] = source[index];
      target.data[index * 4 + 1] = source[index];
      target.data[index * 4 + 2] = source[index];
      target.data[index * 4 + 3] = 255;
    }
    return target;
  }

  for (let index = 0; index < pixelCount; index += 1) {
    const byte = source[Math.floor(index / 8)] || 0;
    const bit = byte & (128 >> (index % 8));
    const value = bit ? 0 : 255;
    target.data[index * 4] = value;
    target.data[index * 4 + 1] = value;
    target.data[index * 4 + 2] = value;
    target.data[index * 4 + 3] = 255;
  }

  return target;
}

function buildMarkdown(pages) {
  const chunks = [buildFrontMatter()];

  for (const page of pages) {
    if (page.text) {
      chunks.push(page.text);
    }

    for (const image of page.images) {
      chunks.push(`![PDF 第 ${page.pageNumber} 页图片](${image.name})`);
    }
  }

  return `${chunks.filter(Boolean).join("\n\n")}\n`;
}

function buildFrontMatter() {
  const categories = parseList(els.categories.value);
  const tags = parseList(els.tags.value);
  const description = els.description.value.trim();
  const lines = [
    "---",
    `title: ${yamlString(els.title.value.trim() || stripExtension(state.file?.name || "PDF 导入文章"))}`,
    `date: ${toOffsetIso(els.date.value)}`,
    `draft: ${els.draft.checked}`,
  ];

  if (categories.length) {
    lines.push("categories:");
    categories.forEach((item) => lines.push(`  - ${yamlString(item)}`));
  } else {
    lines.push("categories: []");
  }

  if (tags.length) {
    lines.push("tags:");
    tags.forEach((item) => lines.push(`  - ${yamlString(item)}`));
  } else {
    lines.push("tags: []");
  }

  if (description) {
    lines.push(`description: ${yamlString(description)}`);
  }

  if (state.file?.name) {
    lines.push(`source_pdf: ${yamlString(state.file.name)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function rebuildMarkdownFromCurrentState() {
  if (!state.markdown) {
    updateOutputPath();
    return;
  }

  const body = state.markdown.replace(/^---[\s\S]*?---\n*/, "");
  state.markdown = `${buildFrontMatter()}\n\n${body}`;
  els.preview.value = state.markdown;
  updateOutputPath();
}

async function saveToLocalProject() {
  if (!state.markdown) {
    return;
  }

  if (!("showDirectoryPicker" in window)) {
    setStatus("当前浏览器不支持直接保存到本地项目，请使用下载内容包。", true);
    return;
  }

  try {
    setBusy(true);
    const root = await window.showDirectoryPicker({ id: "hugo-blog-root", mode: "readwrite" });
    await assertProjectRoot(root);

    const content = await root.getDirectoryHandle("content", { create: true });
    const posts = await content.getDirectoryHandle("posts", { create: true });
    const post = await posts.getDirectoryHandle(getPostFolderName(), { create: true });
    await writeFile(post, "index.md", new Blob([state.markdown], { type: "text/markdown;charset=utf-8" }));

    if (state.images.length) {
      const media = await post.getDirectoryHandle("pdf-media", { create: true });
      for (const image of state.images) {
        await writeFile(media, image.name.replace("pdf-media/", ""), image.blob);
      }
    }

    setStatus(`已保存到 ${state.postDir}。`);
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
      setStatus(error.message || "保存失败。", true);
    }
  } finally {
    setBusy(false);
  }
}

async function assertProjectRoot(directory) {
  try {
    await directory.getFileHandle("hugo.toml");
  } catch {
    throw new Error("请选择包含 hugo.toml 的博客项目根目录。");
  }
}

async function writeFile(directory, name, blob) {
  const file = await directory.getFileHandle(name, { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function downloadZip() {
  if (!state.markdown || !window.JSZip) {
    return;
  }

  try {
    setBusy(true);
    const zip = new window.JSZip();
    zip.file(`${state.postDir}/index.md`, state.markdown);
    for (const image of state.images) {
      zip.file(`${state.postDir}/${image.name}`, image.blob);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${getPostFolderName()}.zip`);
    setStatus("内容包已生成。");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "内容包生成失败。", true);
  } finally {
    setBusy(false);
  }
}

function renderMediaGrid() {
  els.mediaGrid.replaceChildren();
  els.mediaCount.textContent = `${state.images.length} 张图片`;

  for (const image of state.images) {
    const figure = document.createElement("figure");
    figure.className = "media-item";

    const img = document.createElement("img");
    img.src = image.previewUrl;
    img.alt = image.name;

    const caption = document.createElement("figcaption");
    caption.textContent = `${image.name} · ${image.width}x${image.height}`;

    figure.append(img, caption);
    els.mediaGrid.append(figure);
  }
}

function clearGeneratedContent() {
  state.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  state.images = [];
  state.markdown = "";
  els.preview.value = "";
  els.save.disabled = true;
  els.download.disabled = true;
  renderMediaGrid();
}

function updateOutputPath() {
  state.postDir = `content/posts/${getPostFolderName()}`;
  els.outputPath.textContent = `${state.postDir}/index.md`;
}

function getPostFolderName() {
  const date = (els.date.value || toDatetimeLocal(new Date())).slice(0, 10);
  const slug = slugify(els.slug.value || els.title.value || state.file?.name || "pdf-import");
  return `${date}-${slug || "pdf-import"}`;
}

function setBusy(isBusy) {
  els.parse.disabled = isBusy;
  els.save.disabled = isBusy || !state.markdown;
  els.download.disabled = isBusy || !state.markdown;
}

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("error", isError);
}

function parseList(value) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return stripExtension(value)
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>|#%{}^~[\]`;@=&]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function stripExtension(value) {
  return (value || "").replace(/\.[^.]+$/, "");
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function toDatetimeLocal(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toOffsetIso(value) {
  const date = value ? new Date(value) : new Date();
  const pad = (number) => String(Math.trunc(Math.abs(number))).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = pad(offset / 60);
  const minutes = pad(offset % 60);

  return `${toDatetimeLocal(date)}:00${sign}${hours}:${minutes}`;
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
