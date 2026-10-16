"""Builds docs/Genomed-Online-Selling-Prerequisites.pdf — owner-facing, no development content.
Built-in Helvetica only: no rupee sign, no box-drawing or checkbox glyphs (they render as black boxes)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

FOREST = colors.HexColor("#135a47")
FOREST_D = colors.HexColor("#071d18")
SAND = colors.HexColor("#f0f4f2")
LINE = colors.HexColor("#c7d3ce")
GREY = colors.HexColor("#3f4d48")

H1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=FOREST_D, spaceAfter=4)
SUB = ParagraphStyle("sub", fontName="Helvetica", fontSize=10.5, leading=14, textColor=GREY, spaceAfter=14)
H2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13, leading=17, textColor=FOREST, spaceBefore=14, spaceAfter=6)
BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=14, textColor=FOREST_D)
CELL = ParagraphStyle("cell", parent=BODY, fontSize=9.4, leading=12.5)
CELLB = ParagraphStyle("cellb", parent=CELL, fontName="Helvetica-Bold")
NOTE = ParagraphStyle("note", parent=BODY, fontSize=9, leading=12, textColor=GREY)
BUL = ParagraphStyle("bul", parent=BODY, leftIndent=12, bulletIndent=2, spaceAfter=2)


def P(t, s=BODY):
    return Paragraph(t, s)


def bullets(items):
    return [Paragraph(i, BUL, bulletText="-") for i in items]


def table(rows, widths, head=True):
    data = [[P(c, CELLB if head and r == 0 else CELL) for c in row] for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    style = [
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if head:
        style += [("BACKGROUND", (0, 0), (-1, 0), SAND)]
    t.setStyle(TableStyle(style))
    return t


def checklist(items, widths):
    data = [[P("[&nbsp;&nbsp;&nbsp;&nbsp;]", CELL), P(i, CELL)] for i in items]
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Genomed Pharmaceuticals - Selling online in India: what is needed before we start")
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {doc.page}")
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
    canvas.restoreState()


W = A4[0] - 40 * mm
story = [
    P("Selling Genomed products online", H1),
    P("What has to be in place before the online shop can go live. Permissions, documents and decisions only - "
      "no technical work is described here. Prepared 19 September 2026.", SUB),
]

story += [P("1. Why this is different from an ordinary online shop", H2)]
story += [P("Genomed's products are <b>Ayurvedic proprietary medicines</b>. Under Indian law they are drugs, not "
            "food or cosmetics. Three consequences follow:")]
story += bullets([
    "Payment companies (Razorpay, Cashfree, PhonePe and others) treat medicines as a <b>restricted category</b>. "
    "They approve the account only after seeing the drug licence, and the review takes longer than usual.",
    "Only medicines that contain <b>no Schedule E(1) ingredient</b> may be sold without a prescription. "
    "Anything on that list cannot be sold through the website.",
    "The law on <b>drug advertising</b> limits what a website may claim a medicine does (see section 3).",
])

story += [P("2. Licences and registrations", H2)]
story += [table([
    ["Item", "Why it is needed", "Status / action"],
    ["Ayurvedic drug manufacturing licence (UP AYUSH licensing authority)",
     "Already required to manufacture. Every payment company and courier will ask for a copy.",
     "Have. Please share the licence number and a scanned copy - the website's Quality page still shows it as unverified."],
    ["GST registration (GSTIN)",
     "Selling goods to customers in other states through a website makes GST registration compulsory, whatever the turnover. "
     "Also required by every payment company.",
     "Confirm GSTIN, or register (free, online, about a week)."],
    ["Business PAN and a current account in the business name",
     "Payment companies pay out only to a business account matching the PAN.", "Confirm."],
    ["Udyam (MSME) registration",
     "Free, done online in 10 minutes. Accepted as proof of business and unlocks lower rates with some payment companies and couriers.",
     "Recommended."],
    ["Trade mark search on product names",
     "Optional. Worth checking Sugar OK, Rimcuff, Heamclear etc. on ipindia.gov.in before spending on marketing.", "Optional."],
], [W * 0.27, W * 0.43, W * 0.30])]

story += [P("3. Two legal checks that must be done before launch", H2)]
story += [P("<b>A. Schedule E(1) check.</b> Schedule E(1) of the Drugs and Cosmetics Rules lists poisonous "
            "substances (for example aconite, datura, nux vomica, certain metals). Any formulation containing one of them "
            "needs a prescription and must be kept out of the online shop. Only the company can do this check, from the full "
            "compositions. The result decides which products can be sold online at all."), Spacer(1, 4)]
story += [P("<b>B. Advertising review.</b> The Drugs and Magic Remedies (Objectionable Advertisements) Act 1954 bans "
            "advertising any medicine as a treatment for a fixed list of conditions. That list includes diabetes, high or low "
            "blood pressure, obesity, heart disease, diseases of the uterus, menstrual disorders, sexual impotence, sterility "
            "and stones. Some current product claims touch it:")]
story += [table([
    ["Product", "Current claim", "Condition on the list"],
    ["Sugar OK", "For healthy blood sugar level", "Diabetes"],
    ["ARQ-15", "High blood pressure, high cholesterol, anti-obesity", "Blood pressure, obesity"],
    ["Cistover", "Cyst (uterine / ovarian)", "Diseases of the uterus"],
    ["Stroperm", "Men's wellness", "Depends on wording"],
], [W * 0.2, W * 0.48, W * 0.32]), Spacer(1, 4)]
story += [P("A label approved under the manufacturing licence is one thing; a website selling to the public counts as an "
            "advertisement. <b>Action:</b> have a pharma regulatory consultant or lawyer review the product pages before "
            "launch. The usual outcome is that indications are worded exactly as on the licensed label, with no claims of "
            "cure, and a 'consult a physician' line on every page (already there).")]

story += [P("4. What the website must show by law", H2)]
story += [P("Required by the Consumer Protection (E-Commerce) Rules 2020 and the Legal Metrology (Packaged Commodities) "
            "Rules 2011. Payment companies also check for these before approving an account.")]
story += [table([
    ["Requirement", "Have / need"],
    ["Legal name, full address, phone and email of the seller", "Have"],
    ["A named <b>grievance officer</b> with contact details, and a promise to acknowledge complaints within 48 hours", "Need a name"],
    ["Country of origin on every product (India)", "Easy - need confirmation only"],
    ["On every product page: MRP, net quantity, manufacturer name and full address, consumer-care phone/email", "Partly - need the full manufacturer address"],
    ["Shipping policy page (areas served, dispatch time, charges)", "Need"],
    ["Returns / refund / cancellation policy page", "Need - see decisions below"],
    ["Terms of use and Privacy policy", "Have"],
    ["Total price including all charges shown before payment", "Will be built in"],
], [W * 0.68, W * 0.32])]

story += [P("5. Documents to collect for the payment-company account", H2)]
story += [P("The same set works for Razorpay, Cashfree, PhonePe and PayU. Scanned copies, clearly readable. "
            "Expect 3 to 10 working days for approval because of the medicine category.")]
story += [checklist([
    "Business PAN card",
    "GST registration certificate",
    "Cancelled cheque or a recent bank statement of the business current account",
    "Proof of business: Udyam certificate, partnership deed, certificate of incorporation, or shop &amp; establishment licence (any one)",
    "PAN and Aadhaar of the authorised signatory (the person who will sign up)",
    "Drug manufacturing licence",
    "The website address, with the policy pages from section 4 already live",
    "A business email address on the company's own domain, e.g. orders@genomedpharmaceuticals.com (the Gmail address cannot send order emails)",
], [12 * mm, W - 12 * mm])]

story += [P("6. Courier account", H2)]
story += [P("A courier aggregator (Shiprocket or iThink Logistics) gives one account for many couriers, with cash on "
            "delivery, pickup from Bulandshahr and tracking. Free to open; you pay per parcel (roughly Rs 30-50 for a 500 g "
            "parcel within India, plus about Rs 30-40 or 2% for cash-on-delivery orders). India Post Speed Post is the "
            "cheapest fallback and reaches every pincode.")]
story += bullets([
    "Needed to open the account: GSTIN, PAN, bank details, pickup address and the days/hours pickups can happen.",
    "Seven of the ten products are liquids in glass bottles. They can be sent by surface courier if sealed and packed in a box "
    "with cushioning. Breakage is the usual reason for a return, so packing material needs to be arranged.",
    "Every parcel must carry a GST invoice showing the batch number and expiry. Only stock with at least about six months' "
    "shelf life left should be sold.",
])

story += [P("7. Decisions needed from the owner", H2)]
story += [P("These cannot be decided by anyone else, and the shop cannot be designed until they are answered.")]
story += [table([
    ["Decision", "Options / notes", "Answer"],
    ["Who do we sell to online?", "Consumers only; distributors and clinics only; or both. Selling to distributors needs a login and a separate trade price list.", ""],
    ["Cash on delivery?", "Yes / no. It is still a third to a half of Indian online orders. If yes: is there a surcharge (commonly Rs 30-50 on orders under Rs 500)?", ""],
    ["Minimum order value", "For example Rs 300, so that courier cost does not exceed the order.", ""],
    ["Shipping charge", "Free above a threshold (e.g. Rs 500) and a flat fee below it; or actual courier cost.", ""],
    ["Returns and refunds", "Standard for medicines: no returns except damaged or wrong item, reported within 48 hours with photos; refund to the original payment method within 7 days.", ""],
    ["Which products go online", "After the Schedule E(1) check in section 3.", ""],
    ["Grievance officer", "Name, phone, email.", ""],
    ["Payment company", "Razorpay and Cashfree are the recommended two; apply to both so that one approval unblocks launch.", ""],
], [W * 0.24, W * 0.56, W * 0.20])]

story += [P("8. Costs", H2), P("There are no set-up fees. Running costs at launch:")]
story += [table([
    ["Item", "Cost"],
    ["Website hosting (a paid plan is required for a shop)", "About Rs 1,700 per month"],
    ["Order records, e-mails, enquiry forms, courier account", "Free tiers - Rs 0 at launch"],
    ["Payment company", "No monthly fee. UPI is free or near-free (government rule); cards and net-banking about 2% + GST per order"],
    ["Courier", "Per parcel only, as above"],
    ["Regulatory review of product wording (one-off)", "Consultant's fee - to be quoted"],
    ["Domain", "Already owned"],
], [W * 0.55, W * 0.45])]
story += [Spacer(1, 4), P("Example: an order of Rs 476 paid by UPI at 0% reaches the company in full; paid by card it "
                          "reaches the company as about Rs 465; paid cash on delivery it reaches the company as about Rs 436, "
                          "a week later.", NOTE)]

story += [P("9. Order of work", H2)]
story += [table([
    ["Step", "Who", "Time"],
    ["Schedule E(1) check of all compositions; decide which products go online", "Company", "1 week"],
    ["Answer the decisions in section 7", "Owner", "-"],
    ["Regulatory review of product-page wording", "Consultant", "1-2 weeks"],
    ["Confirm GSTIN, business account, Udyam; collect the documents in section 5", "Company", "1 week"],
    ["Set up orders@ e-mail on the company domain", "Company / web team", "1 day"],
    ["Apply to Razorpay and Cashfree; open the courier account", "Company", "3-10 working days for approval"],
    ["Write shipping and refund policies from the decisions above", "Web team, owner signs off", "2 days"],
    ["Build the online checkout (not covered here)", "Web team", "After the above"],
], [W * 0.56, W * 0.22, W * 0.22])]
story += [Spacer(1, 8), P("Most of the first six steps can run at the same time. The whole preparation is realistically "
                          "three to four weeks, most of it waiting on approvals.", NOTE)]

doc = SimpleDocTemplate(
    "docs/Genomed-Online-Selling-Prerequisites.pdf", pagesize=A4,
    leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=22 * mm,
    title="Genomed - Selling online: prerequisites", author="Genomed web team",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("written")
