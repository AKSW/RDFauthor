/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 *         Clemens Hoffmann <cannelony@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.datatype = 'http://ns.ontowiki.net/SysOnt/markdown';
        this._domRdy = false;
        this._markitupRdy = false;
        var self = this;
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/markitup/sets/default/style.css');
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/markitup/skins/markitup/style.css');
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/markitup/jquery.markitup.js', function () {
           self._markitupRdy = true;
           self._init();
        });

        this._settings = {	
          onShiftEnter:  	{keepDefault:false, replaceWith:'<br />\n'},
          onCtrlEnter:  	{keepDefault:false, openWith:'\n<p>', closeWith:'</p>'},
          onTab:    		{keepDefault:false, replaceWith:'    '},
          markupSet:  [ 	
            {name:'Bold', key:'B', openWith:'(!(<strong>|!|<b>)!)', 
             closeWith:'(!(</strong>|!|</b>)!)' },
            {name:'Italic', key:'I', openWith:'(!(<em>|!|<i>)!)', 
             closeWith:'(!(</em>|!|</i>)!)'  },
            {name:'Stroke through', key:'S', openWith:'<del>', 
             closeWith:'</del>' },
            {separator:'---------------' },
            {name:'Picture', key:'P', 
             replaceWith:'<img src="[![Source:!:http://]!]" alt="[![Alternative text]!]" />' },
            {name:'Link', key:'L', 
             openWith:'<a href="[![Link:!:http://]!]"(!( title="[![Title]!]")!)>', 
             closeWith:'</a>', placeHolder:'Your text to link...' },
            {separator:'---------------' },
            {name:'Clean', className:'clean', replaceWith:function(markitup) { 
                  return markitup.selection.replace(/<(.*?)>/g, "") 
              } 
            },
            {name:'Preview', className:'preview',  call:'preview'}
          ]
        };
    },
    
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        var self = this;
        self._domRdy = true;
        self._init();
    },
    
    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#markdown-edit-' + this.ID);
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
            '<div class="container" style="width:100%">\
                <textarea class="text markItUp" id="markdown-edit-' + this.ID + '">' 
                + (this.statement.hasObject() ? this.statement.objectValue() : '') + '</textarea>\
            </div>';
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
        var value = this.element().val();
        console.log(value);
        if (String(value).length > 0) {
            return value;
        }
        
        return null;
    },

    _init: function () {
       var self = this;
       console.log('called '+self._domRdy+self._markitupRdy);
       if (self._domRdy && self._markitupRdy) {
          console.log(self._settings);
          self.element().markItUp(self._settings);
       }
    }
}, {
        name: 'datatype',
        values: ['http://ns.ontowiki.net/SysOnt/markdown'],
        callback : function () {
            $.typedValue.types['http://ns.ontowiki.net/SysOnt/markdown'] = {
                regex: /^.*$/,
                strip: true,
                /** @ignore */
                value: function (v, options) {
                  var opts = $.extend({}, $.typedValue.defaults, options);
                  return v;
                }
            };
        }
    }
);
