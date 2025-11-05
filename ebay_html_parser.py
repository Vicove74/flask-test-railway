#!/usr/bin/env python3
"""
eBay HTML Parser - Offline version
Parse eBay HTML saved from browser to extract titles

Usage:
1. Go to https://www.ebay.co.uk/sch/i.html?_nkw=azelaic+acid
2. Right-click -> Save Page As -> save as 'ebay_page.html'
3. Run this script: python ebay_html_parser.py ebay_page.html
"""

import sys
from bs4 import BeautifulSoup
import json
import re
from pathlib import Path

def parse_ebay_html(html_content):
    """
    Parse eBay HTML and extract product titles
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    items = []

    # Different selectors eBay uses
    selectors_to_try = [
        ('div', 's-item__title'),
        ('h3', 's-item__title'),
        ('span', 'BOLD'),
    ]

    for tag, class_name in selectors_to_try:
        title_elements = soup.find_all(tag, class_=class_name)

        if title_elements:
            print(f"✓ Found {len(title_elements)} titles using {tag}.{class_name}")

            for elem in title_elements:
                title = elem.get_text(strip=True)

                # Skip eBay system messages
                skip_terms = ['shop on ebay', 'new listing', 'results matching fewer words']
                if title and title.lower() not in skip_terms:
                    items.append({'title': title})

            if items:
                break

    # Try to enrich with prices
    price_elements = soup.find_all('span', class_='s-item__price')

    for i, price_elem in enumerate(price_elements):
        if i < len(items):
            items[i]['price'] = price_elem.get_text(strip=True)

    return items

def analyze_spellings(items):
    """
    Analyze how 'azelaic acid' is written
    """
    patterns = {
        'Correct spelling': r'azelaic\s+acid(?!\w)',
        'With hyphen': r'azelaic-acid',
        'Broken "aze-laic"': r'aze-laic',
        'No space': r'azeliacid',
        'Typo: azaleic': r'azaleic',
        'Typo: azalaic': r'azalaic',
        'With percentage': r'azelaic.*?\d+\s*%',
        'Abbreviated AZA': r'\baza\b',
    }

    results = {key: [] for key in patterns.keys()}

    for item in items:
        title_lower = item['title'].lower()

        for pattern_name, pattern in patterns.items():
            if re.search(pattern, title_lower, re.IGNORECASE):
                results[pattern_name].append(item)

    return results

def create_sample_data():
    """
    Create sample eBay data for demonstration
    """
    sample_titles = [
        "The Ordinary Azelaic Acid Suspension 10% 30ml - Brightening Serum",
        "Paula's Choice 10% Azelaic Acid Booster Face Serum 30ml",
        "Azelaic-Acid 20% Cream Melazepam Skincare Treatment 50ml",
        "The Inkey List 10% Azelaic Acid Serum 30ml NEW SEALED",
        "Cos De BAHA Azelaic Acid 10% Serum (AZ) 30ml - Rosacea Acne Treatment",
        "Facetheory Lumizela A15 Serum - 15% Aze-laic Acid Complex",
        "Garden of Wisdom Azelaic Acid 8% Serum 30ml Vegan Cruelty Free",
        "Geek & Gorgeous aPAD Serumazelaic-acid derivative 30ml",
        "Medik8 Blemish Control Pads AzeliacAcid & Salicylic Acid 60 Pads",
        "Naturium Azelaic Acid Topical 10% Plus Niacinamide 30ml",
        "Revolution Skincare Blemish Targeting Treatment AzaleicAcid 30ml",
        "SOME BY MI AHA BHA PHA 30% Days Miracle Serum with Aza-laic Acid",
        "Azalaic Acid 20% Treatment Cream For Acne Rosacea 50ml",
        "Makeup Revolution 10% Azelaic Acid Super Serum Face Treatment 30ml",
        "Boots Ingredients Azelaic Acid 10% Brightening Face Serum 30ml",
        "Sesderma Azelac RU Liposomal Depigmenting Gel 50ml Azelaic Acid Complex",
        "The INKEY List SuperSolutions 10% Azelaic Acid Serum 30ml",
        "La Roche-Posay Effaclar Serum with Niacinamide & Aze Acid 30ml",
        "Paula's Choice BOOST 10% Azelaic Acid Booster Travel Size 15ml",
        "CeraVe Resurfacing Retinol Serum with Niacinamide + AZA 30ml"
    ]

    items = []
    for i, title in enumerate(sample_titles):
        price = f"£{10 + i * 2}.99"
        items.append({'title': title, 'price': price})

    return items

def main():
    print("=" * 80)
    print("eBay Azelaic Acid Title Analyzer")
    print("=" * 80)
    print()

    # Check if HTML file is provided
    if len(sys.argv) > 1:
        html_file = Path(sys.argv[1])

        if html_file.exists():
            print(f"Reading HTML from: {html_file}")
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()

            items = parse_ebay_html(html_content)
            print(f"✓ Extracted {len(items)} items from HTML")
        else:
            print(f"❌ File not found: {html_file}")
            print("\nUsing sample data instead...")
            items = create_sample_data()
    else:
        print("No HTML file provided.")
        print("\nTo use real data:")
        print("1. Visit: https://www.ebay.co.uk/sch/i.html?_nkw=azelaic+acid")
        print("2. Right-click -> View Page Source -> Copy all")
        print("3. Paste into a file called 'ebay_page.html'")
        print("4. Run: python ebay_html_parser.py ebay_page.html")
        print("\nUsing sample data for demonstration...")
        items = create_sample_data()

    if not items:
        print("❌ No items found")
        return

    print("\n" + "=" * 80)
    print(f"ANALYZING {len(items)} TITLES")
    print("=" * 80)

    # Analyze spellings
    analysis = analyze_spellings(items)

    print("\n📊 Spelling Patterns Found:\n")

    for pattern_name, matching_items in analysis.items():
        if matching_items:
            print(f"\n{pattern_name}: {len(matching_items)} items")
            print("-" * 80)
            for item in matching_items[:3]:
                price = item.get('price', 'N/A')
                print(f"  • {item['title']}")
                print(f"    Price: {price}")
            if len(matching_items) > 3:
                print(f"  ... and {len(matching_items) - 3} more")

    # Calculate statistics
    total = len(items)
    correct = len(analysis['Correct spelling'])
    incorrect = total - correct

    print("\n" + "=" * 80)
    print("SUMMARY STATISTICS")
    print("=" * 80)
    print(f"Total items analyzed: {total}")
    print(f"Correct spelling 'azelaic acid': {correct} ({correct/total*100:.1f}%)")
    print(f"Alternative spellings/formats: {incorrect} ({incorrect/total*100:.1f}%)")

    # Save results
    output = {
        'total_items': len(items),
        'items': items,
        'analysis': {k: [item['title'] for item in v] for k, v in analysis.items() if v},
        'summary': {
            'total': total,
            'correct_spelling': correct,
            'alternative_spellings': incorrect
        }
    }

    json_file = 'azelaic_analysis.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    txt_file = 'azelaic_titles.txt'
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write("AZELAIC ACID PRODUCT TITLES FROM EBAY\n")
        f.write("=" * 80 + "\n\n")
        for i, item in enumerate(items, 1):
            price = item.get('price', 'N/A')
            f.write(f"{i}. {item['title']}\n")
            f.write(f"   Price: {price}\n\n")

    print(f"\n✓ Saved {json_file}")
    print(f"✓ Saved {txt_file}")
    print("=" * 80)

if __name__ == "__main__":
    main()
