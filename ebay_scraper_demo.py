#!/usr/bin/env python3
"""
eBay Title Scraper - Demo Version with Sample Data
Since eBay requires API authentication, this demo shows how the scraper would work
"""

import json
import random
from datetime import datetime

def generate_sample_ebay_titles(search_query, max_results=20):
    """
    Generate realistic sample eBay product titles based on search query
    In production, this would actually scrape eBay with proper authentication
    """

    # Sample templates for different product categories
    templates = {
        'laptop': [
            'Dell Latitude E7470 14" Intel Core i5 6th Gen 8GB RAM 256GB SSD Windows 11',
            'HP EliteBook 840 G3 14" FHD Laptop Intel i7 8GB RAM 512GB SSD Windows Pro',
            'Lenovo ThinkPad T480 14" FHD i5-8250U 16GB RAM 256GB SSD Windows 10 Pro',
            'Apple MacBook Pro 13" 2019 Intel Core i5 8GB RAM 256GB SSD Space Gray',
            'ASUS VivoBook 15.6" FHD Laptop AMD Ryzen 5 8GB RAM 512GB SSD Windows 11',
            'Microsoft Surface Laptop 4 13.5" Touch Intel i5 8GB 256GB SSD Platinum',
            'Acer Aspire 5 15.6" FHD Laptop Intel Core i5 12GB RAM 512GB SSD',
            'MSI Gaming Laptop 15.6" FHD 144Hz Intel i7 16GB RAM 1TB SSD RTX 3060',
            'Lenovo IdeaPad 3 15.6" HD Laptop AMD Ryzen 5 8GB RAM 256GB SSD',
            'Dell XPS 13 9310 13.4" FHD+ Intel i7-1165G7 16GB RAM 512GB SSD'
        ],
        'iphone': [
            'Apple iPhone 14 Pro Max 256GB Deep Purple Unlocked Excellent Condition',
            'iPhone 13 128GB Blue Unlocked - Very Good Condition with Box',
            'Apple iPhone 12 Pro 256GB Pacific Blue AT&T Carrier Locked',
            'iPhone 11 64GB Black Unlocked - Good Condition Minor Scratches',
            'Apple iPhone SE 3rd Gen 128GB Midnight Unlocked Brand New Sealed',
            'iPhone XR 128GB White Verizon Network - Excellent Condition',
            'Apple iPhone 14 Plus 256GB Starlight Unlocked AppleCare+ Included',
            'iPhone 13 Pro 512GB Sierra Blue Unlocked Mint Condition',
            'Apple iPhone 12 Mini 64GB Green T-Mobile Very Good Battery Health',
            'iPhone 11 Pro Max 256GB Space Gray Unlocked Excellent Condition'
        ],
        'vintage watch': [
            'Vintage Seiko 5 Automatic Day-Date Watch 7009-3040 Running Condition',
            'Rare Omega Seamaster De Ville Vintage 1960s Automatic Gold Plated Watch',
            'Vintage Rolex Oyster Perpetual Date 1500 Automatic Stainless Steel 1970',
            'Timex Marlin Hand-Wind Vintage Style Watch 34mm Silver Dial',
            'Vintage Citizen Automatic Day-Date Watch 21 Jewels Working Condition',
            'Rare Bulova Accutron Spaceview Tuning Fork Watch Vintage 1970s',
            'Vintage Hamilton Electric Watch 1960s Gold Filled Case Working',
            'Seiko Lord Matic 5606-7000 Vintage Automatic Watch 1970s Japan',
            'Vintage Longines Conquest Automatic Calendar Watch Gold Cap 1960s',
            'Rare Zenith Automatic Vintage Watch Cal.2562PC Swiss Made 1960s'
        ]
    }

    # Find matching templates or use generic ones
    query_lower = search_query.lower()
    matching_titles = []

    for key, titles in templates.items():
        if key in query_lower:
            matching_titles = titles
            break

    # If no match, generate generic titles
    if not matching_titles:
        matching_titles = [
            f'{search_query.title()} Item #{i} - Brand New Sealed Fast Shipping'
            for i in range(1, 11)
        ]

    # Return requested number of results
    return matching_titles[:max_results]

def scrape_ebay_titles_with_auth(search_query, api_key=None, max_results=20):
    """
    This function would use actual eBay API with authentication
    For demo purposes, returns sample data

    To use real eBay API, you need:
    1. Register at https://developer.ebay.com/
    2. Get your App ID (Client ID)
    3. Use the Finding API or Browse API
    """

    if api_key:
        print(f"Using eBay API with key: {api_key[:10]}...")
        # Here would be actual API call
        pass
    else:
        print("No API key provided - using demo data")
        print("To get real data, register at: https://developer.ebay.com/")

    return generate_sample_ebay_titles(search_query, max_results)

def main():
    print("=" * 70)
    print("eBay Title Scraper - Demo Version")
    print("=" * 70)
    print()
    print("NOTE: eBay requires API authentication for real data.")
    print("This demo shows sample data to demonstrate functionality.")
    print("For production use, get API key from: https://developer.ebay.com/")
    print("=" * 70)
    print()

    # Example searches
    search_terms = [
        "laptop",
        "iphone",
        "vintage watch"
    ]

    all_results = {}

    for search_term in search_terms:
        print(f"\nSearching for: {search_term}")
        print("-" * 70)

        titles = scrape_ebay_titles_with_auth(search_term, api_key=None, max_results=10)
        all_results[search_term] = titles

        print(f"\nFound {len(titles)} titles:\n")
        for i, title in enumerate(titles, 1):
            print(f"{i:2d}. {title}")

        print()

    # Save results to JSON file
    output_file = 'ebay_titles_demo.json'

    output_data = {
        'timestamp': datetime.now().isoformat(),
        'note': 'Sample data - for real data use eBay API with authentication',
        'api_info': 'https://developer.ebay.com/',
        'results': all_results
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print("=" * 70)
    print(f"Results saved to: {output_file}")
    print("=" * 70)

if __name__ == "__main__":
    main()
