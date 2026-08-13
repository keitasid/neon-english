import zlib
import struct
import os

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])

    compressed = zlib.compress(bytes(raw_data), 9)

    def chunk(chunk_type, data):
        length = len(data)
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I', length) + chunk_type + data + struct.pack('>I', crc)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    
    png_bytes = header + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png_bytes)

def draw_neon_icon(x, y, w, h):
    # Carbon background #0B0D0C
    bg_r, bg_g, bg_b = 11, 13, 12
    
    # Distance from center for radial glow
    cx, cy = w / 2.0, h / 2.0
    dist = ((x - cx)**2 + (y - cy)**2)**0.5
    max_r = w * 0.45
    
    # Rounded rect logo box in center
    box_margin = w * 0.22
    in_box = (box_margin <= x <= w - box_margin) and (box_margin <= y <= h - box_margin)
    
    if in_box:
        # Emerald gradient #00A878 to #00D99A
        t = (x - box_margin) / (w - 2 * box_margin)
        r = int(0 + (0 - 0) * t)
        g = int(168 + (217 - 168) * t)
        b = int(120 + (154 - 120) * t)
        
        # Draw "N" letter cut-out in center box
        rel_x = (x - box_margin) / (w - 2 * box_margin)
        rel_y = (y - box_margin) / (h - 2 * box_margin)
        
        is_stem_left = (0.22 <= rel_x <= 0.38) and (0.20 <= rel_y <= 0.80)
        is_stem_right = (0.62 <= rel_x <= 0.78) and (0.20 <= rel_y <= 0.80)
        
        # Diagonal stroke
        diag_x = rel_x - 0.25
        diag_y = rel_y - 0.20
        is_diag = (0.0 <= diag_x <= 0.50) and (abs(diag_y - (diag_x * 1.2)) <= 0.12)
        
        if is_stem_left or is_stem_right or is_diag:
            # Off-white letter #F1F3F1
            r, g, b = 241, 243, 241
        return r, g, b, 255
    else:
        # Glow background
        glow = max(0.0, 1.0 - (dist / max_r))
        glow_r = int(bg_r + (0 - bg_r) * glow * 0.4)
        glow_g = int(bg_g + (217 - bg_g) * glow * 0.4)
        glow_b = int(bg_b + (154 - bg_b) * glow * 0.4)
        return glow_r, glow_g, glow_b, 255

os.makedirs("icons", exist_ok=True)
create_png(180, 180, draw_neon_icon, "icons/apple-touch-icon.png")
create_png(192, 192, draw_neon_icon, "icons/icon-192.png")
create_png(512, 512, draw_neon_icon, "icons/icon-512.png")
print("PNG icons created successfully!")
