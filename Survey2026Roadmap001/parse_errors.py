import re
import sys

try:
    with open('test_out.html', encoding='utf-16le') as f:
        html = f.read()
except UnicodeDecodeError:
    with open('test_out.html', encoding='utf-8', errors='ignore') as f:
        html = f.read()

# Google forms returns errors in divs often with specific data attributes or classes like 'error' or indicates which field failed.
# Usually, fields that fail validation have "aria-disabled" or missing.
# Let's just find the text "필수 질문입니다" (This is a required question) or similar error strings.
errors = re.findall(r'<span class="[^"]*error[^"]*".*?>(.*?)</span>', html, re.IGNORECASE)
print(f"Errors found: {errors}")

# Find any labels for items that might be marked an error
# Usually the form sends back the HTML and sets 'data-error-message'
data_errors = re.findall(r'data-error-message="([^"]+)"', html)
print(f"Data error messages: {set(data_errors)}")

if not data_errors and not errors:
    print("No obvious error texts found. Let's dump a snippet.")
