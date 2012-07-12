// Define a sandbox in which to create the Gist loader jQuery plugin.
// This Gist loader only works with public gists. It will load all of
// the files (in a single request) and then return an array of loaded
// files (with the ability to access by file name).
(function( $ ){


	// I flag whether or not a stylesheet has been appending to the
	// current document. Since all Gist requests share the same
	// style, we can write it to the active document once and then
	// disregard all subsequent Link tags.
	var stylesheetIsEmbedded = false;


	// When the Gist comes back, the first call to the write() method
	// writes out the stylesheet. This takes the value and appends it
	// to the head of the document.
	var injectStyleSheet = function( value ){

		// Append the stylesheet Link tag.
		$( "head:first" ).append( value );

	};


	// I determind if the given Gist meta tag content is the name of
	// the parent Gist? Or, if this is just a control meta tag.
	var isFilenameMetaTag = function( metaTag ){

		// Create a pattern that will find the meta tags that are NOT
		// proper file names.
		var controlText = new RegExp(
			"^\\s*(view raw|this gist|github)",
			"i"
		);

		// Return true if the given text does NOT contain an action
		// text (that is, if the control text cannot be found in the
		// given text).
		return( metaTag.text().search( controlText ) === -1 );

	};


	// I take the Gist content, parse it into HTML, and return the
	// collection of Gist files, indexed by order and by filename.
	var parseGistContent = function( value ){

		// Create a hash of Gist files.
		var files = {};

		// We'll also want to list the files by Index, if the user
		// wants that information.
		files.ordered = [];

		// Parse the Gist HTML in a local DOM tree.
		var gistContent = $( value );

		// Get all of the files in the gist.
		gistContent.find( "div.gist-file" ).each(
			function(){

				// Get a jQuery reference to the current gist node.
				var gistFile = $( this );

				// Get the name of the file. For this, we will return
				// the content of the first Meta anchor that doesn't
				// contain a syntactic link.
				var metaTags = gistFile.find( "div.gist-meta a" )
					.filter(
						function(){

							// Only keep this value if it doesn't
							// contain a useless value.
							return( isFilenameMetaTag( $( this ) ) );

						}
					)
				;

				// Get the file name from the first filtered Meta
				// anchor tag.
				var fileName = $.trim( metaTags.first().text() );

				// Get the content of the file. Each file will need
				// to be re-wrapped in its own Gist div.
				var content = $( "<div class='gist'></div>" )
					.append( gistFile )
				;

				// Add the file the collection, indexed by name.
				files[ fileName ] = {
					fileName: fileName,
					content: content
				};

				// Add this file to the "ordered" list as well.
				files.ordered.push( files[ fileName ] );

			}
		);

		// Return the Gist file collection.
		return( files );

	};


	// ------------------------------------------------------ //
	// ------------------------------------------------------ //


	// Define the actual script loader.
	$.getGist = function( gistID ){

		// Create a deferred value for our Gist content.
		var result = $.Deferred();

		// Create a blank iframe. This will be used to actually load
		// the Gist in another document context so that we dont'
		// corrupt the active document.
		var iframe = $( "<iframe id='tmpGist' src='about:blank'></iframe>" )
			.hide()
			.prependTo( "html" )
		;

		// Get the iframe document.
		//var iframeDocument = iframe[ 0 ].contentWindow.document;
		var iframeDocument = $("#tmpGist");

		// Create a function that will handle the first write defined
		// by the gist (writing the stylesheet).
		var writeStyleSheet = function( value ){

			// Check to make sure the stylesheet is not yet embedded.
			if (!stylesheetIsEmbedded){

				// Inject the stylesheet.
				injectStyleSheet( value );

				// Flag the stylesheet as having been injected.
				stylesheetIsEmbedded = true;

			}

			// Change the proxy write method.
			iframeDocument.proxyWrite = writeGistContent;

		};

		// Create a function that will handle the second write
		// defined by the gist (writing the Gist content).
		var writeGistContent = function( value ){

			// Detach the iframe - we no longer need it.
			delete( iframeDocument.proxyWrite );
			iframe.remove();

			// Parse the gist content into files.
			var files = parseGistContent( value );

			// Resolve the files promise.
			result.resolve( files );

		};

		// Assign the first write proxy.
		iframeDocument.proxyWrite = writeStyleSheet;

		// Now that we have our proxy method hooked up, let's inject
		// the Gist script into the iFrame. Notice that we are
		// overriding the iframe's document.write() method to always
		// point to the proxyWrite() method. This way, we can reassign
		// the proxyWrite() binding without changing document.write()
		// more than once.
		var markupBuffer = [
			"<script type='text/javascript'>",
				"document.write = function( value ){",
					"document.proxyWrite( value );",
				"};",
			"</script>",
			"<script",
				"type='text/javascript'",
				"src='https://gist.github.com/" + gistID + ".js'>",
			"</script>"
		];

		// Write the new content to the iframe.
		iframeDocument.write(
			markupBuffer.join( " " )
		);

		// Return the promise of the gist.
		return( result.promise() );
	};
})( jQuery );