import os

src_path = 'src/LandingPage.tsx'
with open(src_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target block
old_block = """                  <a href="https://wa.me/18294108036" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><MessageCircle className="w-5 h-5" /></a>
                  <a href="https://www.youtube.com/playlist?list=PLT_0ZdzVRrXiICIwZXNX2BSPaizDJmTqA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"><Youtube className="w-5 h-5" /></a>"""

new_block = """                  <a href="https://wa.me/18294108036" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><MessageCircle className="w-5 h-5" /></a>
                  <a href="https://www.instagram.com/gestifyrd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all cursor-pointer"><Instagram className="w-5 h-5" /></a>
                  <a href="https://www.youtube.com/playlist?list=PLT_0ZdzVRrXiICIwZXNX2BSPaizDJmTqA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"><Youtube className="w-5 h-5" /></a>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(src_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated the file with Instagram link.")
else:
    print("Could not find the target block.")
