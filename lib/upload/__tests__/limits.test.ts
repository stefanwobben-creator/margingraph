import { describe, test } from "vitest";
import assert from "node:assert/strict";

import {
  MAX_BYTES_PER_FILE,
  MAX_BYTES_TOTAL,
  MAX_FILES,
  extensionOf,
  validate,
} from "../limits";

const ok = { email: "owner@example.com", files: [{ name: "pnl.xlsx", size: 40_000 }] };

describe("what we accept", () => {
  test("a profit and loss account and an email address is the whole requirement", () => {
    assert.deepEqual(validate(ok), []);
  });

  test("reads the extension whatever case it arrives in", () => {
    assert.equal(extensionOf("Q1 2026.XLSX"), ".xlsx");
    assert.equal(extensionOf("noextension"), "");
    assert.equal(extensionOf("archive.tar.gz"), ".gz");
  });

  test("takes the formats an accounting package exports", () => {
    for (const name of ["a.xlsx", "a.xls", "a.xlsm", "a.csv", "a.tsv", "a.pdf"]) {
      assert.deepEqual(validate({ ...ok, files: [{ name, size: 1_000 }] }), [], name);
    }
  });

  test("turns away a screenshot, and says what to send instead", () => {
    const [problem] = validate({ ...ok, files: [{ name: "accounts.png", size: 1_000 }] });
    assert.match(problem, /not a format we read/);
    assert.match(problem, /export from your accounting package/);
  });
});

describe("what it says when it says no", () => {
  test("reports every problem at once, not the first one", () => {
    // A form that objects one item at a time is a form people abandon on the
    // third attempt, and most people only make one.
    const problems = validate({ email: "not-an-address", files: [] });
    assert.equal(problems.length, 2);
    assert.match(problems[0], /email address/);
    assert.match(problems[1], /No file was attached/);
  });

  test("names the file that is too big, its size, and the way round it", () => {
    const [problem] = validate({
      ...ok,
      files: [{ name: "annual accounts.pdf", size: MAX_BYTES_PER_FILE + 1 }],
    });
    // The limit and the offending file must never round to the same number.
    // They did, and the message read "is 3.5 MB, and we can accept 3.5 MB".
    assert.match(problem, /"annual accounts\.pdf" is 3\.6 MB/);
    assert.match(problem, /most we can take through the form is 3\.5 MB/);
    assert.match(problem, /Export the same report as Excel or CSV/);
  });

  test("catches the total as well as the parts", () => {
    const half = Math.round(MAX_BYTES_TOTAL * 0.6);
    const problems = validate({
      ...ok,
      files: [
        { name: "a.xlsx", size: half },
        { name: "b.xlsx", size: half },
      ],
    });
    assert.equal(problems.length, 1, "neither file is over the per-file limit on its own");
    assert.match(problems[0], /limit for one submission/);
    assert.match(problems[0], /send another file/);
  });

  test("does not complain about a total when there is only one file", () => {
    // One file under the per-file limit is by definition acceptable. Reporting
    // it twice reads as two different problems.
    assert.deepEqual(validate({ ...ok, files: [{ name: "a.xlsx", size: 3_000_000 }] }), []);
  });

  test("counts the files", () => {
    const files = Array.from({ length: MAX_FILES + 1 }, (_, i) => ({
      name: `f${i}.csv`,
      size: 100,
    }));
    assert.match(validate({ ...ok, files })[0], /more than we read at once/);
  });

  test("rejects an empty file rather than reporting that it found nothing in it", () => {
    const [problem] = validate({ ...ok, files: [{ name: "a.xlsx", size: 0 }] });
    assert.match(problem, /came through with nothing in it/);
    // "is empty" gives an owner nothing to do. The cause is nearly always a
    // cloud-storage placeholder that never downloaded to the device.
    assert.match(problem, /OneDrive, iCloud or Google Drive/);
  });
});
