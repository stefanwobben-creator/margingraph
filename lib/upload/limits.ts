/**
 * What we accept, and why the numbers are what they are.
 *
 * The ceiling is not a policy, it is the platform: a Vercel function refuses a
 * request body over 4.5 MB before any of our code runs, and a limit enforced by
 * someone else's error page is a limit the sender experiences as the site being
 * broken. So we check first, in the browser and again on the server, and say
 * what to do instead.
 *
 * These are deliberately generous for what this actually is. A profit and loss
 * account is tens of kilobytes. A scanned set of annual accounts is the only
 * thing that gets near the ceiling, and a scan is the one file our reader
 * cannot read anyway.
 */
export const MAX_FILES = 5;
export const MAX_BYTES_PER_FILE = 3_500_000;
export const MAX_BYTES_TOTAL = 4_000_000;

/** Extension to what it is, in the sender's words. Used in the error too. */
export const ACCEPTED: Record<string, string> = {
  ".xlsx": "Excel",
  ".xls": "Excel",
  ".xlsm": "Excel",
  ".csv": "CSV",
  ".tsv": "CSV",
  ".pdf": "PDF",
};

/**
 * Extensions and MIME types both.
 *
 * Android's file picker filters on MIME type and greys out everything when it
 * is given extensions alone, at which point the sender concludes they have no
 * valid file and leaves.
 */
export const ACCEPT_ATTRIBUTE = [
  ...Object.keys(ACCEPTED),
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/tab-separated-values",
  "application/pdf",
].join(",");

export type Candidate = {
  name: string;
  /** Bytes. */
  size: number;
};

export const megabytes = (bytes: number) =>
  `${(bytes / 1_000_000).toFixed(bytes < 1_000_000 ? 2 : 1)} MB`;

/**
 * The offending size rounded up, the limit rounded down.
 *
 * Both rounded the same way produced `"annual accounts.pdf" is 3.5 MB, and we
 * can accept 3.5 MB per file`, for every file between 3,500,001 and 3,549,999
 * bytes. A rejection that contradicts itself does not read as a big file, it
 * reads as a broken website, and nobody debugs a form on your behalf.
 */
const tooBig = (bytes: number) => `${(Math.ceil(bytes / 100_000) / 10).toFixed(1)} MB`;
const atMost = (bytes: number) => `${(Math.floor(bytes / 100_000) / 10).toFixed(1)} MB`;

export function extensionOf(name: string): string {
  const at = name.lastIndexOf(".");
  return at < 0 ? "" : name.slice(at).toLowerCase();
}

/**
 * Everything wrong with this submission, in the order it can be fixed.
 *
 * Returns every problem rather than the first one. A form that reveals its
 * objections one at a time is a form people abandon on the third attempt, and
 * we only get one attempt from most people.
 */
export function validate(input: {
  email: string;
  files: Candidate[];
}): string[] {
  const problems: string[] = [];
  const { email, files } = input;

  // Deliberately loose. The only thing worth checking here is whether a reply
  // could plausibly arrive, and every stricter rule ever written has rejected
  // somebody's real address.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
    problems.push("We need an email address to send the findings back to.");
  }

  if (files.length === 0) {
    problems.push("No file was attached.");
  }

  if (files.length > MAX_FILES) {
    problems.push(
      `${files.length} files is more than we read at once. Send the ${MAX_FILES} that matter most.`,
    );
  }

  for (const file of files) {
    const extension = extensionOf(file.name);
    if (!(extension in ACCEPTED)) {
      problems.push(
        `"${file.name}" is not a format we read. Send ${[...new Set(Object.values(ACCEPTED))].join(", ")}, ` +
          `and export from your accounting package rather than screenshotting it. ` +
          `A .ods or .numbers file needs re-exporting as Excel or CSV first.`,
      );
    }
    if (file.size === 0) {
      problems.push(
        `"${file.name}" came through with nothing in it. If it lives in OneDrive, ` +
          `iCloud or Google Drive, open it once on this device so it downloads properly, ` +
          `then choose it again.`,
      );
    }
    if (file.size > MAX_BYTES_PER_FILE) {
      problems.push(
        `"${file.name}" is ${tooBig(file.size)} and the most we can take through the form ` +
          `is ${atMost(MAX_BYTES_PER_FILE)}. A file that size is usually a scan, and we cannot ` +
          `read scans anyway. Export the same report as Excel or CSV from your accounting ` +
          `package and it will be under a megabyte.`,
      );
    }
  }

  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (files.length > 1 && total > MAX_BYTES_TOTAL) {
    problems.push(
      `Together these are ${tooBig(total)} and the limit for one submission is ` +
        `${atMost(MAX_BYTES_TOTAL)}. Send the most important one now; there is a "send another ` +
        `file" button afterwards, and using the same address both times pairs them up.`,
    );
  }

  return problems;
}
