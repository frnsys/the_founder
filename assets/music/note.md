wav to ogg conversion was performed with:

    ffmpeg -i audio.wav  -acodec libvorbis -qscale:a 5 audio.ogg

ogg was used because it doesn't have gaps (so we can have seamless loops). mp3s do have gaps.