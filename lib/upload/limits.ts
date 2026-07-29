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

export const ACCEPT_ATTRIBUTE = Object.keys(ACCEPTED).join(",");

export type Candidate = {
  name: string;
  /** Bytes. */
  size: number;
};

export const megabytes = (bytes: number) =>
  `${(bytes / 1_000_000).toFixed(bytes < 1_000_000 ? 2 : 1)} MB`;

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
          `and export from your accounting package rather than screenshotting it.`,
      );
    }
    if (file.size === 0) {
      problems.push(`"${file.name}" is empty.`);
    }
    if (file.size > MAX_BYTES_PER_FILE) {
      problems.push(
        `"${file.name}" is ${megabytes(file.size)}, and we can accept ${megabytes(MAX_BYTES_PER_FILE)} per file. ` +
          `Email it to info@margingraph.com instead and we will pick it up there.`,
      );
    }
  }

  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (files.length > 1 && total > MAX_BYTES_TOTAL) {
    problems.push(
      `Together these are ${megabytes(total)}, and the limit for one submission is ${megabytes(MAX_BYTES_TOTAL)}. ` +
        `Send them in two goes, or email them to info@margingraph.com.`,
    );
  }

  return problems;
}
