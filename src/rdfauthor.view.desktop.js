/**
 * This file is part of the RDFauthor project.
 * Author: Clemens Hoffmann <cannelony@gmail.com>
 * 
 * Creates a view object.
 * 
 * @constructor
 * @requires RDFauthor 2
 */
function DesktopView (options) {
  
  // default options
    var defaultOptions = {
      title: 'Edit Properties',
      saveButtonTitle: 'Save',
      cancelButtonTitle: 'Cancel',
      propertyButtonTitle: 'Add Property',
      container: 'body',
      showButtons: true,
      showPropertyButton: true,
      useAnimations: true,
      animationTime: 250, // ms
      domId: 'rdfauthor-view',
      contentContainerClass: 'rdfauthor-view-content'/*,
      replaceContainerContent: false*/
    };
  
  this._options = jQuery.extend(defaultOptions, options);
  
  this._view = this;
  this._activeTab = null;
  this._activeResource = null;
  this._rdfauthor = null;
  this._container = jQuery('#' + this._options.domId);
  this._modalSize = {};
  this._id = 1;
  this._subjectIds = {};
  this._subjectChoreoSet = {};
  
  var self = this;
  console.log(this._container);
  console.log(options);
  
  RDFauthor.getInstance(function(RDFauthorInstance) {
    self._rdfauthor = RDFauthorInstance;
  });
  
  function getHeader () {
    var header = '\
      <div class="modal-header">\
        <button type="button" class="icon-remove icon-modal-header" data-dismiss="modal" data-toggle="tooltip" data-placement="left" title="Close window"></button>\
        <button type="button" class="icon-fullscreen icon-modal-header fullscreen" data-toggle="tooltip" data-placement="left" title="Fullscreen/Minimize"></button>\
        <h4 class="modal-title">RDFauthor</h4>\
      </div>';
    return header;    
  }
  
  function getBody () {
    var body = '\
      <div class="modal-body">\
        <ul id="resource-tabs" class="nav nav-tabs">\
        </ul>\
        <div id="resource-tabs-content" class="tab-content">\
        </div>\
      </div>';
    return body;
  }
  
  function getFooter () {
    var footer = '\
      <div class="modal-footer">\
        <!-- consumer mode -->\
        <a href="#" class="btn btn-default consumer-mode" data-dismiss="modal">Close choreography</a>\
        <a href="#" class="btn btn-primary edit">Edit choreography</a>\
        <a href="#" class="btn btn-primary save-subject">Save</a>\
        <!-- edit mode-->\
        <a href="#" class="btn btn-default hide edit-mode cancel">Cancel</a>\
        <!-- <a href="#" class="btn hide edit-mode" data-dismiss="modal">Close all</a> -->\
        <a href="#" class="btn btn-primary hide save edit-mode">Save all resources</a>\
        <a href="#" class="btn btn-primary hide save edit-mode">Save resource</a>\
        <a href="#" class="btn btn-primary hide save edit-mode">Save choreography</a>\
      </div>';
    return footer;
  }
  
  function getView (options, callback) {
    var html = '\
    <div id="rdfauthor">\
      <div id="' + options.domId + '" class="modal fade consumer-mode">\
        <div class="modal-dialog">\
          <div class="modal-content">\
            ' + getHeader() + '\
            ' + getBody() + '\
            ' + getFooter() + '\
          </div>\
        </div>\
        </div>\
      </div>';
    if ($.isFunction(callback)) {
      callback(html, options);
    }
  }
  
  //view initialization
  getView(this._options, function(html, options) {
    $('body').append(html);
    

       
    $(document).on('shown.bs.tab', '#resource-tabs a', function(event) {
      console.log('shown', event.target.hash);
      self._activeTab = event.target.hash;
      self._activeResource = $(event.target.hash).attr('name');
      $(event.target.hash).find('.portlet-container').isotope('reLayout');
    });

    // hack for correct resizing and dragging
    // $('.modal-dialog').css("margin-right", 0);
    // $('.modal-dialog').css("margin-left", 0);
    
    var contentWidth = $('.modal-content').outerWidth();
    var contentHeight = $('.modal-content').outerHeight();
    $('#' + options.domId + ' .modal-content').resizable({ 
      minWidth: contentWidth,
      minHeight: contentHeight
    });
    
    $('.modal').on("drag resize", function(event, ui) {
      // hack for correct resizing and dragging
      $('.modal-dialog').css("margin-right", 0);
      $('.modal-dialog').css("margin-left", 0);
    });
    
    $('.modal-content').on('resize', function(event, ui) {
      
      var offsetWidth = ui.element.context.offsetWidth;
      var offsetHeight = ui.element.context.offsetHeight;
      var headerHeight = $(ui.element).find('.modal-header').outerHeight();
      var bodyHeight = $(ui.element).find('.modal-body').outerHeight();
      var footerHeight = $(ui.element).find('.modal-footer').outerHeight();
      var sumHeaderFooterHeight = headerHeight + footerHeight;
      // console.log(offsetHeight,bodyHeight+sumHeaderFooterHeight + 17);
      // console.log('footer', footerHeight);
      // console.log('header', headerHeight);
      // set width of modal-body
      $(ui.element).find('.modal-body').css('width', offsetWidth);
      // set height of modal-body
      $(ui.element).find('.modal-body').css('height', offsetHeight-sumHeaderFooterHeight-17);
    });     
       
    $('#' + options.domId + ' .modal-content').draggable({
      handle: '.modal-header',
      cursor: 'move'
    });
    
    
    
    $('.portlet-container').sortable({
      disabled : true
    }).disableSelection();
    $('.modal-header button').tooltip();
    
    /** bootstrap event */
    $('#' + options.domId).on('hidden.bs.modal', function () {
      console.log('hidden');
      //$('body').css('overflow', 'auto');
    });
    
    $('#' + options.domId).on('show.bs.modal', function () {
      console.log('shown');
    });
    
    /** jquery events */ 
    // Recource tabs + dropdown 
    $(document).on('click', '#resource-tabs a', function(event) {
      console.log('click on dropdown item');
      var subjectContentID = $(this).parents('.dropdown').find('a.tabs').attr('href');
      var subjectContent = $('#rdfauthor-view ' + subjectContentID);
      console.log('id', subjectContentID);
      console.log('content', subjectContent);
  
      if (!$(this).hasClass('disabled')) {
        // add portlet
        if($(this).hasClass('add-portlet')) {
          addPortlet(subjectContent);
        }
      }
      
    });
    
    $(document).on('click', '.tabs', function(event) {
      event.preventDefault();
      $(this).tab('show');
      // $(this).parent().dropdown('toggle');
    });
  
    var openTabDropdown = false;
    var tabDropdown = $('.tabs .dropdown');
    $(document).on('click', '.tabs i', function(event) {
      event.preventDefault();
      tabDropdown = $(this).parents('.dropdown');
      tabDropdown.toggleClass('open');
    });

    // manually open close dropdown on tabs' dropdown
    $('html').unbind('click').click(function(event){
      if ($('.nav-tabs li').hasClass('open') && openTabDropdown == false) {
        $('.nav-tabs li').removeClass('open');
      }
    });
    $('.nav-tabs .dropdown-menu').mouseover(function() {
      openTabDropdown = true;
    });
    $('.nav-tabs .dropdown-menu').mouseout(function() {
      openTabDropdown = false;
    });
    
    $(document).on('click', '.modal-footer a', function(event) {
      if ($(this).hasClass('edit') || $(this).hasClass('save') || $(this).hasClass('cancel')) {
        $(this).parent().find('.btn').toggleClass('hide');
      }
      
      // enable edit mode
      if ($(this).hasClass('edit')) {
        // enable disabled actions
        $('#' + options.domId).find('.disabled').toggleClass('disabled enabled');
        $('#' + options.domId).toggleClass('consumer-mode edit-mode');
        $('.portlet-container, .lportlet-content').sortable('option', 'disabled', false);
        // $('#rdfauthor-view input, #rdfauthor-view textarea').prop('disabled', false);
        // enableSettings();
      }
  
      // disable edit mode and save
      if ($(this).hasClass('save')) {
        // enable disabled actions
        $('#' + options.domId).find('.enabled').toggleClass('disabled enabled');
        $('#' + options.domId).toggleClass('consumer-mode edit-mode');
        $('.portlet-container, .portlet-content').sortable( 'option', 'disabled', true );
        // $('#rdfauthor-view input, #rdfauthor-view textarea').prop('disabled', true);
        // disableSettings();
//        saveChoreography();
      }
      // disable edit mode and don't save anything
      if ($(this).hasClass('cancel')) {
        // enable disabled actions
        $('#' + options.domId).find('.enabled').toggleClass('disabled enabled');
        $('#' + options.domId).toggleClass('consumer-mode edit-mode');
        $('.portlet-container, .portlet-content').sortable( 'option', 'disabled', true );
        // disableSettings();
//        restoreChoreography();
      }
    });
    
    // save event
    $(document).on('click', '#rdfauthor .modal-footer .save-subject', function(event) {
      self._view.saveResource(self._activeResource);
    });
    
  });
}

DesktopView.prototype = {
  
  
  addChoreographyToTab: function (tabId, choreoMarkup) {
    var self = this;
    var $container = self.getElement().find('#' + tabId).find('.portlet-container');
    var $newItems = $(choreoMarkup);
    $container.append($newItems).isotope('insert', $newItems);
  },
  
  addPortlet: function () {
    var markup = '';
  },
  
  addResource: function (subjectUri, label, subjectData, choreoSet) {
    var self = this;
    // log storedSubjects
    console.log('label calling addResources', label);
    console.log('subjectData calling addResources', subjectData);
    
    var divTab = '';
    var tabId = 'tab-' + self.getSubjectId(subjectUri);
    // add tabs
    self.addTabs(tabId, subjectUri, label);
    
    // init isotope
    var $container = self.getElement().find('#' + tabId).find('.portlet-container');
    $container.isotope({
      itemSelector: '.rdfauthor-portlet',
      itemPositionDataEnabled: true,
      transformsEnabled: true,
      animationEngine : 'jquery',
      onLayout: function() {
        $container.css('overflow', 'visible');
      }  
    });
    
    $container.sortable({
      cursor: 'move'
      //, tolerance: 'intersection'  //'pointer' is too janky
      , start: function(event, ui) {
        //add grabbing and moving classes as user has begun
        //REMOVE rdfauthor-class so that isotope does not try to sort our item,
        //resulting in the item moving around and flickering on 'change'
        ui.item.addClass('grabbing moving').removeClass('rdfauthor-portlet');
        
        
        
        ui.placeholder
          .addClass('starting') //adding the 'starting' class removes the transitions from the placeholder.
          //remove 'moving' class because if the user clicks on a tile they just moved,
          //the placeholder will have 'moving' class and it will mess with the transitions
          .removeClass('moving')
          //put placeholder directly below tile. 'starting' class ensures the
          //placeholder simply appears and does not 'fly' into place
          .css({
            top: ui.originalPosition.top
            , left: ui.originalPosition.left
          })
          ;
        //reload the items in their current state to override any previous
        //sorting and to include placeholder, but do NOT call a re-layout
        $container.isotope('reloadItems');                    
      }                
      , change: function(event, ui) {
        ui.item
          .css({
            top: ui.originalPosition.top
            , left: ui.originalPosition.left
        });
        
        //change only fires when the DOM is changed. the DOM changes when 
        //the placeholder moves up or down in the document order 
        //within the sortable container        
        
        //remove 'starting' class so that placeholder can now move smoothly
        //with the interface
        ui.placeholder.removeClass('starting');
        //reload items to include the placeholder's new position in the DOM. 
        //then when you sort, everything around the placeholder moves as 
        //though the item were moving it.
        $container
          .isotope('reloadItems')
          .isotope({ sortBy: 'original-order'})
        ;
      }
      , beforeStop: function(event, ui) {
        //in this event, you still have access to the placeholder. this means
        //you know exactly where in the DOM you're going to place your element.
        //place it right next to the placeholder. jQuery UI Sortable removes the
        //placeholder for you after this event, and actually if you try to remove
        //it in this step it will throw an error.
        ui.placeholder.after(ui.item);                    
      }
      , stop: function(event, ui) {      
        //user has chosen their location! remove the 'grabbing' class, but don't
        //kill the 'moving' class right away. because the 'moving' class is 
        //preventing your item from having transitions, you should keep it on
        //until isotope is done moving everything around. it will "snap" into place
        //right where your placeholder was.
        
        //also, you must add the 'rdfauthor-portlet' class back to the box so that isotope
        //will again include your item in its sorting list
        ui.item.removeClass('grabbing').addClass('rdfauthor-portlet');
        
        //reload the items again so that your item is included in the DOM order
        //for isotope to do its final sort, which actually won't move anything
        //but ensure that your item is in the right place
        $container
          .isotope('reloadItems')
          .isotope({ sortBy: 'original-order' }, function(){
            //finally, after sorting is done, take the 'moving' class off.
            //doing it here ensures that your item "snaps" and isn't resorted
            //from its original position. since this happens on callback,
            //if the user grabbed the tile again before callback is fired,
            //don't remove the moving class in mid-grab
            
            //for some reason in this code pen, the callback isn't firing predictably
            
            //console.log(ui.item.is('.grabbing')); 
            if (!ui.item.is('.grabbing')) {
              ui.item.removeClass('moving');                        
            }
          })
          ;
      }
    });
    
    // add choreographies to dom
    for (var i in choreoSet) {
      console.log('Choreography ' + i, choreoSet[i].choreographyUri());
      var choreoMarkup = choreoSet[i].markup(subjectData);
      self.addChoreographyToTab(tabId,choreoMarkup);
    }
    
    // save choreoset, used on save
    self._subjectChoreoSet[subjectUri] = choreoSet;
    
  },
  
  addTabs: function (tabId, subjectUri, label) {
    var self = this;
         
    var liTab = '\
      <li class="dropdown" name="' + subjectUri + '">\
        <a class="tabs dropdown-toggle" href="#' + tabId + '" data-toggle="dropdown">\
          ' + label + ' <i class="icon-cog settings"></i>\
        </a>\
        <ul class="dropdown-menu">\
          <li><a class="rename-portlet" href="#" data-toggle="tab"><i class="icon-pencil"></i> Rename</a></li>\
          <li><a class="disabled add-portlet" href="#" data-toggle="tab"><i class="icon-plus-sign"></i> Add Portlet</a></li>\
        </ul>\
      </li>';
    
    var divTab = '<div name="' + subjectUri + '" class="tab-pane subject" id="' + tabId + '">\
        <div class="portlet-container">\
        </div>\
      </div>';
      
    self.getElement().find('#resource-tabs').append(liTab);
    self.getElement().find('#resource-tabs-content').append(divTab);
    self.getElement().find('#resource-tabs a:first').tab('show');
    self.enableSettings();
    // $('.dropdown-toggle').dropdown();
    
  },
  
  center: function () {
    
  },
  
  close: function () {
    console.log('close');
  },
  
  getNumberOfPortlets: function () {
    
  },
  
  getElement: function () {
    return jQuery('#' + this._options.domId);
  },
  
  getSubjectId: function (subjectUri) {
    var self = this;
    if(this._subjectIds[subjectUri]) {
      return this._subjectIds[subjectUri];
    } else {
      var id = self.tabId();
      this._subjectIds[subjectUri] = id;
      return id;
    };
  },
  
  tabId: function () {
    return this._id++;
  },
  
  enableSettings: function () {
    // $('.portlet .settings, .tabs .settings, .portlet-entry .btn-group')
      // .toggleClass('hide-important');
    // $('.portlet input').toggleClass('input-fullsize input-size-135');
  
    $('.portlet').hover(function() {
      $(this).find('.settings').fadeTo(1,1);
    },function() {
      if($(this).parents('li').hasClass('open')) {
        $(this).find('.settings').fadeTo(1,1);
      } else {
        $(this).find('.settings').fadeTo(1,0);
      }  
    });
  
    $('.tabs').hover(function() {
      $(this).find('.settings').fadeTo(1,1);
    },function() {
      $(this).find('.settings').fadeTo(1,0);
    });
  
    $('.portlet-entry').hover(function() {
      $(this).find('.property-settings').fadeTo(1,1);
    },function() {
      if($(this).parents('li').hasClass('open')) {
        $(this).find('.property-settings').fadeTo(1,1);
      } else {
        $(this).find('.property-settings').fadeTo(1,0);
      }  
    });
  
  },
    
  minimize: function () {
    
  },
  
  reset: function () {
    
  },
  
  saveAll: function () {
    
  },
  
  saveResource: function (subjectUri) {
    var self = this;
    console.log('saveResource', subjectUri);
    console.log('saveResource choreo', self._subjectChoreoSet[subjectUri]);
    var choreoSet = self._subjectChoreoSet[subjectUri];
    for (var i in choreoSet) {
      choreoSet[i].submit();
    }
  },
  
  setSubjectId: function (subjectUri) {
    var self = this;
    this._subjectIds[subjectUri] = self.tabId();
  },
  
  show: function () {
    var self = this;
    console.log('show');
    
    self.getElement().modal({
      show: true
    });
    
    $(document).on('click', '.modal-header button', function(event) {
    if ($(this).hasClass('fullscreen')) {
      $(this).toggleClass('icon-fullscreen icon-resize-small');
      self.toggleFullscreen();
    }
    
    
    
    
    
  });
    
  },
  
  storeSize: function () {
    var self = this;
    var modal = self.getElement().find('.modal-dialog');
    // store values
    var modalSize = {
      'modal' : {
        'marginLeft' : -modal.outerWidth()/2,
          'marginTop' : -modal.outerHeight()/2,
          'height' : modal.outerHeight(),
          'width' : modal.outerWidth(),
          'top' : '50%',
          'left' : '50%'
      },
      'modalBody' : {
        'maxHeight' : modal.outerHeight()-$('.modal-header').outerHeight()-$('.modal-footer').outerHeight()
      }
    }
    
    console.log('modalSize', modalSize);
    
    // append values to rdfauthor view
    self._modalSize = modalSize;
  },
  
  toggleFullscreen: function () {
    var self = this;
    var modal = self.getElement().find('.modal-dialog');
    modal.toggleClass('fullscreen');
    
    
    if (modal.hasClass('fullscreen')) {
      self.storeSize();
      // modal.find('.modal-content').draggable('option', 'disabled', true);
      // modal.find('.modal-content').resizable('option', 'disabled', true);
      modal.css('width', '100%');
      modal.css('height', '100%');
      // modal.css("margin-left", -modal.outerWidth()/2);
      // modal.css("margin-top", -modal.outerHeight());
      // modal.css("top", "50%");
      // modal.css("left", "50%");
      // modal.find(".modal-body").each(function() {
        // var maxHeight = modal.height()-$('.modal-header').outerHeight()-$('.modal-footer').outerHeight()-20;
        // $(this).css("max-height", maxHeight);
        // $(this).find('.tab-pane').css('height', maxHeight);
        // $(this).find('.tab-pane').css('height', maxHeight-$('.modal-footer').outerHeight());
      // });
    } else {
      //TODO größe wiederherstellen
      var modalSize = self._modalSize;
      console.log('modalSize', modalSize);
      // modal.find('.modal-content').draggable('option', 'disabled', false);
      // modal.find('.modal-content').resizable('option', 'disabled', false);
      modal.find('.modal-content').css('width', modalSize.modal.width);
      modal.find('.modal-content').css('height',modalSize.modal.height);
      // modal.css("margin-left", modalSize.modal.marginLeft);
      // modal.css("margin-top", modalSize.modal.marginTop);
      // modal.css("top", "50%");
      // modal.css("left", "50%");
      modal.find(".modal-body").css('max-height', modalSize.modalBody.maxHeight);

    }
    
    // $(".modal-dialog").animate({ width: '100%', height: '700px'},300,'linear');
    
  },
  
  type: function () {
    return 'desktop';
  }
  
}
