import sys
import json
from fpdf import FPDF

def generate_pdf(data, output_path):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(20, 20, 20)

    # ── Helpers ──
    def doc_header(text):
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_fill_color(26, 35, 126)  # Primary blue
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 11, text, new_x="LMARGIN", new_y="NEXT", align="C", fill=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(3)

    def section_header(text):
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_fill_color(235, 240, 252)
        pdf.set_text_color(26, 35, 126)
        pdf.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

    def field(label, value):
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_x(20)
        clean_val = str(value).replace("\u2014", "-").replace("\u2013", "-").replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"').replace("\u20b9", "Rs. ")
        pdf.cell(0, 6, f"{label}: {clean_val}", new_x="LMARGIN", new_y="NEXT")

    def body(text):
        pdf.set_font("Helvetica", "", 10)
        clean_text = str(text).replace("\u2014", "-").replace("\u2013", "-").replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"').replace("\u20b9", "Rs. ")
        pdf.multi_cell(0, 5.5, clean_text)
        pdf.ln(2)

    tender_title = data.get("tenderTitle", "Consolidated Tender Bids")
    tender_ref = data.get("tenderRef", "TENDER-REF-2026")
    authority = data.get("issuingAuthority", "Government Procurement Authority")
    deadline = data.get("submissionDeadline", "15 September 2026")
    bidders = data.get("bidders", [])

    # ════ PAGE 1: Cover Page ════
    pdf.add_page()
    pdf.ln(15)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(26, 35, 126)
    pdf.cell(0, 12, "CONSOLIDATED BID SUBMISSIONS", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(0, 137, 123)
    pdf.cell(0, 8, f"Tender Reference: {tender_ref}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Project: {tender_title}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Issuing Authority: {authority}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Submission Date: {deadline}", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 12)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(0, 8, f"Participating Bidders ({len(bidders)} Vendors)", new_x="LMARGIN", new_y="NEXT", fill=True, align="C")
    pdf.ln(2)

    for idx, b in enumerate(bidders):
        name = b.get("name", f"Bidder {idx + 1}")
        cat = b.get("category", "Vendor Proposal")
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(15, 6, f"{idx + 1}.")
        pdf.cell(90, 6, name)
        pdf.set_font("Helvetica", "I", 9)
        pdf.cell(0, 6, cat, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 5.5, "This document contains consolidated technical and commercial proposals submitted in response to the specified tender. All submissions are processed and evaluated according to Bureau of Indian Standards (BIS) quality guidelines and public procurement directives.")

    # ════ BIDDER PAGES ════
    for idx, b in enumerate(bidders):
        pdf.add_page()
        pdf.set_text_color(0, 0, 0)
        bidder_num = idx + 1
        name = b.get("name", f"Bidder {bidder_num}")
        doc_header(f"BIDDER {bidder_num}: {name}")

        # Section 1: Company Profile
        section_header("1. Company Overview")
        field("Company Name", name)
        if b.get("regNo"):
            field("Registration / CIN", b["regNo"])
        if b.get("contact"):
            field("Contact Person", b["contact"])
        pdf.ln(2)

        # Section 2: Cost & Timeline
        section_header("2. Proposed Cost & Timeline")
        cost_inr = b.get("proposedCostINR")
        if cost_inr is not None:
            lakhs = cost_inr / 100000.0
            field("Total Bid Amount", f"Rs. {cost_inr:,} ({lakhs:.2f} Lakhs)")
        else:
            field("Total Bid Amount", "Not specified")

        days = b.get("deliveryDays")
        field("Delivery Timeline", f"{days} days from Letter of Award" if days else "Not specified")
        if b.get("paymentTerms"):
            field("Payment Terms", b["paymentTerms"])
        pdf.ln(2)

        # Section 3: Technical Compliance
        section_header("3. Technical Compliance & Specifications")
        if b.get("materials"):
            body(f"Materials Offered: {b['materials']}")

        stds = b.get("standardsClaimed", [])
        if isinstance(stds, list):
            stds_str = ", ".join(stds)
        else:
            stds_str = str(stds)
        field("Standards Claimed", stds_str if stds_str else "None specified")

        is_mark = b.get("isMarkClaimed", False)
        if is_mark:
            field("ISI Mark / BIS Certification", "Yes - Valid and Active License Claimed")
        else:
            field("ISI Mark / BIS Certification", "Not claimed / None specified")

        exp = b.get("experienceMentioned", False)
        if exp:
            body("Vendor has demonstrated prior experience in government projects and public sector procurement.")
        else:
            body("No prior government contract completion experience specified in this proposal.")

        if b.get("details"):
            body(b["details"])

    pdf.output(output_path)
    print("SUCCESS")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_bid_pdf.py <input_json_path> <output_pdf_path>")
        sys.exit(1)

    json_path = sys.argv[1]
    out_path = sys.argv[2]
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    generate_pdf(data, out_path)
