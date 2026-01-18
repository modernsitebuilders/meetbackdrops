from PIL import Image

# 2-pack collage (1200x600)
img1 = Image.open('public/images/office-spaces/office-spaces-24.webp')
img2 = Image.open('public/images/wall-shelves-bright/wall-shelves-bright-28.webp')

img1 = img1.resize((600, 600))
img2 = img2.resize((600, 600))

collage = Image.new('RGB', (1200, 600))
collage.paste(img1, (0, 0))
collage.paste(img2, (600, 0))
collage.save('2-pack-bundle.jpg', quality=95)

# 3-pack collage (1200x800)
img3 = Image.open('public/images/libraries/library-17.webp')
img1 = img1.resize((600, 400))
img2 = img2.resize((600, 400))
img3 = img3.resize((600, 400))

collage3 = Image.new('RGB', (1200, 800))
collage3.paste(img1, (0, 0))
collage3.paste(img2, (600, 0))
collage3.paste(img3, (300, 400))
collage3.save('3-pack-bundle.jpg', quality=95)

print("Done! Created 2-pack-bundle.jpg and 3-pack-bundle.jpg")