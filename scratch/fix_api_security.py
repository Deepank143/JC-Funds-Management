import os
import re

api_root = r'd:\Projects\Funds managemet app\app\api'

# Patterns to replace (very flexible whitespace)
AUTH_CHECK_PATTERN = re.compile(
    r"const supabase = getServerClient\(\)\s*(as any)?\s*;\s+(// Auth check\s+)?const { data: { session } } = await supabase\.auth\.getSession\(\);\s+if \(!session\) (return NextResponse\.json\({ error: 'Unauthorized' }, { status: 401 }\);|{.*?return NextResponse\.json\({ error: 'Unauthorized' }, { status: 401 }\);.*?})",
    re.MULTILINE | re.DOTALL
)

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Add checkRole import if not present
    if 'import { checkRole }' not in content:
        if 'import { getServerClient }' in content:
            content = content.replace(
                'import { getServerClient } from \'@/lib/supabase\';',
                'import { getServerClient } from \'@/lib/supabase\';\nimport { checkRole } from \'@/lib/auth-utils\';'
            )
    
    # Determine roles
    is_get = 'export async function GET' in content
    roles = "['owner', 'accountant', 'viewer']" if is_get else "['owner', 'accountant']"
    
    replacement = f"const {{ error: authError, supabase, session }} = await checkRole({roles});\n    if (authError) return authError;"
    
    content = AUTH_CHECK_PATTERN.sub(replacement, content)
    
    # Fix 'as any' cases
    content = content.replace('as any', '')
    # Fix explicit types that might have been removed
    content = content.replace('const updateData:  = {};', 'const updateData: any = {};')
    # Remove double semicolons
    content = content.replace(';;', ';')
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

for root, dirs, files in os.walk(api_root):
    for file in files:
        if file == 'route.ts':
            path = os.path.join(root, file)
            try:
                if fix_file(path):
                    print(f"Fixed {path}")
            except Exception as e:
                print(f"Error fixing {path}: {e}")
