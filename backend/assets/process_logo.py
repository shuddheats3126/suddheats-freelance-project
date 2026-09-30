import sys
from rembg import remove
from PIL import Image

def main():
    input_path = "c:/Users/RANJIT PATRA/Downloads/SudhaEats-main/SudhaEats-main/frontend/public/images/logo-01.jpg"
    output_path = "c:/Users/RANJIT PATRA/Downloads/SudhaEats-main/SudhaEats-main/backend/assets/logo.png"

    print(f"Processing {input_path}...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path, "PNG")
        print(f"Successfully saved transparent logo to {output_path}")
    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

