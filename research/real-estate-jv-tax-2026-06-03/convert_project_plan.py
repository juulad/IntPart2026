from pathlib import Path
import html, re, zipfile, datetime, sys

base = Path("research/real-estate-jv-tax-2026-06-03")
stem = sys.argv[1] if len(sys.argv) > 1 else "project-plan"
md_path = base / (stem + ".md")
html_path = base / (stem + ".html")
docx_path = base / (stem + ".docx")
source = md_path.read_text(encoding="utf-8")
lines = source.splitlines()

def esc(s):
    return html.escape(s, quote=False)

def is_table_sep(s):
    return bool(re.match(r"^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$", s.strip()))

def cells(s):
    return [c.strip() for c in s.strip().strip("|").split("|")]

def html_table(rows):
    out = ["<table><thead><tr>"]
    for c in rows[0]:
        out.append("<th>" + esc(c) + "</th>")
    out.append("</tr></thead><tbody>")
    for row in rows[1:]:
        out.append("<tr>")
        for c in row:
            out.append("<td>" + esc(c) + "</td>")
        out.append("</tr>")
    out.append("</tbody></table>")
    return "".join(out)

html_parts = []
i = 0
ol = False
ul = False
while i < len(lines):
    st = lines[i].strip()
    if not st:
        if ol:
            html_parts.append("</ol>")
            ol = False
        if ul:
            html_parts.append("</ul>")
            ul = False
        i += 1
        continue
    if st.startswith("|") and i + 1 < len(lines) and is_table_sep(lines[i + 1]):
        if ol:
            html_parts.append("</ol>")
            ol = False
        if ul:
            html_parts.append("</ul>")
            ul = False
        rows = [cells(lines[i])]
        i += 2
        while i < len(lines) and lines[i].strip().startswith("|") and "|" in lines[i].strip()[1:]:
            rows.append(cells(lines[i]))
            i += 1
        html_parts.append(html_table(rows))
        continue
    if st.startswith("# "):
        html_parts.append("<h1>" + esc(st[2:]) + "</h1>")
    elif st.startswith("## "):
        html_parts.append("<h2>" + esc(st[3:]) + "</h2>")
    elif st.startswith("### "):
        html_parts.append("<h3>" + esc(st[4:]) + "</h3>")
    elif re.match(r"^\d+\.\s+", st):
        if not ol:
            if ul:
                html_parts.append("</ul>")
                ul = False
            html_parts.append("<ol>")
            ol = True
        html_parts.append("<li>" + esc(re.sub(r"^\d+\.\s+", "", st)) + "</li>")
    elif st.startswith("- "):
        if not ul:
            if ol:
                html_parts.append("</ol>")
                ol = False
            html_parts.append("<ul>")
            ul = True
        html_parts.append("<li>" + esc(st[2:]) + "</li>")
    else:
        if ol:
            html_parts.append("</ol>")
            ol = False
        if ul:
            html_parts.append("</ul>")
            ul = False
        html_parts.append("<p>" + esc(st) + "</p>")
    i += 1
if ol:
    html_parts.append("</ol>")
if ul:
    html_parts.append("</ul>")

css = """
body { font-family: Arial, Helvetica, sans-serif; line-height: 1.48; color: #1f2933; max-width: 1040px; margin: 36px auto; padding: 0 28px 60px; }
h1 { font-size: 30px; margin: 0 0 18px; color: #111827; }
h2 { font-size: 22px; margin: 34px 0 12px; border-bottom: 1px solid #d7dde5; padding-bottom: 6px; color: #1f2937; }
h3 { font-size: 17px; margin: 24px 0 8px; color: #263445; }
p { margin: 9px 0; }
table { border-collapse: collapse; width: 100%; margin: 14px 0 22px; font-size: 14px; }
th, td { border: 1px solid #d6dce3; padding: 8px 10px; vertical-align: top; }
th { background: #eef3f8; color: #111827; text-align: left; }
tr:nth-child(even) td { background: #fafbfc; }
ol, ul { margin: 9px 0 16px 24px; }
li { margin: 4px 0; }
@media print { body { max-width: none; margin: 0.55in; padding: 0; } h2 { break-after: avoid; } table { break-inside: avoid; } }
"""
html_doc = "<!doctype html>\n<html><head><meta charset=\"utf-8\"><title>U.S. Real Estate JV Setup Project Plan</title><style>" + css + "</style></head><body>\n" + "\n".join(html_parts) + "\n</body></html>\n"
html_path.write_text(html_doc, encoding="utf-8")

def wesc(s):
    return html.escape(s, quote=False)

def p_xml(s, style=None):
    ppr = ""
    if style:
        ppr = '<w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>'
    return '<w:p>' + ppr + '<w:r><w:t xml:space="preserve">' + wesc(s) + '</w:t></w:r></w:p>'

def list_xml(s, numid):
    return '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="' + str(numid) + '"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">' + wesc(s) + '</w:t></w:r></w:p>'

def table_xml(rows):
    out = ['<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="BFC7D1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="BFC7D1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFC7D1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="BFC7D1"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFC7D1"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFC7D1"/></w:tblBorders></w:tblPr>']
    for r, row in enumerate(rows):
        out.append("<w:tr>")
        for cell in row:
            shade = '<w:shd w:fill="EEF3F8"/>' if r == 0 else ""
            out.append('<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/>' + shade + '</w:tcPr>' + p_xml(cell) + '</w:tc>')
        out.append("</w:tr>")
    out.append("</w:tbl>")
    return "".join(out)

doc_parts = []
i = 0
while i < len(lines):
    st = lines[i].strip()
    if not st:
        i += 1
        continue
    if st.startswith("|") and i + 1 < len(lines) and is_table_sep(lines[i + 1]):
        rows = [cells(lines[i])]
        i += 2
        while i < len(lines) and lines[i].strip().startswith("|") and "|" in lines[i].strip()[1:]:
            rows.append(cells(lines[i]))
            i += 1
        doc_parts.append(table_xml(rows))
        continue
    if st.startswith("# "):
        doc_parts.append(p_xml(st[2:], "Title"))
    elif st.startswith("## "):
        doc_parts.append(p_xml(st[3:], "Heading1"))
    elif st.startswith("### "):
        doc_parts.append(p_xml(st[4:], "Heading2"))
    elif re.match(r"^\d+\.\s+", st):
        doc_parts.append(list_xml(re.sub(r"^\d+\.\s+", "", st), 2))
    elif st.startswith("- "):
        doc_parts.append(list_xml(st[2:], 1))
    else:
        doc_parts.append(p_xml(st))
    i += 1

document_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + "".join(doc_parts) + '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>'
styles_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:pPr><w:spacing w:after="120"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="34"/></w:rPr><w:pPr><w:spacing w:after="240"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:pPr><w:spacing w:before="360" w:after="160"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr></w:style></w:styles>'
numbering_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="*"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="2"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num></w:numbering>'
content_types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'
rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
doc_rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>'
core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>U.S. Real Estate JV Setup Project Plan</dc:title><dc:creator>OpenClaw</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">' + datetime.datetime.utcnow().isoformat() + 'Z</dcterms:created></cp:coreProperties>'
app = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>OpenClaw</Application></Properties>'

if docx_path.exists():
    docx_path.unlink()
with zipfile.ZipFile(docx_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/_rels/document.xml.rels", doc_rels)
    z.writestr("word/document.xml", document_xml)
    z.writestr("word/styles.xml", styles_xml)
    z.writestr("word/numbering.xml", numbering_xml)
    z.writestr("docProps/core.xml", core)
    z.writestr("docProps/app.xml", app)

print(html_path)
print(docx_path)
