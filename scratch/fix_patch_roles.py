import os

def fix_patch_roles(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'export async function PATCH' in content:
        parts = content.split('export async function PATCH')
        # Fix the second part (after PATCH)
        parts[1] = parts[1].replace("['owner', 'accountant', 'viewer']", "['owner', 'accountant']")
        content = 'export async function PATCH'.join(parts)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

files = [
    r'd:\Projects\Funds managemet app\app\api\vendors\[id]\route.ts',
    r'd:\Projects\Funds managemet app\app\api\clients\[id]\route.ts'
]

for f in files:
    if fix_patch_roles(f):
        print(f"Fixed {f}")
