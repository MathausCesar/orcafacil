from collections import Counter
import sys

# Minimal implementation to find dominant colors without heavy dependencies if possible
# But usually we need PIL. Let's try to see if PIL is installed.
try:
    from PIL import Image
except ImportError:
    print("PIL not installed")
    sys.exit(1)

def get_dominant_colors(image_path, num_colors=5):
    try:
        image = Image.open(image_path)
        image = image.convert('RGB')
        image = image.resize((150, 150))      # Reduce size for speed
        
        pixels = list(image.getdata())
        counts = Counter(pixels)
        common = counts.most_common(num_colors)
        
        print(f"Dominant colors for {image_path}:")
        for color, count in common:
            print(f"RGB: {color} - Hex: #{color[0]:02x}{color[1]:02x}{color[2]:02x}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_dominant_colors(sys.argv[1])
    else:
        print("Usage: python analyze_colors.py <image_path>")
