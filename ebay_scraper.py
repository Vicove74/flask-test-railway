#!/usr/bin/env python3
"""
eBay Title Scraper
Searches eBay and extracts product titles
"""

import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import quote

def scrape_ebay_titles(search_query, max_results=20):
    """
    Scrape product titles from eBay search results using eBay Finding API

    Args:
        search_query: The search term
        max_results: Maximum number of titles to retrieve

    Returns:
        List of product titles
    """
    print(f"Searching eBay for: {search_query}")

    # Using eBay Finding API (no auth required for basic searches)
    # This is more reliable than web scraping
    url = "https://svcs.ebay.com/services/search/FindingService/v1"

    params = {
        'OPERATION-NAME': 'findItemsByKeywords',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': 'test',  # For testing purposes
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': search_query,
        'paginationInput.entriesPerPage': min(max_results, 100),
        'sortOrder': 'BestMatch'
    }

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }

    try:
        # Make the request
        response = requests.get(url, params=params, headers=headers, timeout=15)
        response.raise_for_status()

        # Parse JSON response
        data = response.json()

        titles = []

        # Navigate the JSON structure
        if 'findItemsByKeywordsResponse' in data:
            search_result = data['findItemsByKeywordsResponse'][0]

            if 'searchResult' in search_result:
                items = search_result['searchResult'][0].get('item', [])

                for item in items[:max_results]:
                    title = item.get('title', [None])[0]
                    if title:
                        titles.append(title)

        return titles

    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        # Fallback to simple web scraping with better headers
        return scrape_ebay_web(search_query, max_results)
    except Exception as e:
        print(f"Error parsing API data: {e}")
        return scrape_ebay_web(search_query, max_results)

def scrape_ebay_web(search_query, max_results=20):
    """
    Fallback: Scrape eBay website directly
    """
    encoded_query = quote(search_query)
    url = f"https://www.ebay.com/sch/i.html?_nkw={encoded_query}"

    session = requests.Session()

    # More realistic headers
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
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
        response = session.get(url, headers=headers, timeout=15)

        if response.status_code == 403:
            print(f"Access forbidden (403) - eBay is blocking scraping attempts")
            return []

        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        titles = []

        # Try multiple selectors
        title_elements = soup.find_all('div', class_='s-item__title')

        for element in title_elements[:max_results]:
            title = element.get_text(strip=True)
            if title and title.lower() not in ['shop on ebay', 'new listing']:
                titles.append(title)

        return titles[:max_results]

    except Exception as e:
        print(f"Fallback scraping error: {e}")
        return []

def main():
    # Example searches
    search_terms = [
        "laptop",
        "iphone",
        "vintage watch"
    ]

    all_results = {}

    for search_term in search_terms:
        print("=" * 60)
        titles = scrape_ebay_titles(search_term, max_results=10)
        all_results[search_term] = titles

        print(f"Found {len(titles)} titles:\n")
        for i, title in enumerate(titles, 1):
            print(f"{i}. {title}")
        print("\n")

    # Save results to JSON file
    with open('ebay_titles.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print(f"Results saved to ebay_titles.json")

if __name__ == "__main__":
    main()
