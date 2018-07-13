## Quick start

1. Create a folder, fill it with photos. Name the photos with format M_2000-01_label.jpg, where the first letter represents the person on the photo, 2000-01 is the year and month of the photo used for sorting.

2. Convert the pictures to have the same dimensions. This is a shortcut to make a list of pictures with corresponding dimensions:

```
for i in `ls | grep .jpg`; do echo -n "$i"; identify -format ",%w,%h\n" $i; done
```

2. Use the node project https://github.com/mirelon/imageing_tools/. Drag and drop the photo to the wrapper frame in browser. Then, by mouse dragging, select a rectangle (aspect ratio 4x3 is automatically applied). Then, a text appears and is automatically copied to clipboard. It is something like this:

```
ffmpeg -loop 1 -i "2018-05_sip.jpg" -vf "scale=20000:-1,zoompan=z='1.743*150/(150*if(lt(((on-50)/150),0),0,if(gt(((on-50)/150),1),1,1/(1+exp(8-16*((on-50)/150)))))*(1.743-1)+150)':x='7505*(150-150*if(lt(((on-50)/150),0),0,if(gt(((on-50)/150),1),1,1/(1+exp(8-16*((on-50)/150))))))/150':y='2268*(150-150*if(lt(((on-50)/150),0),0,if(gt(((on-50)/150),1),1,1/(1+exp(8-16*((on-50)/150))))))/150':d=200" -c:v libx264 -t 10 /home/miso/svadba/prezentacia/2018-05_sip.jpg_zoomout.mp4
```

3. Create an order of those clips. Use the spreadsheet, e.g. https://docs.google.com/spreadsheets/d/150nTiaouk_xDD5eso7cMM8L9KmDZbUeFloo_mZ3uxns/edit#gid=1468093748. An essential formula to create clips named from "001.mp4" is this:

```
=CONCATENATE("cp ", A67,"_zoomout.mp4 temp/", TEXT(E67, "000"), MID(D67,9,1), ".mp4")
```

4. Install ffmpeg-concat and prepare files transition_left.json and transition_right.json:

```
[
  {
    "name": "directional",
    "duration": 500,
    "params": {"direction": [-1,0]} // or [1,0]
  }
]
```

5. Run this ruby script:

```
files = Dir["*.mp4"]
  .select{|f| f.length == 8}
  .map{|f| f[0,4]}
  .sort
  .map do |file|
  {
    first: file,
    last: file,
    name: "#{file}.mp4"
  }
end

puts files

while files.size > 1
  puts
  puts files.size
  puts
  files = files.each_slice(2).map do |a,b|
    if b.nil?
      a
    else
      transition = (b[:first][3] == 'L' ? 'transitions_right.json' : 'transitions_left.json')
      newname = "#{a[:first]}-#{b[:last]}.mp4"
      puts "Join #{a[:name]} with #{b[:name]} transition #{transition}"
      if File.file?(newname)
        puts "Already joined."
      else
        command = "node_modules/.bin/ffmpeg-concat -T #{transition} -d 750 -o #{newname} #{a[:name]} #{b[:name]}"
        system(command)
      end
      {
        name: newname,
        first: a[:first],
        last: b[:last]
      }
    end
  end
end
 ```
