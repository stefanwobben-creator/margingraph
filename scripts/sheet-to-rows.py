#!/usr/bin/env python3
"""Turn a spreadsheet into the grid the intake reader works on.

Everything clever happens in `lib/reports/intake`, which is TypeScript, tested,
and shipped. This is the dumbest possible bridge to it: open the file, read the
cells, write JSON. It deliberately makes no decisions about which column is the
budget or which row is turnover, because a decision made here would be a
decision nobody can test.

    python3 scripts/sheet-to-rows.py "Q1 2026.xlsx" > /tmp/rows.json
    python3 scripts/sheet-to-rows.py accounts.csv --sheet 2

Reads .xlsx (openpyxl) and .csv. Formula cells come back as their last cached
value, which is what the sender saw on their screen; a workbook saved by
something that does not cache values will show blanks there, and the reader
will say so rather than inventing figures.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path


def from_csv(path: Path) -> dict:
    """A CSV has no types, so anything that parses as a number becomes one."""
    with path.open(newline="", encoding="utf-8-sig") as handle:
        sample = handle.read(8192)
        handle.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
        except csv.Error:
            dialect = csv.excel
        rows = [[cell_value(c) for c in row] for row in csv.reader(handle, dialect)]
    return {"name": path.stem, "rows": rows}


def cell_value(raw: str):
    text = raw.strip()
    if text == "":
        return None
    # European and English notation, plus the accountant's parenthesised
    # negative, which is a minus sign written as punctuation.
    negative = text.startswith("(") and text.endswith(")")
    body = text[1:-1] if negative else text
    body = body.replace("€", "").replace("%", "").strip()
    cleaned = body.replace(" ", "").replace(" ", "")
    if "," in cleaned and "." in cleaned:
        cleaned = (
            cleaned.replace(".", "").replace(",", ".")
            if cleaned.rfind(",") > cleaned.rfind(".")
            else cleaned.replace(",", "")
        )
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")
    try:
        number = float(cleaned)
    except ValueError:
        return text
    if negative:
        number = -number
    return -0.0 + number if number else 0.0


def from_xlsx(path: Path, sheet: str | None) -> dict:
    try:
        from openpyxl import load_workbook
    except ImportError:  # pragma: no cover - environment problem, not logic
        sys.exit("openpyxl is not installed. Run: pip install openpyxl")

    book = load_workbook(path, data_only=True, read_only=True)
    if sheet is not None:
        try:
            worksheet = book[sheet] if sheet in book.sheetnames else book.worksheets[int(sheet) - 1]
        except (ValueError, IndexError):
            sys.exit(f"no sheet {sheet!r}. This file has: {', '.join(book.sheetnames)}")
    else:
        # The first sheet with anything on it. A workbook that opens on an
        # empty cover tab is common enough to be worth handling.
        worksheet = next(
            (ws for ws in book.worksheets if ws.max_row and ws.max_row > 1),
            book.worksheets[0],
        )

    rows = []
    for row in worksheet.iter_rows(values_only=True):
        rows.append(
            [
                cell if isinstance(cell, (int, float)) and not isinstance(cell, bool)
                else (str(cell).strip() or None) if cell is not None
                else None
                for cell in row
            ]
        )
    return {"name": worksheet.title, "rows": rows, "sheets": book.sheetnames}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("file")
    parser.add_argument("--sheet", help="sheet name, or 1-based index")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        sys.exit(f"no such file: {path}")

    data = from_csv(path) if path.suffix.lower() == ".csv" else from_xlsx(path, args.sheet)
    json.dump(data, sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
