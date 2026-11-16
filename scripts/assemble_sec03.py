import subprocess

head_content = subprocess.run(['git', 'show', 'HEAD:components/public/SectionTheLongView.tsx'], capture_output=True, text=True).stdout

# Find desktop SVG block in HEAD
marker_start = '<div className="w-full relative mt-4 overflow-x-auto pb-4">'
idx_svg = head_content.find(marker_start)
desktop_svg = head_content[idx_svg:].replace(marker_start, '<div className="hidden lg:block w-full relative mt-4 overflow-x-auto pb-4">')

# Read current file
with open('components/public/SectionTheLongView.tsx', 'r', encoding='utf-8') as f:
    cur = f.read()

# Find mobile trail block
mobile_marker = 'MOBILE VERTICAL ROUTE TRAIL (Below 1024px)'
idx_mobile = cur.find(mobile_marker)
idx_mobile_start = cur.rfind('{/*', 0, idx_mobile)

desktop_marker = 'DESKTOP HORIZONTAL ROUTE DIAGRAM'
idx_desktop = cur.find(desktop_marker)
idx_desktop_start = cur.rfind('{/*', 0, idx_desktop)

mobile_block = cur[idx_mobile_start:idx_desktop_start]

# Header from HEAD
head_header = head_content[:idx_svg]
head_header = head_header.replace(
    'className="w-full max-w-[1366px] mx-auto px-4 sm:px-8 lg:pl-[82px] lg:pr-[72px] pt-[111px] pb-[88px] relative z-10"',
    'className="w-full max-w-[1366px] mx-auto px-4 sm:px-8 lg:pl-[82px] lg:pr-[72px] pt-14 lg:pt-[111px] pb-14 lg:pb-[88px] relative z-10"'
)

full_code = head_header + mobile_block + desktop_svg

with open('components/public/SectionTheLongView.tsx', 'w', encoding='utf-8') as f:
    f.write(full_code)

print('Updated SectionTheLongView.tsx cleanly!')
