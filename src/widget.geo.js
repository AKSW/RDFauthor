/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>,
 *         Clemens Hoffmann <cannelony@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.disclosureID = 'disclosure-' + RDFauthor.nextID();
        this.datatype = 'http://www.w3.org/2001/XMLSchema#decimal';
        this._openLayersLoaded = false;
        this._domRdy = false;
        this._osmLoaded = false;
        this._bingLoaded = false;
        this._googleLoaded = false;

        var self = this;
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.geo.css');

        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/openlayers/OpenLayers.js', function(){
            // load OpenLayer Stylesheet
            RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/openlayers/theme/default/style.css');
            self._openLayersLoaded = true;
            self._initGeo();
            // load OpenStreetMap
            RDFauthor.loadScript('http://openstreetmap.org/openlayers/OpenStreetMap.js', function() {
                self._osmLoaded = true;
                self._initGeo();
            });
            // load Google Maps
            RDFauthor.loadScript('http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAjpkAC9ePGem0lIq5XcMiuhR_wWLPFku8Ix9i2SXYRVK3e45q1BQUd_beF8dtzKET_EteAjPdGDwqpQ', function() {
                self._googleLoaded = true;
                self._initGeo();
            });
            // load Bing Maps
            RDFauthor.loadScript('http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2&mkt=en-us', function() {
                self._bingLoaded = true;
                self._initGeo();
            });

        });

    },

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        this._domRdy = true
        this.element().data('id',this.ID);
        this.element().data('geo-widget', 'geo-widet-'+this.ID);
        this._initGeo();
        
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#geo-edit-' + this.ID);
    },

    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the
    // return value of element().
    focus: function () {},
    */

    // return your widget's markup code here
    markup: function () {
        var markup =
            '<div class="container2" style="width:100%">\
              <input type="text" style="width:50%" class="text" id="geo-edit-' + this.ID + '" value="'
                  + (this.statement.hasObject() ? this.statement.objectValue() : '') + '" name="'
                  + this.statement.predicateLabel() + '"/>\
              <div class="geo-widget" id="geo-widget-'+ this.ID+'" style="display: none;">\
                <label>Locate: </label><input type="text" style="width:90%" class="text" id="geo-widget-search-' + this.ID + '">\
                <div id="map-'+this.ID+'" class="smallmap" style="width:99%;height:200px;border:1px solid #ccc;"></div>\
              </div>\
            </div>\
            ';

        return markup;
    },

    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());

            var somethingChanged = (
                this.statement.hasObject() &&
                    this.statement.objectValue() !== this.value()
            );

            var isNew = !this.statement.hasObject() && (null !== this.value());

            if (somethingChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(String(rdfqTriple));
                }
            }

            if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
                try {
                    var newStatement = this.statement.copyWithObject({
                        value: this.value(),
                        options: {datatype: this.datatype},
                        type: 'literal'
                    });
                    databank.add(newStatement.asRdfQueryTriple());
                } catch (e) {
                    var msg = e.message ? e.message : e;
                    alert('Could not save literal for the following reason: \n' + msg);
                    return false;
                }
            }
        }

        return true;
    },

    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    value: function () {
        var value = $('#geo-edit-' + this.ID).val();
        if (String(value) > 0) {
            return value;
        }

        return null;
    },

    _initOpenLayers: function (mapid, lon, lat) {
        var map, markers;
        var zoom = 6;

        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
            },

            initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend(
                    {}, this.defaultHandlerOptions
                );
                OpenLayers.Control.prototype.initialize.apply(
                    this, arguments
                ); 
                this.handler = new OpenLayers.Handler.Click(
                    this, {
                        'click': this.trigger
                    }, this.handlerOptions
                );
            }, 

            trigger: function(e) {
                var lonlat = map.getLonLatFromViewPortPx(e.xy).transform(
                   new OpenLayers.Projection("EPSG:900913"), 
                   new OpenLayers.Projection("EPSG:4326")
                );

                // alert("You clicked near " + lonlat.lat + " N, " +
                                          // + lonlat.lon + " E");

                $('input[name]').each(function(i) {
                    switch($(this).attr('name')){
                        case 'long' : lon = $(this).val(lonlat.lon);
                            break;
                        case 'lat'  : lat = $(this).val(lonlat.lat);
                            break;
                    }
                });

            }

        });

        map = new OpenLayers.Map('map-'+mapid, {
            displayProjection: new OpenLayers.Projection("EPSG:4326")
        });

        // var satellite = new OpenLayers.Layer.Google(
          // "Google Satellite" , {type: G_SATELLITE_MAP}
        // );

        var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                      "http://vmap0.tiles.osgeo.org/wms/vmap0",
                      {layers: 'basic'} );

        var shared = new OpenLayers.Layer.VirtualEarth("Bing", {
            type: VEMapStyle.Shaded
        });

        var layer_mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");

        var layer_cyclemap = new OpenLayers.Layer.OSM.CycleMap("Cyle");

        var gmap = new OpenLayers.Layer.Google(
            "Google Streets", // the default
            {numZoomLevels: 20}
        );

        map.addLayers([layer_mapnik, layer_cyclemap]);
        markers = new OpenLayers.Layer.Markers( "Markers" );
        map.addLayer(markers);

        var size = new OpenLayers.Size(21,25);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon(RDFAUTHOR_BASE + 'libraries/openlayers/img/marker.png',size,offset);

        markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(lon,lat).transform(
            new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject()
        ),icon)); 

        map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
            new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject()
        ), zoom);
        map.addControl( new OpenLayers.Control.LayerSwitcher() );
        map.addControl( new OpenLayers.Control.MousePosition() );

        var click = new OpenLayers.Control.Click();
        map.addControl(click);
        click.activate();
    },

    _initGeo: function () {
        // alert('OLL '+this._openLayersLoaded+' GL '+this._googleLoaded+' OSML '+this._osmLoaded+' BL '+this._bingLoaded+' DL '+this._domRdy);
        var self = this;
        if (this._openLayersLoaded && this._googleLoaded && 
            this._osmLoaded && this._bingLoaded && this._domRdy) {
            self.element().click(function() {
                var mapid = self.element().data('id');
                var lon, lat;
                self.element().next().show();
                $('input[name]').each(function(i) {
                    switch($(this).attr('name')){
                        case 'long' : lon = $(this).val();
                            break;
                        case 'lat'  : lat = $(this).val();
                            break;
                    }
                });
                self._initOpenLayers(mapid,lon,lat);
            });
        }
    }
}, {
        name: 'property',
        values: ['http://www.w3.org/2003/01/geo/wgs84_pos#long','http://www.w3.org/2003/01/geo/wgs84_pos#lat']
    }
);
