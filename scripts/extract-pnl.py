#!/usr/bin/env python3
"""Pull the actual profit and loss figures out of filed UK accounts.

`count-pnl-coverage.py` counts how many filings *mention* a turnover element.
This one reads what the element says, which is a different question and the one
that decides whether a benchmark is possible.

    python3 scripts/extract-pnl.py ~/Downloads/Accounts_Bulk_Data > pnl.csv

Writes one row per filing that carries both a turnover and a cost of sales
figure, with the gross margin worked out. Filings that carry the tags and no
numbers, or numbers that are obviously not a trading company, come out too, so
that the dross is visible rather than silently dropped: the first filing we
looked at reported a turnover of minus £1,452 and a cost of sales of zero, and
counting it as a data point would have been counting a dormant shell as a
business.

Sign handling is the part worth reading. iXBRL writes a negative in two
different ways in the same document: an explicit sign="-" attribute, and a pair
of literal brackets in the text with no attribute at all. Reading only the
attribute produced a filing whose net assets and equity disagreed by exactly
twice the amount, which looked like a real accounting error and was ours.
"""

from __future__ import annotations

import csv
import re
import sys
import zipfile
from pathlib import Path

NUMBER = re.compile(
    r"<ix:nonFraction\b(?P<attrs>[^>]*)>(?P<text>.*?)</ix:nonFraction>",
    re.S | re.I,
)
ATTR = re.compile(r'(\w[\w:-]*)\s*=\s*"([^"]*)"')
TAGS = re.compile(r"<[^>]+>")

WANTED = {
    "turnover": ("turnoverrevenue", "turnover", "turnovergrossoperatingrevenue"),
    "cost_of_sales": ("costsales", "costofsales"),
    "gross_profit": ("grossprofitloss", "grossprofit"),
}


def value_of(attrs: dict[str, str], text: str) -> float | None:
    body = TAGS.sub("", text).strip()
    if not body:
        return None
    # A minus written as punctuation. Reading only sign="-" misses these, and
    # the two conventions appear in the same document.
    bracketed = body.startswith("(") and body.endswith(")")
    if bracketed:
        body = body[1:-1]
    body = body.replace(",", "").replace("\xa0", "").replace(" ", "")
    try:
        number = float(body)
    except ValueError:
        return None
    if attrs.get("sign") == "-" or bracketed:
        number = -number
    scale = attrs.get("scale")
    if scale:
        try:
            number *= 10 ** int(scale)
        except ValueError:
            pass
    return number


def read(text: str) -> dict[str, float]:
    """The current-year value for each figure we care about."""
    found: dict[str, float] = {}
    for match in NUMBER.finditer(text):
        attrs = dict(ATTR.findall(match.group("attrs")))
        name = attrs.get("name", "").split(":")[-1].lower()
        context = attrs.get("contextRef", "")
        # Prior-year contexts are named for the period they cover. Anything
        # that is not clearly the current year is left alone rather than
        # guessed at: mixing two years into one margin is worse than no margin.
        if context and not re.search(r"^(cy|current|d?\d{4}0?)", context, re.I):
            continue
        for key, aliases in WANTED.items():
            if name in aliases and key not in found:
                value = value_of(attrs, match.group("text"))
                if value is not None:
                    found[key] = value
    return found


def documents(root: Path):
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        suffix = path.suffix.lower()
        if suffix in {".html", ".htm", ".xhtml", ".xml"}:
            try:
                yield path.name, path.read_text("utf-8", errors="ignore")
            except OSError:
                continue
        elif suffix == ".zip":
            try:
                with zipfile.ZipFile(path) as archive:
                    for member in archive.namelist():
                        if not member.endswith("/"):
                            with archive.open(member) as handle:
                                yield member, handle.read().decode("utf-8", errors="ignore")
            except zipfile.BadZipFile:
                continue


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: python3 scripts/extract-pnl.py <folder or zip> > pnl.csv")

    root = Path(sys.argv[1]).expanduser()
    if not root.exists():
        sys.exit(f"no such path: {root}")

    writer = csv.writer(sys.stdout)
    writer.writerow(
        ["file", "company", "made_up_to", "turnover", "cost_of_sales", "gross_profit", "gross_margin"]
    )

    seen = 0
    usable = 0
    trading = 0

    for name, text in documents(root):
        seen += 1
        figures = read(text)
        if "turnover" not in figures or "cost_of_sales" not in figures:
            continue
        usable += 1

        turnover = figures["turnover"]
        cost = figures["cost_of_sales"]
        gross = figures.get("gross_profit", turnover - cost)
        margin = gross / turnover if turnover else ""

        # A trading company, for the purpose of a margin benchmark: turnover
        # positive and large enough that a percentage means anything. Reported
        # rather than filtered, because the share that fails this is the
        # answer to whether the dataset is worth mining.
        if turnover > 10_000:
            trading += 1

        parts = re.findall(r"([A-Z]{0,2}\d{6,8})_?(\d{8})?", name)
        company = parts[0][0] if parts else ""
        date = parts[0][1] if parts and len(parts[0]) > 1 else ""

        writer.writerow(
            [name, company, date, turnover, cost, gross, f"{margin:.4f}" if margin != "" else ""]
        )

    print(
        f"\n  {seen:,} filings read\n"
        f"  {usable:,} carried both turnover and cost of sales\n"
        f"  {trading:,} of those had turnover over £10,000\n",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
