@echo off

@rem This utility copies files and folders from the _site generated folder to the site tree.
@rem The following files will be copied:
@rem archives atom.xml blog
@rem The following folders will be copied:
@rem tags page* 2011 2012 etc... (all the posts paging related folders.


set EXCLUDED_DIRS="css downloads guide images scripts webfonts"

set INCLUDED_FILES=archives,atom.xml,blog

set SRC=REPLACE_WITH_DOCS_ROOT_FOLDER\_site
set DEST_FOLDER=REPLACE_WITH_DOCS_ROOT_FOLDER

del /s/q %DEST_FOLDER%\tags
rmdir /s/q %DEST_FOLDER%\tags
echo ---------------------

del /s/q %DEST_FOLDER%\blog
rmdir /s/q %DEST_FOLDER%\blog
echo ---------------------
  
@rem Deleting old pages folders content
set /a pagecounter=1
set PAGEROOT=%DEST_FOLDER%\page
:loopPages
set /a pagecounter=pagecounter+1
SET currPage=%PAGEROOT%%pagecounter%
if not exist %currPage% goto :loopYears
echo Deleting old %currPage% folder files ...
del /s/q %currPage%\*
rmdir /s/q %currPage%
echo ---------------------
goto :loopPages

@rem Deleting old years(and indirectly months) folders content
:loopYears
set /A startYear=2010
set /A yearsCounter=yearsCounter+1
SET /A currYear=%startYear%+%yearsCounter%
set currYearFolder=%DEST_FOLDER%\%currYear%
if not exist %currYearFolder% goto :looFolders
echo Deleting old %currYearFolder% folder files ...
del /s/q %currYearFolder%\*
rmdir /s/q %currYearFolder%
echo ---------------------
goto :loopYears


:looFolders

@rem Go over folders and copy only the relevant files and folders
for /F %%i in ('dir /AD /b %SRC%') do call :copyDir %SRC% %%i

echo Copying archives ...
copy %SRC%\archives_raw %DEST_FOLDER%\archives
echo Copying atom.xml ...
copy %SRC%\atom_raw.xml %DEST_FOLDER%\atom.xml
echo Copying blog ...
if not exist %DEST_FOLDER%\blog mkdir %DEST_FOLDER%\blog
copy %SRC%\blog_raw %DEST_FOLDER%\blog\index.html

echo ---------------------

@rem rename %DEST_FOLDER%\_posts %DEST_FOLDER%\posts
goto b4End

:copyDir
set currFolder=%2
set includeFolder=true
echo %EXCLUDED_DIRS% | findstr /c:%currFolder% >nul && set includeFolder=false||set includeFolder=true
if "%includeFolder%" == "true" (
  echo Copying %currFolder% folder from %1\%2 to %DEST_FOLDER%\%2\...
  xcopy /S/Y %1\%2 %DEST_FOLDER%\%2\
  echo Copied %currFolder% folder
  echo ---------------------
) else (
    @rem echo Ingoring %currFolder% folder
)

  
goto end


:b4End
if exist %DEST_FOLDER%\_posts rename %DEST_FOLDER%\_posts posts
if exist %DEST_FOLDER%\_plugins rename %DEST_FOLDER%\_plugins plugins
echo Copying %SRC%\homepage to %DEST_FOLDER%\index.html ...
copy /y %SRC%\homepage %DEST_FOLDER%\index.html
echo Copying %SRC%\guide\index_raw.html to %DEST_FOLDER%\guide\index.html ...
copy /y %SRC%\guide\index_raw.html %DEST_FOLDER%\guide\index.html
echo Copying %SRC%\guide\toc.html to %DEST_FOLDER%\_includes\toc.html ...
copy /y %SRC%\guide\toc.html %DEST_FOLDER%\_includes\toc.html
pause


:end


@rem rename something.txt someone.txt
