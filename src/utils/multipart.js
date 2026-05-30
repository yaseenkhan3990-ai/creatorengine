const path = require("path");

function parseContentDisposition(header = "") {
  return header.split(";").reduce((data, part) => {
    const [key, rawValue] = part.trim().split("=");
    if (!rawValue) return data;
    data[key] = rawValue.replace(/^"|"$/g, "");
    return data;
  }, {});
}

function parseContentType(header = "") {
  const [, value] = header.split(":");
  return value ? value.trim() : "application/octet-stream";
}

function parseMultipartUpload(req) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    throw new Error("The upload form did not include a valid video payload.");
  }

  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const body = Buffer.isBuffer(req.body) ? req.body.toString("binary") : "";
  const parts = body.split(boundary).filter((part) => part.includes("Content-Disposition"));
  const fields = {};
  let file = null;

  parts.forEach((part) => {
    const splitAt = part.indexOf("\r\n\r\n");
    if (splitAt === -1) return;

    const rawHeaders = part.slice(0, splitAt);
    const content = part.slice(splitAt + 4).replace(/\r\n--$/, "").replace(/\r\n$/, "");
    const contentBuffer = Buffer.from(content, "binary");
    const contentTypeLine = rawHeaders
      .split("\r\n")
      .find((line) => line.toLowerCase().startsWith("content-type"));
    const dispositionLine = rawHeaders
      .split("\r\n")
      .find((line) => line.toLowerCase().startsWith("content-disposition"));

    const disposition = parseContentDisposition(dispositionLine);
    if (!disposition.name) return;

    if (disposition.filename) {
      file = {
        fieldName: disposition.name,
        originalName: path.basename(disposition.filename),
        size: contentBuffer.length,
        extension: path.extname(disposition.filename).replace(".", "").toLowerCase(),
        mimeType: parseContentType(contentTypeLine),
        buffer: contentBuffer
      };
      return;
    }

    if (fields[disposition.name]) {
      fields[disposition.name] = Array.isArray(fields[disposition.name])
        ? [...fields[disposition.name], content.trim()]
        : [fields[disposition.name], content.trim()];
      return;
    }

    fields[disposition.name] = content.trim();
  });

  if (!file || !file.originalName) {
    throw new Error("Please select a video, short, or reel before asking for AI strategy.");
  }

  return { fields, file };
}

module.exports = { parseMultipartUpload };
