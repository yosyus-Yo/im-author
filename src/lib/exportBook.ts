import jsPDF from 'jspdf'
import JSZip from 'jszip'
import type { StoredBook } from './bookStorage'

function buildMarkdown(book: StoredBook): string {
  const lines: string[] = []
  lines.push(`# ${book.title}`)
  if (book.subtitle) lines.push(`## ${book.subtitle}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const chapter of book.chapters || []) {
    lines.push(`## ${chapter.chapterNumber}장: ${chapter.title}`)
    lines.push('')
    lines.push(chapter.content)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function slugify(text: string): string {
  return text.replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '').toLowerCase() || 'book'
}

export function exportAsMarkdown(book: StoredBook) {
  const markdown = buildMarkdown(book)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, `${slugify(book.title)}.md`)
}

export function exportAsPDF(book: StoredBook) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const addPage = () => {
    doc.addPage()
    y = margin
  }

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      addPage()
    }
  }

  // 표지
  doc.setFontSize(24)
  const titleLines = doc.splitTextToSize(book.title, contentWidth)
  const titleY = pageHeight / 3
  doc.text(titleLines, pageWidth / 2, titleY, { align: 'center' })

  if (book.subtitle) {
    doc.setFontSize(14)
    doc.text(book.subtitle, pageWidth / 2, titleY + 20, { align: 'center' })
  }

  doc.setFontSize(11)
  doc.text('AI Book Agent', pageWidth / 2, pageHeight - 30, { align: 'center' })

  // 챕터들
  for (const chapter of book.chapters || []) {
    addPage()

    // 챕터 제목
    doc.setFontSize(16)
    checkPageBreak(15)
    const chapterTitle = `${chapter.chapterNumber}장: ${chapter.title}`
    doc.text(chapterTitle, margin, y)
    y += 12

    // 본문
    doc.setFontSize(10)
    const paragraphs = chapter.content.split('\n').filter((line) => line.trim())

    for (const paragraph of paragraphs) {
      if (paragraph.startsWith('##')) {
        checkPageBreak(12)
        doc.setFontSize(12)
        doc.text(paragraph.replace(/^#+\s*/, ''), margin, y)
        y += 8
        doc.setFontSize(10)
        continue
      }

      const textLines = doc.splitTextToSize(paragraph, contentWidth)
      const blockHeight = textLines.length * 5

      checkPageBreak(blockHeight + 4)
      doc.text(textLines, margin, y)
      y += blockHeight + 4
    }
  }

  doc.save(`${slugify(book.title)}.pdf`)
}

export async function exportAsEPUB(book: StoredBook) {
  const zip = new JSZip()
  const bookId = `urn:uuid:${book.id}`

  // mimetype (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })

  // META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  )

  const chapters = book.chapters || []

  // content.opf
  const manifestItems = chapters
    .map((_, i) => `    <item id="ch${i + 1}" href="ch${i + 1}.xhtml" media-type="application/xhtml+xml"/>`)
    .join('\n')
  const spineItems = chapters.map((_, i) => `    <itemref idref="ch${i + 1}"/>`).join('\n')

  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    <dc:language>ko</dc:language>
    <dc:creator>AI Book Agent</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`,
  )

  // nav.xhtml (목차)
  const navItems = chapters
    .map((ch, i) => `      <li><a href="ch${i + 1}.xhtml">${escapeXml(`${ch.chapterNumber}장: ${ch.title}`)}</a></li>`)
    .join('\n')

  zip.file(
    'OEBPS/nav.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${escapeXml(book.title)}</title><link rel="stylesheet" href="style.css"/></head>
<body>
  <nav epub:type="toc">
    <h1>목차</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`,
  )

  // style.css
  zip.file(
    'OEBPS/style.css',
    `body { font-family: serif; line-height: 1.8; margin: 1em; color: #1c1917; }
h1 { font-size: 1.6em; margin-bottom: 0.5em; }
h2 { font-size: 1.3em; margin-top: 1.5em; margin-bottom: 0.5em; }
p { margin-bottom: 0.8em; text-indent: 1em; }`,
  )

  // 챕터 파일들
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i]
    const contentHtml = markdownToSimpleHtml(ch.content)

    zip.file(
      `OEBPS/ch${i + 1}.xhtml`,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(ch.title)}</title><link rel="stylesheet" href="style.css"/></head>
<body>
  <h1>${escapeXml(`${ch.chapterNumber}장: ${ch.title}`)}</h1>
${contentHtml}
</body>
</html>`,
    )
  }

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' })
  downloadBlob(blob, `${slugify(book.title)}.epub`)
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function markdownToSimpleHtml(md: string): string {
  return md
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('### ')) return `  <h2>${escapeXml(trimmed.slice(4))}</h2>`
      if (trimmed.startsWith('## ')) return `  <h2>${escapeXml(trimmed.slice(3))}</h2>`
      if (trimmed.startsWith('# ')) return `  <h1>${escapeXml(trimmed.slice(2))}</h1>`
      return `  <p>${escapeXml(trimmed).replace(/\n/g, '<br/>')}</p>`
    })
    .filter(Boolean)
    .join('\n')
}
