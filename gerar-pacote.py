#!/usr/bin/env python3
"""Gera a pasta deploy/ (e deploy.zip) só com os arquivos que o site usa.

Uso:  python3 gerar-pacote.py
Depois envie o CONTEÚDO de deploy/ (ou extraia deploy.zip) na pasta pública
da hospedagem (geralmente public_html/ ou www/).
"""
import json, os, re, shutil, zipfile

RAIZ = os.path.dirname(os.path.abspath(__file__))
DESTINO = os.path.join(RAIZ, "deploy")
SEMPRE = ["index.html", "style.css", "collapse.js", "robots.txt", "site.webmanifest", ".htaccess",
          "sitemap.xml", "imagens/og-image.jpg"]


def referencias():
    refs = set(SEMPRE)
    for nome in ["index.html", "style.css"]:
        texto = open(os.path.join(RAIZ, nome), encoding="utf-8").read()
        refs |= set(re.findall(r'(?:src|href)="([^"#:]+\.[a-z0-9]+)"', texto))
        refs |= set(re.findall(r'url\("([^"]+)"\)', texto))
        for lista in re.findall(r'(?:imagesrcset|srcset)="([^"]+)"', texto):
            refs |= {item.strip().split(" ")[0] for item in lista.split(",")}
    manifesto = json.load(open(os.path.join(RAIZ, "site.webmanifest"), encoding="utf-8"))
    refs |= {icone["src"] for icone in manifesto.get("icons", [])}
    return sorted(r for r in refs if not r.startswith(("http", "mailto", "tel")))


def main():
    shutil.rmtree(DESTINO, ignore_errors=True)
    faltando = []
    for ref in referencias():
        origem = os.path.join(RAIZ, ref)
        if not os.path.isfile(origem):
            if ref not in SEMPRE:
                faltando.append(ref)
            continue
        alvo = os.path.join(DESTINO, ref)
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        shutil.copy2(origem, alvo)

    zip_path = os.path.join(RAIZ, "deploy.zip")
    total = 0
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for pasta, _, arquivos in os.walk(DESTINO):
            for arq in sorted(arquivos):
                caminho = os.path.join(pasta, arq)
                total += os.path.getsize(caminho)
                z.write(caminho, os.path.relpath(caminho, DESTINO))

    print(f"Pacote pronto: deploy/ e deploy.zip ({total / 1024:.0f} KB)")
    if faltando:
        print("ATENÇÃO, arquivos referenciados que não existem:", *faltando, sep="\n  ")


if __name__ == "__main__":
    main()
