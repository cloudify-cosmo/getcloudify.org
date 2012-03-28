#!/bin/sh

# This utility copies files and folders from the _site generated folder to the site tree.
# The following files will be copied:
# archives atom.xml blog
# The following folders will be copied:
# tags page* 2011 2012 etc... (all the posts paging related folders.

clear

EXCLUDED_DIRS="css downloads guide images scripts webfonts"

#INCLUDED_FILES=archives,atom.xml,blog

SRC=REPLACE_WITH_DOCS_ROOT_FOLDER/_site
DEST_FOLDER=REPLACE_WITH_DOCS_ROOT_FOLDER

# Deleting old files and folders
rm -rf ${DEST_FOLDER}/page*
rm -rf ${DEST_FOLDER}/tags
rm -rf ${DEST_FOLDER}/blog
rm -rf ${DEST_FOLDER}/20*

# rename ${DEST_FOLDER}/posts ${DEST_FOLDER}/_posts

aZero=0
#rem Go over folders and copy ONLY the relevant files and folders
for currFolder in `ls -l ${SRC} | grep "^d" | awk {'print $9'}`
 do
   folderExcluded=`echo ${EXCLUDED_DIRS} | grep -c "${currFolder}"`
   if [ $folderExcluded -eq $aZero ]; then
     # This folder is NOT excluded , so it will be copied
     echo "Copying ${SRC}/${currFolder} ${DEST_FOLDER}/${currFolder} ..."
     cp -rvf ${SRC}/${currFolder} ${DEST_FOLDER}/${currFolder}
     echo "Copied ${currFolder} folder"
     echo "---------------------"
   fi
done

echo "Copying archives ..."
cp ${SRC}/archives_raw ${DEST_FOLDER}/archives

echo "Copying atom.xml ..."
cp ${SRC}/atom_raw.xml ${DEST_FOLDER}/atom.xml

echo "Copying blog ..."
newBlogFolder=${DEST_FOLDER}/blog
if [ ! -d ${newBlogFolder} ]; then
  mkdir -p ${newBlogFolder}
fi

cp ${SRC}/blog_raw ${newBlogFolder}/index.html

echo ---------------------


mv ${DEST_FOLDER}/_posts ${DEST_FOLDER}/posts
mv ${DEST_FOLDER}/_plugins ${DEST_FOLDER}/plugins
cp -f ${SRC}/homepage ${DEST_FOLDER}/index.html



