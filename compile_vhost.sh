#!/bin/sh

# create directory if not exists
[ -d gen/vhost ] || mkdir gen/vhost -p

grep -Porih "(?<=VHost.get\(('|\"))[^('|\")\)]*" src | # get VHost.get('...') and VHost.get("...") occurrencies in all the source code
sort -u | # sort them and remove duplicates
awk ' BEGIN { ORS = "\n"; print "//WARNING: THIS FILE IS AUTO-GENERATED, DO NOT MODIFY IT (use npm run vhost:keys to rebuild it)\nmodule.exports = ["; } { print "\t/@"$0"/@,"; } END { print "];"; }' | # format them as JSON
sed "s^\"^\\\\\"^g;s^\/\@\/\@^\", \"^g;s^\/\@^\"^g" > gen/vhost/vhost-keys.js

# now write all references to each VHost key within source code
# keeps track of file path and line number of each reference
grep -Porin "(?<=VHost.get\(('|\"))[^('|\")\)]*" src | # get VHost.get('...') and VHost.get("...") occurrencies in all the source code
sort > gen/vhost/vhost-keys-references.txt
