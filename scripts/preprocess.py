import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / 'Dataset'
OUTPUT_DIR = Path(__file__).resolve().parent.parent / 'data'

OUTPUT_DIR.mkdir(exist_ok=True)

if __name__ == '__main__':
    print('Preprocessing placeholder script')
    # Load raw dataset files from Dataset/
    # Normalize transcripts, products, users, and brands into JSON artifacts
    # Save cleaned outputs to data/
    (OUTPUT_DIR / 'dashboard_data.json').write_text(json.dumps({'status': 'placeholder'}, indent=2))
