#!/usr/bin/env python3
"""
eBay RSS Feed Scraper for Azelaic Acid products
Uses eBay's RSS feeds which are publicly accessible
"""

import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import quote
import re

def scrape_ebay_rss(search_term, site='ebay.co.uk', max_results=200):
    """
    Scrape eBay using RSS feed
    eBay provides RSS feeds for searches which are easier to access
    """
    # eBay RSS URL format
    encoded_term = quote(search_term)

    # Different RSS feed formats to try
    rss_urls = [
        f"https://www.{site}/sch/i.html?_nkw={encoded_term}&_rss=1",
        f"https://www.{site}/sch/i.html?_nkw={encoded_term}&_rss=1&_ipg=200",
    ]

    all_items = []

    for rss_url in rss_urls:
        print(f"Trying RSS feed...")
        print(f"URL: {rss_url}\n")

        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        }

        try:
            response = requests.get(rss_url, headers=headers, timeout=15)

            if response.status_code == 200:
                # Parse RSS/XML
                soup = BeautifulSoup(response.content, 'xml')

                # Try to find items in RSS feed
                items = soup.find_all('item')

                if items:
                    print(f"✓ Found {len(items)} items in RSS feed")

                    for item in items[:max_results]:
                        title_elem = item.find('title')

                        if title_elem:
                            title = title_elem.get_text(strip=True)

                            # Get additional info if available
                            item_data = {'title': title}

                            # Try to get link
                            link_elem = item.find('link')
                            if link_elem:
                                item_data['link'] = link_elem.get_text(strip=True)

                            # Try to get description (usually contains price)
                            desc_elem = item.find('description')
                            if desc_elem:
                                desc = desc_elem.get_text(strip=True)
                                # Try to extract price
                                price_match = re.search(r'£[\d,]+\.?\d*', desc)
                                if price_match:
                                    item_data['price'] = price_match.group()

                            all_items.append(item_data)

                    break  # Success, no need to try other URLs

            else:
                print(f"Status: {response.status_code}")

        except Exception as e:
            print(f"Error with RSS feed: {e}")

    return all_items

def analyze_azelaic_spellings(items):
    """
    Analyze different spellings and tricks sellers use with 'azelaic acid'
    """
    print("\n" + "=" * 80)
    print("ANALYSIS: How sellers write 'Azelaic Acid'")
    print("=" * 80)

    # Define patterns to look for
    patterns = {
        'Standard': r'azelaic\s+acid',
        'With hyphen': r'azelaic-acid',
        'Split with dash': r'aze-laic\s+acid',
        'No space': r'azeliacid',
        'Misspelling 1': r'azaleic\s+acid',
        'Misspelling 2': r'azalaic\s+acid',
        'Misspelling 3': r'azelaic\s+ascid',
        'With %': r'azelaic.*\d+%',
        'Shortened': r'\baza\b',
    }

    results = {key: [] for key in patterns.keys()}
    results['Other'] = []

    for item in items:
        title_lower = item['title'].lower()
        found = False

        for pattern_name, pattern in patterns.items():
            if re.search(pattern, title_lower):
                results[pattern_name].append(item)
                found = True
                break

        if not found:
            results['Other'].append(item)

    # Print analysis
    for pattern_name, matching_items in results.items():
        if matching_items:
            print(f"\n{pattern_name}: {len(matching_items)} items")
            for item in matching_items[:5]:
                print(f"  • {item['title']}")
            if len(matching_items) > 5:
                print(f"  ... and {len(matching_items) - 5} more")

    return results

def main():
    print("=" * 80)
    print("eBay Azelaic Acid Analysis Tool")
    print("=" * 80)
    print()

    search_term = "azelaic acid"
    items = scrape_ebay_rss(search_term, site='ebay.co.uk', max_results=200)

    if not items:
        print("\n❌ Could not retrieve data from eBay RSS feed")
        print("\nAlternative: Manual data collection")
        print("-" * 80)
        print("You can manually collect titles by:")
        print("1. Visit: https://www.ebay.co.uk/sch/i.html?_nkw=azelaic+acid")
        print("2. Copy titles and paste them into a text file")
        print("3. Or use browser automation tools like Selenium/Playwright")
        return

    print(f"\n✓ Total items collected: {len(items)}")

    # Analyze the titles
    analysis = analyze_azelaic_spellings(items)

    # Save results
    output = {
        'search_term': search_term,
        'total_items': len(items),
        'items': items,
        'analysis_summary': {k: len(v) for k, v in analysis.items() if v}
    }

    with open('azelaic_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Save titles only
    with open('azelaic_titles.txt', 'w', encoding='utf-8') as f:
        for i, item in enumerate(items, 1):
            price = item.get('price', 'N/A')
            f.write(f"{i}. {item['title']} | {price}\n")

    print("\n" + "=" * 80)
    print("Files saved:")
    print("  📄 azelaic_analysis.json - Full data with analysis")
    print("  📄 azelaic_titles.txt - List of all titles")
    print("=" * 80)

if __name__ == "__main__":
    main()
