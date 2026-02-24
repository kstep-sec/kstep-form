import json
import re

with open('form.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Find action URL
action_match = re.search(r'action="([^"]+)"', html)
if action_match:
    print(f"Action URL: {action_match.group(1)}")

# 2. Extract FB_PUBLIC_LOAD_DATA_
# We look for: var FB_PUBLIC_LOAD_DATA_ = [...];</script>
script_match = re.search(r'var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);</script>', html, re.DOTALL)
if script_match:
    try:
        data_str = script_match.group(1)
        data = json.loads(data_str)
        # The form items are usually in data[1][1]
        items = data[1][1]
        print("\nForm Fields:")
        for item in items:
            title = item[1]
            desc = item[2]
            item_type = item[3]
            
            # questions are in item[4]
            if len(item) > 4 and item[4]:
                for q in item[4]:
                    entry_id = q[0]
                    # Choices if it's a multiple choice/radio/checkbox
                    choices = []
                    if len(q) > 1 and q[1]:
                        for c in q[1]:
                            choices.append(c[0])
                    # Check if required
                    is_required = False
                    if len(q) > 2:
                        is_required = bool(q[2])
                    
                    print(f"- {title} (Type: {item_type}, Required: {is_required}, Entry ID: entry.{entry_id})")
                    if choices:
                        print(f"  Choices: {choices}")
            else:
                print(f"--- SECTION/TEXT: {title}")
                
    except Exception as e:
        print("Error parsing JSON:", e)
else:
    print("FB_PUBLIC_LOAD_DATA_ not found")
