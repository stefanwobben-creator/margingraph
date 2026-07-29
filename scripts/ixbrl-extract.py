#!/usr/bin/env python3
"""
Pull the balance sheet out of a Companies House iXBRL filing.

Deliberately dumb and deliberately strict. It reads tagged facts and nothing
else: no layout heuristics, no guessing from labels. A filing that does not tag
a figure simply does not have it, and the gate downstream is allowed to say so.

Emits one JSON object per file on stdout.
"""
import json, re, sys, glob
from lxml import etree

IX = "http://www.xbrl.org/2013/inlineXBRL"
IX8 = "http://www.xbrl.org/2008/inlineXBRL"
XBRLI = "http://www.xbrl.org/2003/instance"
XBRLDI = "http://xbrl.org/2006/xbrldi"

# Dimension members that split one concept into several lines. Two different
# taxonomies express "due within a year" differently and both appear in the
# same month of filings, so both are mapped onto one name.
CURRENT = {"WithinOneYear", "CurrentFinancialInstruments"}
NONCURRENT = {"AfterOneYear", "Non-currentFinancialInstruments"}

WANTED = {
    "CurrentAssets": "current-assets",
    "FixedAssets": "fixed-assets",
    "NetCurrentAssetsLiabilities": "net-current-assets",
    "TotalAssetsLessCurrentLiabilities": "total-assets-less-current",
    "NetAssetsLiabilities": "net-assets",
    "Equity": "equity",
    "TotalAssets": "total-assets",
    "TotalLiabilities": "total-liabilities",
    "CalledUpShareCapitalNotPaidNotExpressedAsCurrentAsset": "share-capital-unpaid",
    "ProvisionsForLiabilitiesBalanceSheetSubtotal": "provisions",
    "AccruedLiabilitiesNotExpressedWithinCreditorsSubtotal": "accruals",
    "PrepaymentsAccruedIncomeNotExpressedWithinCurrentAssetSubtotal": "prepayments",
    "CashBankOnHand": "cash",
    "Debtors": "debtors",
    "AverageNumberEmployeesDuringPeriod": "employees",
    # Profit and loss. Rare in filed small-company accounts, which is exactly
    # why it is worth knowing how rare.
    "TurnoverRevenue": "turnover",
    "GrossProfitLoss": "gross-profit",
    "OperatingProfitLoss": "operating-profit",
    "ProfitLoss": "profit",
    "ProfitLossOnOrdinaryActivitiesBeforeTax": "profit-before-tax",
    "CostSales": "cost-of-sales",
    "AdministrativeExpenses": "admin-expenses",
    "StaffCostsEmployeeBenefitsExpense": "staff-costs",
}

def localname(tag):
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag

def bracketed(el):
    """
    A minus that only exists in the presentation.

    Real filings write "(1,451)" with the brackets as plain text around the
    tagged number and no sign attribute. A reader that trusts the tag alone
    sees a positive. This was found on a live filing where the same page
    tagged net assets as negative and shareholders' funds as positive, which
    is the same figure with two different signs.
    """
    before = (el.getparent().text or "") if el.getparent() is not None else ""
    after = el.tail or ""
    return before.rstrip().endswith("(") and after.lstrip().startswith(")")

def parse_number(el):
    text = "".join(el.itertext())
    fmt = el.get("format") or ""
    if "zerodash" in fmt and text.strip() in {"-", "–", ""}:
        value = 0.0
    else:
        cleaned = re.sub(r"[^0-9.\-]", "", text.replace(",", ""))
        if cleaned in {"", "-", "."}:
            return None
        value = float(cleaned)
    if el.get("sign") == "-" or (value > 0 and bracketed(el)):
        value = -value
    scale = el.get("scale")
    if scale:
        value *= 10 ** int(scale)
    return value

def contexts(root):
    out = {}
    for ctx in root.iter("{%s}context" % XBRLI):
        cid = ctx.get("id")
        period = ctx.find("{%s}period" % XBRLI)
        instant = period.find("{%s}instant" % XBRLI) if period is not None else None
        end = period.find("{%s}endDate" % XBRLI) if period is not None else None
        members = [localname(m.text.strip()) if m.text else ""
                   for m in ctx.iter("{%s}explicitMember" % XBRLDI)]
        members = [m.split(":")[-1] for m in members]
        out[cid] = {
            "date": (instant.text if instant is not None else (end.text if end is not None else None)),
            "members": members,
        }
    return out

def extract(path):
    root = etree.parse(path).getroot()
    ctxs = contexts(root)
    dates = [c["date"] for c in ctxs.values() if c["date"]]
    latest = max(dates) if dates else None

    facts = {}
    name = number = None
    for el in list(root.iter("{%s}nonFraction" % IX)) + list(root.iter("{%s}nonFraction" % IX8)):
        concept = (el.get("name") or "").split(":")[-1]
        ctx = ctxs.get(el.get("contextRef"), {})
        if ctx.get("date") != latest:
            continue
        members = set(ctx.get("members", []))
        # Any member we do not understand means the fact is a breakdown of a
        # line rather than the line itself. Skipping is the safe default.
        if concept == "Creditors":
            if members & CURRENT:
                key = "creditors-current"
            elif members & NONCURRENT:
                key = "creditors-noncurrent"
            else:
                key = "creditors-current"
        elif concept == "Debtors" and (not members or (members & CURRENT)):
            key = "debtors"
        elif concept in WANTED and not members:
            key = WANTED[concept]
        else:
            continue
        value = parse_number(el)
        if value is not None and key not in facts:
            facts[key] = value

    for el in list(root.iter("{%s}nonNumeric" % IX)) + list(root.iter("{%s}nonNumeric" % IX8)):
        concept = (el.get("name") or "").split(":")[-1]
        text = "".join(el.itertext()).strip()
        if concept == "EntityCurrentLegalOrRegisteredName" and not name:
            name = text
        if concept == "UKCompaniesHouseRegisteredNumber" and not number:
            number = text

    # Liabilities are stored as positive magnitudes because the filings do not
    # agree with each other: some tag a creditor as 8,667, some as (8,667), and
    # some with sign="-". The subtraction belongs in the rollup, where it is
    # visible, rather than in whichever convention this particular filer chose.
    for key in ("creditors-current", "creditors-noncurrent", "provisions", "accruals"):
        if key in facts:
            facts[key] = abs(facts[key])

    return {"file": path.rsplit("/", 1)[-1], "name": name, "number": number,
            "date": latest, "facts": facts}

if __name__ == "__main__":
    out = [extract(p) for p in sorted(glob.glob(sys.argv[1]))]
    print(json.dumps(out, indent=1))
