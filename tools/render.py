import pymupdf, sys
from PIL import Image
import io
src=sys.argv[1]; out=sys.argv[2]
d=pymupdf.open(src)
for idx in range(2,len(d)):
    p=idx+1
    pix=d[idx].get_pixmap(dpi=150)
    im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
    im.save(f'{out}/p{p:03d}.webp',quality=78,method=6)
