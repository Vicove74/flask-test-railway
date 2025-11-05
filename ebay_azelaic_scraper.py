#!/usr/bin/env python3
"""
eBay Azelaic Acid Title Scraper
Extracts product titles from eBay UK to analyze naming patterns
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urlparse, parse_qs, urlencode

def scrape_ebay_page(url, page_num=1):
    """
    Scrape a single page from eBay
    """
    # Add pagination to URL
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    params['_pgn'] = [str(page_num)]  # Page number

    # Reconstruct URL
    new_query = urlencode(params, doseq=True)
    page_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{new_query}"

    print(f"Scraping page {page_num}...")

    session = requests.Session()

    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
    }

    try:
        response = session.get(page_url, headers=headers, timeout=15)

        if response.status_code == 403:
            print(f"⚠️  Access forbidden (403)")
            return []

        if response.status_code != 200:
            print(f"⚠️  Status code: {response.status_code}")
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        titles = []

        # Try different selectors that eBay uses
        selectors = [
            ('div', 's-item__title'),
            ('h3', 's-item__title'),
            ('span', 's-item__title'),
        ]

        for tag, class_name in selectors:
            elements = soup.find_all(tag, class_=class_name)
            if elements:
                for elem in elements:
                    title = elem.get_text(strip=True)
                    # Skip eBay headers
                    if title and title.lower() not in ['shop on ebay', 'new listing', 'results matching fewer words']:
                        titles.append(title)
                break

        # Also try to get prices and conditions for analysis
        items_data = []
        item_containers = soup.find_all('div', class_='s-item__info')

        for i, container in enumerate(item_containers):
            if i >= len(titles):
                break

            item = {'title': titles[i]}

            # Try to get price
            price_elem = container.find('span', class_='s-item__price')
            if price_elem:
                item['price'] = price_elem.get_text(strip=True)

            # Try to get condition
            condition_elem = container.find('span', class_='SECONDARY_INFO')
            if condition_elem:
                item['condition'] = condition_elem.get_text(strip=True)

            items_data.append(item)

        if items_data:
            return items_data
        else:
            return [{'title': t} for t in titles]

    except Exception as e:
        print(f"Error scraping page {page_num}: {e}")
        return []

def analyze_titles(items):
    """
    Analyze how sellers write 'azelaic acid'
    """
    variations = {}

    for item in items:
        title = item['title'].lower()

        # Find different spellings
        patterns = [
            'azelaic acid',
            'azelaic-acid',
            'aze-laic acid',
            'aze laic acid',
            'azeliacid',
            'azaleic acid',
            'azalaic acid',
        ]

        for pattern in patterns:
            if pattern in title:
                if pattern not in variations:
                    variations[pattern] = []
                variations[pattern].append(item['title'])

    return variations

def main():
    url = "https://www.ebay.co.uk/sch/i.html?_nkw=azelaic+acid&_sacat=0&_from=R40&_trksid=p4624852.m570.l1311"

    print("=" * 80)
    print("eBay Azelaic Acid Title Scraper")
    print("=" * 80)
    print()

    all_items = []
    max_pages = 10  # Try to get ~500-600 titles (50-60 per page)

    for page in range(1, max_pages + 1):
        items = scrape_ebay_page(url, page)

        if not items:
            print(f"No more results at page {page}")
            break

        all_items.extend(items)
        print(f"  ✓ Found {len(items)} items (Total: {len(all_items)})")

        # Be polite - add small delay
        time.sleep(1)

    print()
    print("=" * 80)
    print(f"Total items collected: {len(all_items)}")
    print("=" * 80)
    print()

    # Analyze spelling variations
    print("Analyzing title variations...")
    variations = analyze_titles(all_items)

    print("\nSpelling variations found:")
    for pattern, examples in variations.items():
        print(f"\n'{pattern}' - {len(examples)} occurrences")
        for example in examples[:3]:  # Show first 3 examples
            print(f"  • {example}")
        if len(examples) > 3:
            print(f"  ... and {len(examples) - 3} more")

    # Save to JSON
    output = {
        'total_items': len(all_items),
        'items': all_items,
        'variations_analysis': {k: len(v) for k, v in variations.items()},
        'url': url
    }

    with open('azelaic_acid_titles.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Save just titles to text file
    with open('azelaic_acid_titles.txt', 'w', encoding='utf-8') as f:
        for i, item in enumerate(all_items, 1):
            f.write(f"{i}. {item['title']}\n")

    print("\n" + "=" * 80)
    print("Files saved:")
    print("  • azelaic_acid_titles.json (full data)")
    print("  • azelaic_acid_titles.txt (titles only)")
    print("=" * 80)

if __name__ == "__main__":
    main()
