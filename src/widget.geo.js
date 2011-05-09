/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.disclosureID = 'disclosure-' + RDFauthor.nextID();
        this.datatype = 'http://www.w3.org/2001/XMLSchema#decimal';
        this._OpenLayersLoaded = false;
        this._DomRdy = false;

        var self = this;
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.geo.css');
        RDFauthor.loadStylesheet('http://dev.openlayers.org/releases/OpenLayers-2.10/theme/default/style.css');

        RDFauthor.loadScript('http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAjpkAC9ePGem0lIq5XcMiuhR_wWLPFku8Ix9i2SXYRVK3e45q1BQUd_beF8dtzKET_EteAjPdGDwqpQ');
        RDFauthor.loadScript('http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2&mkt=en-us');
        RDFauthor.loadScript('http://openlayers.org/api/OpenLayers.js', function(){
            self._OpenLayersLoaded = true;
            self._initGeo();
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
                  + (this.statement.hasObject() ? this.statement.objectValue() : '') + '"/>\
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
        // var lon = 12;
        // var lat = 51;
        map = new OpenLayers.Map('map-'+mapid);

        // var satellite = new OpenLayers.Layer.Google(
          // "Google Satellite" , {type: G_SATELLITE_MAP}
        // );

        var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                      "http://vmap0.tiles.osgeo.org/wms/vmap0",
                      {layers: 'basic'} );

        var shared = new OpenLayers.Layer.VirtualEarth("Shaded", {
            type: VEMapStyle.Shaded
        });

        var gmap = new OpenLayers.Layer.Google(
            "Google Streets", // the default
            {numZoomLevels: 20}
        );

        map.addLayers([shared,wms]);
        markers = new OpenLayers.Layer.Markers("markers");
        map.addLayer(markers);

        map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
        map.addControl( new OpenLayers.Control.LayerSwitcher() );
        map.addControl( new OpenLayers.Control.MousePosition() );
    },
    _initGeo: function () {
        var self = this;
        if (this._OpenLayersLoaded && this._domRdy) {
            self.element().click(function() {
                // alert(self.element().data('geo-widget'));
                var mapid = self.element().data('id');
                self.element().next().show();
                self._initOpenLayers(mapid,12,51);
                // $(this).parent().parent().find('.widget-geo').show();
                //this.initOpenLayers();
                // var map, markers;
                // var zoom = 6;
                // var lon = 12;
                // var lat = 51;
                // map = new OpenLayers.Map('map');
                // var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                              // "http://vmap0.tiles.osgeo.org/wms/vmap0",
                              // {layers: 'basic'} );
                // map.addLayers([wms]);
                // markers = new OpenLayers.Layer.Markers("markers");
                // map.addLayer(markers);

                // map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
                // map.addControl( new OpenLayers.Control.LayerSwitcher() );
                // map.addControl( new OpenLayers.Control.MousePosition() );
            });
        }
    }
}, {
        name: 'datatype',
        values: ['http://www.w3.org/2001/XMLSchema#decimal']
    }
);
