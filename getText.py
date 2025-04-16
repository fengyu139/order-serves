import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

def extract_epub_text(epub_path):
    book = epub.read_epub(epub_path)
    text = ''
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            soup = BeautifulSoup(item.get_content(), 'html.parser')
            text += soup.get_text()
    return text

# 示例用法
text = extract_epub_text('/Users/test/Downloads/zjc.epub')
with open('myBook.txt', 'w', encoding='utf-8') as f:
    f.write(text)
