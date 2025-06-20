import http.server
import socketserver
import webbrowser
import threading
import os
import sys
import socket

# Porta padrão do servidor
PORT = 8081

# Corrigir caminho ao rodar como executável
if getattr(sys, 'frozen', False):
    DIRECTORY = os.path.join(sys._MEIPASS)
else:
    DIRECTORY = os.path.abspath(os.path.dirname(__file__))

html_file = os.path.join(DIRECTORY, "INVIOKM.html")
if not os.path.exists(html_file):
    print("[ERRO] Arquivo 'INVIOKM.html' não encontrado.")
    print(f"🔎 Verifique se os arquivos estão no diretório: {DIRECTORY}")
    sys.exit(1)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def abrir_browser(porta):
    try:
        webbrowser.open(f'http://localhost:{porta}/INVIOKM.html')
    except Exception as e:
        print(f"[ERRO] Não foi possível abrir o navegador: {e}")

def iniciar_servidor():
    global PORT
    for tentativa in range(5):
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                print(f"✅ Servidor rodando em http://localhost:{PORT}")
                threading.Timer(1.0, abrir_browser, args=(PORT,)).start()
                httpd.serve_forever()
                break
        except OSError as e:
            if e.errno in (98, 10048):  # Porta em uso
                print(f"[AVISO] Porta {PORT} em uso. Tentando próxima...")
                PORT += 1
            else:
                print(f"[ERRO] Falha ao iniciar o servidor: {e}")
                sys.exit(1)
        except Exception as e:
            print(f"[ERRO] Erro inesperado: {e}")
            sys.exit(1)

if __name__ == "__main__":
    try:
        iniciar_servidor()
    except KeyboardInterrupt:
        print("\n🛑 Servidor encerrado.")
    except Exception as e:
        print(f"[FATAL] Erro ao iniciar o sistema: {e}")
        sys.exit(1)