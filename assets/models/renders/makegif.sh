# create the png frames with blender, frames 0-23 (so there are 24 frames total)
echo "making gif..."
w=400
h=400
mogrify -resize 1188x648 -colorspace RGB *.png
mogrify -gravity center -crop ${w}x${h}+0+0 +repage -colorspace RGB *.png
#convert -delay 1x12 -layers Optimize -dispose previous -alpha set *.png _output.gif
convert -delay 1x12 -dispose previous *.png _output.gif
gifsicle --colors=256 -O3 _output.gif > output.gif
rm _output.gif