"""
Full docx extractor - captures paragraphs AND tables in document order.
Outputs proper Markdown with tables formatted as pipe tables.
"""
import os
import sys
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

def table_to_markdown(table):
    """Convert a docx table to a Markdown pipe table."""
    rows = []
    for row in table.rows:
        cells = []
        for cell in row.cells:
            # Get all text from the cell, joining with space
            text = ' '.join(p.text.strip() for p in cell.paragraphs if p.text.strip())
            # Escape pipes in cell content
            text = text.replace('|', '\\|')
            cells.append(text)
        rows.append(cells)

    if not rows:
        return ''

    # Build markdown table
    lines = []
    # Header row
    lines.append('| ' + ' | '.join(rows[0]) + ' |')
    # Separator
    lines.append('| ' + ' | '.join(['---'] * len(rows[0])) + ' |')
    # Data rows
    for row in rows[1:]:
        # Pad row if needed
        while len(row) < len(rows[0]):
            row.append('')
        lines.append('| ' + ' | '.join(row) + ' |')

    return '\n'.join(lines)


def extract_document(docx_path, out_path):
    """Extract a .docx file to Markdown, preserving document order."""
    doc = Document(docx_path)
    
    # We iterate over the document body XML children to preserve order
    output_parts = []
    
    for child in doc.element.body:
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        
        if tag == 'p':
            # It's a paragraph - wrap it back to a Paragraph object
            from docx.text.paragraph import Paragraph
            para = Paragraph(child, doc)
            text = para.text.strip()
            if text:
                # Check heading style
                style_name = para.style.name if para.style else ''
                if 'Heading 1' in style_name:
                    output_parts.append(f'# {text}')
                elif 'Heading 2' in style_name:
                    output_parts.append(f'## {text}')
                elif 'Heading 3' in style_name:
                    output_parts.append(f'### {text}')
                elif 'Heading 4' in style_name:
                    output_parts.append(f'#### {text}')
                else:
                    output_parts.append(text)
        
        elif tag == 'tbl':
            # It's a table
            from docx.table import Table
            tbl = Table(child, doc)
            md_table = table_to_markdown(tbl)
            if md_table:
                output_parts.append('\n' + md_table + '\n')
    
    content = '\n'.join(output_parts)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Extracted: {os.path.basename(docx_path)} -> {os.path.basename(out_path)} ({len(output_parts)} elements)')


def main():
    policy_dir = r'C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\Policies'
    out_dir = os.path.join(policy_dir, 'extracted_full')
    os.makedirs(out_dir, exist_ok=True)
    
    docx_files = [f for f in os.listdir(policy_dir) if f.endswith('.docx')]
    
    for fname in sorted(docx_files):
        docx_path = os.path.join(policy_dir, fname)
        out_name = os.path.splitext(fname)[0] + '.md'
        out_path = os.path.join(out_dir, out_name)
        try:
            extract_document(docx_path, out_path)
        except Exception as e:
            print(f'ERROR extracting {fname}: {e}')


if __name__ == '__main__':
    main()
