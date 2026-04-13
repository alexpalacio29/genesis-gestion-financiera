import os

src_path = 'src/LandingPage.tsx'
with open(src_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The target block is around line 671 to 682 (1-indexed)
# Let's find it by identifying the unique start and end lines
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'h3 className="text-2xl font-black text-slate-900 leading-tight">Alexander Palacio Espiritusanto' in line:
        # Go back 1 line to catch the div
        start_idx = i - 1
        break

if start_idx != -1:
    # Find the end of the div that opens at line 677 (space-y-4)
    for j in range(start_idx, len(lines)):
        if '<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">' in lines[j]:
            end_idx = j
            break

if start_idx != -1 and end_idx != -1:
    new_content = [
        '                 <div className="text-center sm:text-left space-y-2">\n',
        '                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Alexander Palacio Espiritusanto</h3>\n',
        '                    <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Fundador de GestiFy RD</p>\n',
        '                 </div>\n',
        '              </div>\n',
        '\n',
        '              <div className="space-y-6">\n',
        '                 <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6">\n',
        '                    "Educador y gestor dominicano con más de 14 años de trayectoria, enfocado en modernizar la administración escolar. Actualmente subdirector administrativo en el Centro Educativo Cristiano Génesis, dedicado a la transformación digital y eficiencia institucional del sector educativo."\n',
        '                 </p>\n',
        '                 \n',
        '                 <div className="flex flex-wrap gap-x-6 gap-y-3 pl-6">\n',
        '                    {[\n',
        "                      'Lic. en Teología', \n",
        "                      'Máster en Gestión Educativa', \n",
        "                      'Especialista en Gestión de Proyectos'\n",
        '                    ].map((titulo, idx) => (\n',
        '                      <div key={idx} className="flex items-center gap-2">\n',
        '                         <CheckCircle className="w-4 h-4 text-emerald-500" />\n',
        '                         <span className="text-xs font-bold text-slate-700">{titulo}</span>\n',
        '                      </div>\n',
        '                    ))}\n',
        '                 </div>\n',
        '              </div>\n'
    ]
    
    # Replace the lines
    new_lines = lines[:start_idx] + new_content + lines[end_idx:]
    
    with open(src_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully updated the file.")
else:
    print(f"Failed to find the markers. Start: {start_idx}, End: {end_idx}")
