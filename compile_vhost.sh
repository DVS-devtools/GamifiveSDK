#!/bin/sh

# create directory if not exists
[ -d gen/vhost ] || mkdir gen/vhost -p

grep -Porih "(?<=VHost.get\(('|\"))[^('|\")\)]*" src | # get VHost.get('...') occurrencies in all the code
sort -u | # sort them and remove duplicates
awk ' BEGIN { ORS = "\n"; print "//WARNING: THIS FILE IS AUTO-GENERATED, DO NOT MODIFY IT (use npm run vhost:keys to rebuild it)\nmodule.exports = ["; } { print "\t/@"$0"/@,"; } END { print "];"; }' | # format them as JSON
sed "s^\"^\\\\\"^g;s^\/\@\/\@^\", \"^g;s^\/\@^\"^g" > gen/vhost/vhost-keys.js