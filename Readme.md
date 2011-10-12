RDFauthor Readme
================

Requirements
------------

To make use of RDFauthor your web project must meet the following requirements:

- [RDFa](http://www.w3.org/TR/xhtml-rdfa-primer/) must be used to embed RDF triples
  in your XHTML markup.
- The triple store where your data comes from must provide a SPARQL/Update endpoint.
- The URI of the update endpoint must be embedded in the page using our
  [update vocabulary](http://ns.aksw.org/update/).

Installation
------------

RDFauthor is a JavaScript library, hence no installation is needed.

Using RDFauthor within your Project
--------------------------------------

Three steps are required in order to use RDFauthor within your project.

1. Embed provenance information (as RDFa) for named graphs in your page. If you don't use
   named graphs, the URI of the page is used as the graph URI.
2. Define a global JavaScript variable named `RDFAUTHOR_BASE` that contains the URI of 
   RDFauthor on your web server (e.g. `http://example.com/MyWebApp/lib/rdfauthor/`).
3. Define another global variable called `RDFAUTHOR_READY_CALLBACK` which contains a function
   to be executed when RDFauthor has finished loading. Typical usage is calling 
   `setOptions()` and `start()`:

        RDFAUTHOR_READY_CALLBACK = function () {
            // RDFauthor is now loaded and ready to use
            RDFauthor.setOptions({});
            RDFauthor.start();
        };

4. Include `rdfauthor.js` (found under `RDFAUTHOR_BASE`) lazily.

API Documentation
-----------------
RDFauthor's API documentation can be built with 
[JsDoc Toolkit](http://code.google.com/p/jsdoc-toolkit/).
You need to set two environment variables:

- set `$JSDOCDIR` to the path under which you installed JsDoc (e.g. `/opt/local/jsdoc-toolkit`).
- set `$JSDOCTEMPLATEDIR` to RDFauthor's documentation template dir (e.g. `/opt/local/rdfauthor/misc/jsdoc-template`). The template dir is located under `misc/jsdoc-templates` in your RDFauthor dir.

Assuming `jsrun.sh` is available in you path, you can run JsDoc from within the 
RDFauthor directory using the following command:

    jsrun.sh -d=./doc ./src

This will build the API documentation in a diectory named `doc` under your RDFauthor 
directory.
