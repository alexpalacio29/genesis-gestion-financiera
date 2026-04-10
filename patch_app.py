import sys

path = 'src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

new_lines = []
found = False
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'value={voucherFormData.supplier_rnc_cedula}' in line and 'input' in line and not found:
        # We are at the input line. We need to find the next </div></div>
        # Looking ahead
        for j in range(i+1, min(i+5, len(lines))):
            if '</div>' in lines[j]:
                pass # close of input container
            if '</div>' in lines[j] and '</div>' in lines[j+1]:
                # Found the end of the grid
                addition = """
                {editingVoucherId && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-rose-600">Número de NCF (Modo Edición)</label>
                    <input required className="w-full p-3 border border-rose-200 rounded-xl bg-rose-50 outline-none focus:border-rose-500 font-black text-rose-700" value={voucherFormData.ncf} onChange={e => setVoucherFormData({...voucherFormData, ncf: e.target.value})} />
                  </div>
                )}
"""
                # Insert after the grid closing div
                # lines[j+1] is the </div> that closes the grid
                found = True
                break

if found:
    # Actually, let's just use string replacement on the whole content for simplicity
    content = "".join(lines)
    # Target closing of the supplier grid
    # It looks like:
    #                   <input required ... value={voucherFormData.supplier_rnc_cedula} ... />
    #                 </div>
    #               </div>
    
    # Let's find the input line and then the two following </div>s
    import re
    match = re.search(r'(<input[^>]+value=\{voucherFormData\.supplier_rnc_cedula\}[^>]*/>\s*</div>\s*</div>)', content)
    if match:
        target = match.group(1)
        replacement = target + addition
        new_content = content.replace(target, replacement, 1)
        with open(path, 'w') as f:
            f.write(new_content)
        print("Success")
    else:
        print("Regex match failed")
        sys.exit(1)
else:
    print("Initial check failed")
    sys.exit(1)
