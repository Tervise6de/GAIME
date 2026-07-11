# Assemble media/gif_frames/*.png into media/hivemind.gif with Pillow
# (no ffmpeg in this environment). Downscales to 640x360 and quantizes with
# a shared adaptive palette so the glow fields don't flicker between frames.
# Usage: python3 tools/make_gif.py [frame_ms]
import glob
import sys

from PIL import Image

frame_ms = int(sys.argv[1]) if len(sys.argv) > 1 else 110
paths = sorted(glob.glob("media/gif_frames/f*.png"))
if not paths:
    sys.exit("no frames in media/gif_frames/ — run tools/make_gif.mjs first")

frames = [Image.open(p).convert("RGB").resize((640, 360), Image.LANCZOS) for p in paths]
# one palette for all frames: quantize the rest against the first frame's
# adaptive palette to avoid per-frame palette pops
base = frames[0].quantize(colors=256, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
quantized = [base] + [f.quantize(palette=base, dither=Image.FLOYDSTEINBERG) for f in frames[1:]]
quantized[0].save(
    "media/hivemind.gif",
    save_all=True,
    append_images=quantized[1:],
    duration=frame_ms,
    loop=0,
    optimize=True,
)
import os

print(f"media/hivemind.gif: {len(frames)} frames, {os.path.getsize('media/hivemind.gif') / 1e6:.1f}MB")
