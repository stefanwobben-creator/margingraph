#!/usr/bin/env python3
"""How many filed UK accounts actually contain a profit and loss account?

The question this settles is not "is the dataset big enough". Companies House
publishes millions of filings and that has never been in doubt. The question is
whether the column we need is in them at all, because a small company in the UK
may file filleted accounts: a balance sheet, notes, and no profit and loss.

Run it over an extracted Accounts Data Product folder:

    python3 scripts/count-pnl-coverage.py ~/Downloads/Accounts_Bulk_Data-2026-07

It reads nothing into memory beyond one file at a time, so a folder of a
hundred thousand filings is fine, and it prints one table:

    filings                     412,880
    with turnover                 9,104   2.2%
    with cost of sales            6,301   1.5%
    with both                     6,120   1.5%
    with both and a SIC code      5,970   1.4%

The last row is the one that matters, because a margin benchmark is not one
number. It is one number per sector per size band, and a cohort of six thousand
filings spread over eighty sectors and four size bands is forty companies a
cell before you have excluded a single outlier.

Deliberately dumb: substring matching on the iXBRL element names rather than a
full parse. A false positive here costs nothing, because the answer we are
looking for is an order of magnitude, and if the honest count came out at two
percent no amount of parsing rigour would rescue it.
"""

from __future__ import annotations

import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

# The names these figures are filed under. UK GAAP taxonomies have renamed
# things over the years, so each concept carries its aliases.
TURNOVER = ("TurnoverRevenue", "Turnover", "Revenue", "TurnoverGrossOperatingRevenue")
COST_OF_SALES = ("CostSales", "CostOfSales", "GrossProfitLoss", "GrossProfit")
SIC = ("SICCode", "PrincipalActivity", "sic")

PATTERNS = {
    "turnover": re.compile("|".join(TURNOVER)),
    "cost of sales": re.compile("|".join(COST_OF_SALES)),
    "sic code": re.compile("|".join(SIC), re.I),
}


def classify(text: str) -> set[str]:
    return {name for name, pattern in PATTERNS.items() if pattern.search(text)}


def documents(root: Path):
    """Every filing under root, whether loose or still inside its zip."""
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        if path.suffix.lower() in {".html", ".htm", ".xhtml", ".xml"}:
            try:
                yield path.name, path.read_text("utf-8", errors="ignore")
            except OSError:
                continue
        elif path.suffix.lower() == ".zip":
            try:
                with zipfile.ZipFile(path) as archive:
                    for member in archive.namelist():
                        if member.endswith("/"):
                            continue
                        with archive.open(member) as handle:
                            yield member, handle.read().decode("utf-8", errors="ignore")
            except zipfile.BadZipFile:
                continue


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: python3 scripts/count-pnl-coverage.py <folder or zip>")

    root = Path(sys.argv[1]).expanduser()
    if not root.exists():
        sys.exit(f"no such path: {root}")

    counts: Counter[str] = Counter()
    total = 0

    for name, text in documents(root):
        total += 1
        found = classify(text)
        for key in found:
            counts[key] += 1
        if {"turnover", "cost of sales"} <= found:
            counts["both"] += 1
            if "sic code" in found:
                counts["both and a sector"] += 1
        if total % 5000 == 0:
            print(f"  ... {total:,} read", file=sys.stderr)

    if total == 0:
        sys.exit("found no filings there. Point it at the extracted folder.")

    print()
    rows = [
        ("filings", total),
        ("with turnover", counts["turnover"]),
        ("with cost of sales", counts["cost of sales"]),
        ("with both", counts["both"]),
        ("with both and a sector", counts["both and a sector"]),
    ]
    width = max(len(label) for label, _ in rows)
    for label, value in rows:
        share = f"{value / total:6.1%}" if label != "filings" else ""
        print(f"  {label.ljust(width)}  {value:>12,}  {share}")
    print()

    usable = counts["both and a sector"]
    print(
        f"  A benchmark needs a cohort per sector and size band. At {usable:,} usable\n"
        f"  filings, eighty sectors and four size bands, that is about\n"
        f"  {usable // 320:,} companies a cell before any outlier is excluded.\n"
    )


if __name__ == "__main__":
    main()
